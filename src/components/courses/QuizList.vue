<template>
  <div class="quiz-list-container">
    <!-- Loading state -->
    <FetchingData v-if="loading"></FetchingData>

    <!-- Error state -->
    <div v-else-if="error" class="py-8">
      <el-empty description="Error loading quizzes">
        <template #extra>
          <el-button type="primary" @click="fetchQuizzes">Try Again</el-button>
        </template>
      </el-empty>
    </div>

    <!-- No quizzes state -->
    <div v-else-if="quizzes.length === 0" class="py-8">
      <el-empty description="No quizzes available for this course yet">
        <template #extra>
          <el-button type="primary" @click="fetchQuizzes">Refresh</el-button>
        </template>
      </el-empty>
    </div>

    <!-- Quizzes list -->
    <div v-else class="quizzes-grid mt-4">
      <div v-for="quiz in quizzes" :key="quiz._id" class="quiz-card">
        <el-card shadow="hover" class="h-full" v-if="quiz.draft">
          <div class="quiz-card-content">
            <div class="quiz-header">
              <h3 class="text-xl font-semibold mb-2">{{ quiz.title }}</h3>
              <div class="quiz-meta flex items-center text-sm text-gray-500 mb-4">
                <span class="mr-4">
                  <i class="material-icons text-sm mr-1">help_outline</i>
                  {{ quiz.questions.length }} questions
                </span>
                <span v-if="quiz.timeLimit">
                  <i class="material-icons text-sm mr-1">timer</i>
                  {{ quiz.timeLimit }} minutes
                </span>
                <span v-else>
                  <i class="material-icons text-sm mr-1">timer_off</i>
                  No time limit
                </span>
              </div>
            </div>
            <p class="quiz-description text-gray-700 mb-4">
              {{ quiz.description || 'No description provided' }}
            </p>

            <!-- Quiz attempt status - Enhanced to be more prominent -->
            <div v-if="getUserAttemptForQuiz(quiz._id)" class="quiz-attempt-status mb-4 p-4 rounded-lg border"
              :class="getUserAttemptForQuiz(quiz._id)?.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              <div class="flex items-center mb-2">
                <i class="material-icons mr-2 text-2xl"
                  :class="getUserAttemptForQuiz(quiz._id)?.passed ? 'text-green-500' : 'text-red-500'">
                  {{ getUserAttemptForQuiz(quiz._id)?.passed ? 'check_circle' : 'cancel' }}
                </i>
                <div>
                  <p class="font-medium text-lg">
                    {{ getUserAttemptForQuiz(quiz._id)?.passed ? 'Quiz Passed' : 'Quiz Not Passed' }}
                  </p>
                  <p class="text-md font-bold">
                    Your Score: {{ getUserAttemptForQuiz(quiz._id)?.score }}%
                  </p>
                </div>
              </div>
              <div class="text-sm text-gray-600">
                <p v-if="getUserAttemptForQuiz(quiz._id)?.passed">
                  Quiz passed! View results or retake to improve your score.
                </p>
                <p v-else>
                  Score below {{ quiz.passingScore || 60 }}%. Try again to improve.
                </p>
              </div>
            </div>

            <div class="quiz-actions mt-auto">
              <!-- No attempt yet -->
              <el-button round size="large" v-if="!getUserAttemptForQuiz(quiz._id)" type="primary"
                @click="startQuiz(quiz)">
                <i class="material-icons mr-1">play_arrow</i>
                Start Quiz
              </el-button>

              <!-- Has attempt (regardless of pass/fail status) -->
              <div v-else class="flex flex-wrap gap-2">
                <el-button round size="large" type="success" @click="viewQuizResults(quiz)">
                  <i class="material-icons mr-1">visibility</i>
                  View Results
                </el-button>

                <!-- <el-button
                  type="warning"
                  @click="startQuiz(quiz)"
                >
                  <i class="material-icons mr-1">replay</i>
                  Retake Quiz
                </el-button> -->
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Quiz Modal -->
    <el-dialog v-model="quizModalVisible" :title="currentQuiz?.title || 'Quiz'" width="80%"
      :before-close="handleCloseQuizModal" :close-on-click-modal="false" :close-on-press-escape="!quizInProgress"
      :show-close="!quizInProgress" destroy-on-close>
      <QuizDetail v-if="currentQuiz" :quiz="currentQuiz" :key="`quiz-detail-${refreshKey}`"
        @quiz-completed="handleQuizCompleted" @quiz-started="handleQuizStarted" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { ElDialog, ElButton, ElEmpty, ElCard } from 'element-plus';
import type { Quiz } from '@/types/quiz';
interface QuizAttempt {
  _id: string;
  quizId: string | Quiz | { _id: string };
  userId: string;
  answers: number[];
  timeSpent: number;
  score: number;
  passed: boolean;
  createdAt?: string;
}
import { getQuizzesByCourse, getUserQuizAttempts } from '@/api/user/quiz.api';
import QuizDetail from '@/components/quiz/QuizDetail.vue';
import FetchingData from '@/components/FetchingData.vue';

const props = defineProps<{
  courseId: string;
}>();

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const loading = ref(true);
const error = ref(false);
const quizzes = ref<Quiz[]>([]);
const quizAttempts = ref<QuizAttempt[]>([]);
const quizModalVisible = ref(false);
const currentQuiz = ref<Quiz | null>(null);
const quizInProgress = ref(false);
const refreshKey = ref(0); // Add a refresh key to force re-render of QuizDetail

// Fetch quizzes for the course
const fetchQuizzes = async () => {
  loading.value = true;
  error.value = false;

  try {
    const data = await getQuizzesByCourse(props.courseId);
    quizzes.value = data;

    // Fetch user's quiz attempts if user is logged in
    if (authStore.user && authStore.user._id) {
      await fetchUserQuizAttempts();
    }
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    error.value = true;
    notificationStore.showError('Failed to load quizzes', 'Error');
  } finally {
    loading.value = false;
  }
};

// Fetch user's quiz attempts
const fetchUserQuizAttempts = async () => {
  if (!authStore.user || !authStore.user._id) return;

  try {
    const attempts = await getUserQuizAttempts(authStore.user._id);
    quizAttempts.value = attempts;
    console.log('User quiz attempts:', attempts); // Log for debugging
  } catch (err) {
    console.error('Error fetching quiz attempts:', err);
    notificationStore.showError('Failed to load your quiz attempts', 'Error');
  }
};

// Get user's attempt for a specific quiz
const getUserAttemptForQuiz = (quizId: string): QuizAttempt | undefined => {
  if (!quizAttempts.value || quizAttempts.value.length === 0) return undefined;

  return quizAttempts.value.find(attempt => {
    // Handle both string quizId and object with _id
    const attemptQuizId = typeof attempt.quizId === 'string'
      ? attempt.quizId
      : (attempt.quizId as { _id: string })._id;

    return attemptQuizId === quizId;
  });
};

// Start a quiz
const startQuiz = (quiz: Quiz) => {
  currentQuiz.value = quiz;
  refreshKey.value++; // Increment refresh key to force re-render
  quizModalVisible.value = true;
};

// View quiz results
const viewQuizResults = (quiz: Quiz) => {
  currentQuiz.value = quiz;
  refreshKey.value++; // Increment refresh key to force re-render
  quizModalVisible.value = true;
};

// Handle quiz started
const handleQuizStarted = () => {
  quizInProgress.value = true;
};

// Handle quiz completed
const handleQuizCompleted = async (result: { score: number; passed: boolean; silent?: boolean }) => {
  quizInProgress.value = false;

  // Only show notification if not silent (not just closing the dialog)
  if (!result.silent) {
    // Show success notification
    notificationStore.showSuccess(`Quiz completed! Your score: ${result.score}%`, 'Quiz Result');

    // Wait a moment before refreshing data to ensure backend has processed the attempt
    setTimeout(async () => {
      // Refresh quiz attempts to update the UI
      if (authStore.user && authStore.user._id) {
        await fetchUserQuizAttempts();
        console.log('Refreshed quiz attempts after completion');
      }
    }, 1000); // Increased timeout to ensure backend processing
  }

  // Close the modal
  quizModalVisible.value = false;
};

// Handle close quiz modal
const handleCloseQuizModal = () => {
  if (quizInProgress.value) {
    // Confirm before closing if quiz is in progress
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      quizModalVisible.value = false;
      quizInProgress.value = false;
    }
  } else {
    quizModalVisible.value = false;
  }
};

// Watch for courseId changes
watch(() => props.courseId, (newCourseId) => {
  if (newCourseId) {
    fetchQuizzes();
  }
});

// Watch for auth changes
watch(() => authStore.user, (newUser) => {
  if (newUser && newUser._id) {
    fetchUserQuizAttempts();
  }
});

onMounted(() => {
  if (props.courseId) {
    fetchQuizzes();
  }
});
</script>

<style scoped>
.quiz-list-container {
  padding: 1rem 0;
}

.quizzes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.quiz-card {
  height: 100%;
}

.quiz-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.quiz-actions {
  margin-top: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
