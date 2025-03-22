<template>
  <div class="quiz-detail-container">
    <!-- Quiz not started yet and no existing attempt -->
    <div v-if="!quizStarted && !existingAttempt" class="quiz-intro">
      <div class="quiz-info mb-6">
        <h3 class="text-xl font-semibold mb-2">{{ quiz.title }}</h3>
        <p class="text-gray-700 mb-4">{{ quiz.description || 'No description provided' }}</p>

        <div class="quiz-meta grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="quiz-meta-item p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <i class="material-icons mr-2 text-purple-600">help_outline</i>
              <span class="font-medium">Questions:</span>
            </div>
            <p class="ml-8 mt-1">{{ quiz.questions.length }} questions</p>
          </div>

          <div class="quiz-meta-item p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <i class="material-icons mr-2 text-purple-600">timer</i>
              <span class="font-medium">Time Limit:</span>
            </div>
            <p class="ml-8 mt-1">{{ quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit' }}</p>
          </div>

          <div class="quiz-meta-item p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <i class="material-icons mr-2 text-purple-600">grade</i>
              <span class="font-medium">Passing Score:</span>
            </div>
            <p class="ml-8 mt-1">{{ quiz.passingScore ? `${quiz.passingScore}%` : 'No passing score set' }}</p>
          </div>
        </div>
      </div>

      <div class="quiz-rules mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-semibold mb-2 flex items-center">
          <i class="material-icons mr-2 text-blue-600">info</i>
          Quiz Rules
        </h4>
        <ul class="list-disc ml-8 text-gray-700">
          <li>You must complete the quiz in one session</li>
          <li>Each question has only one correct answer</li>
          <li v-if="quiz.timeLimit">You have {{ quiz.timeLimit }} minutes to complete the quiz</li>
          <li v-if="quiz.passingScore">You need {{ quiz.passingScore }}% to pass this quiz</li>
        </ul>
      </div>

      <div class="quiz-start-actions text-center mt-8">
        <el-button round type="primary" size="large" @click="startQuiz">
          <i class="material-icons mr-2">play_arrow</i>
          Start Quiz
        </el-button>
      </div>
    </div>

    <!-- Existing attempt results -->
    <div v-else-if="existingAttempt && !quizStarted" class="quiz-completed">
      <div class="result-summary text-center mb-8">
        <div class="result-icon mb-4">
          <i class="material-icons text-6xl" :class="existingAttempt.passed ? 'text-green-500' : 'text-red-500'">
            {{ existingAttempt.passed ? 'check_circle' : 'cancel' }}
          </i>
        </div>

        <h3 class="text-2xl font-bold mb-2">
          {{ existingAttempt.passed ? 'Congratulations!' : 'Quiz Completed' }}
        </h3>

        <p class="text-xl mb-4">
          Your Score: <span class="font-bold">{{ existingAttempt.score }}%</span>
          <span v-if="quiz.passingScore" class="text-sm ml-2">
            (Passing: {{ quiz.passingScore }}%)
          </span>
        </p>

        <p v-if="existingAttempt.passed" class="text-green-600">
          You have successfully passed this quiz!
        </p>
        <p v-else-if="quiz.passingScore" class="text-red-600">
          You did not reach the passing score.
        </p>
      </div>

      <!-- Results breakdown -->
      <div class="results-breakdown mb-8">
        <h4 class="text-lg font-semibold mb-4">Question Results</h4>

        <div class="questions-results space-y-4">
          <div v-for="(question, index) in quiz.questions" :key="index" class="question-result p-4 rounded-lg" :class="{
            'bg-green-50 border-l-4 border-green-500': existingAttempt.answers[index] === question.correctOptionIndex,
            'bg-red-50 border-l-4 border-red-500': existingAttempt.answers[index] !== question.correctOptionIndex
          }">
            <div class="flex items-start">
              <div class="result-indicator mr-3 mt-1">
                <i class="material-icons" :class="{
                  'text-green-500': existingAttempt.answers[index] === question.correctOptionIndex,
                  'text-red-500': existingAttempt.answers[index] !== question.correctOptionIndex
                }">
                  {{ existingAttempt.answers[index] === question.correctOptionIndex ? 'check_circle' : 'cancel' }}
                </i>
              </div>

              <div class="question-content flex-1">
                <p class="font-medium mb-2">{{ index + 1 }}. {{ question.text }}</p>

                <div class="options-list space-y-1 ml-4">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="text-sm" :class="{
                    'text-green-700 font-medium': optIndex === question.correctOptionIndex,
                    'text-red-700 font-medium': optIndex === existingAttempt.answers[index] && optIndex !== question.correctOptionIndex
                  }">
                    <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}.</span> {{ option }}
                    <span v-if="optIndex === question.correctOptionIndex" class="ml-2 text-green-600">
                      (Correct Answer)
                    </span>
                    <span
                      v-else-if="optIndex === existingAttempt.answers[index] && optIndex !== question.correctOptionIndex"
                      class="ml-2 text-red-600">
                      (Your Answer)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="quiz-completed-actions text-center mt-8">
        <el-button round size="large" type="default" @click="closeQuiz">
          Close
        </el-button>
        <!-- <el-button round size="large" type="warning" @click="retakeQuiz">
          <i class="material-icons mr-2">replay</i>
          Retake Quiz
        </el-button> -->
      </div>
    </div>

    <!-- Quiz in progress -->
    <div v-else-if="!quizCompleted" class="quiz-in-progress">
      <!-- Timer display if time limit exists -->
      <div v-if="quiz.timeLimit" class="quiz-timer mb-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
        <span class="font-medium">Time Remaining:</span>
        <span class="font-bold" :class="{ 'text-red-600': timeRemaining < 60 }">
          {{ formatTime(timeRemaining) }}
        </span>
      </div>

      <!-- Progress indicator -->
      <div class="quiz-progress mb-6">
        <div class="flex justify-between mb-2">
          <span>Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</span>
          <span>{{ Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) }}% Complete</span>
        </div>
        <el-progress :percentage="Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)"
          :stroke-width="10" color="#6366f1" />
      </div>

      <!-- Current question -->
      <div class="current-question mb-8 p-6 bg-white rounded-lg shadow-sm">
        <h3 class="text-xl font-semibold mb-4">{{ currentQuestion.text }}</h3>

        <div class="options-list space-y-3">
          <div v-for="(option, index) in currentQuestion.options" :key="index"
            class="option-item p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'border-purple-500 bg-purple-50': selectedOption === index }" @click="selectOption(index)">
            <div class="flex items-center">
              <div class="option-marker w-6 h-6 rounded-full border flex items-center justify-center mr-3"
                :class="{ 'bg-purple-500 border-purple-500 text-white': selectedOption === index }">
                {{ String.fromCharCode(65 + index) }}
              </div>
              <div class="option-text">{{ option }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="quiz-navigation flex justify-between">
        <el-button round size="large" @click="previousQuestion" :disabled="currentQuestionIndex === 0" plain>
          <i class="material-icons mr-1">arrow_back</i>
          Previous
        </el-button>

        <el-button round size="large" v-if="currentQuestionIndex < quiz.questions.length - 1" type="primary"
          @click="nextQuestion" :disabled="selectedOption === null">
          Next
          <i class="material-icons ml-1">arrow_forward</i>
        </el-button>

        <el-button round size="large" v-else type="success" @click="submitQuiz" :disabled="selectedOption === null">
          Submit Quiz
          <i class="material-icons ml-1">check_circle</i>
        </el-button>
      </div>
    </div>

    <!-- Quiz completed -->
    <div v-else class="quiz-completed">
      <div class="result-summary text-center mb-8">
        <div class="result-icon mb-4">
          <i class="material-icons text-6xl" :class="isPassed ? 'text-green-500' : 'text-red-500'">
            {{ isPassed ? 'check_circle' : 'cancel' }}
          </i>
        </div>

        <h3 class="text-2xl font-bold mb-2">
          {{ isPassed ? 'Congratulations!' : 'Quiz Completed' }}
        </h3>

        <p class="text-xl mb-4">
          Your Score: <span class="font-bold">{{ score }}%</span>
          <span v-if="quiz.passingScore" class="text-sm ml-2">
            (Passing: {{ quiz.passingScore }}%)
          </span>
        </p>

        <p v-if="isPassed" class="text-green-600">
          You have successfully passed this quiz!
        </p>
        <p v-else-if="quiz.passingScore" class="text-red-600">
          You did not reach the passing score. You can try again later.
        </p>
      </div>

      <!-- Results breakdown -->
      <div class="results-breakdown mb-8">
        <h4 class="text-lg font-semibold mb-4">Question Results</h4>

        <div class="questions-results space-y-4">
          <div v-for="(question, index) in quiz.questions" :key="index" class="question-result p-4 rounded-lg" :class="{
            'bg-green-50 border-l-4 border-green-500': userAnswers[index] === question.correctOptionIndex,
            'bg-red-50 border-l-4 border-red-500': userAnswers[index] !== question.correctOptionIndex
          }">
            <div class="flex items-start">
              <div class="result-indicator mr-3 mt-1">
                <i class="material-icons" :class="{
                  'text-green-500': userAnswers[index] === question.correctOptionIndex,
                  'text-red-500': userAnswers[index] !== question.correctOptionIndex
                }">
                  {{ userAnswers[index] === question.correctOptionIndex ? 'check_circle' : 'cancel' }}
                </i>
              </div>

              <div class="question-content flex-1">
                <p class="font-medium mb-2">{{ index + 1 }}. {{ question.text }}</p>

                <div class="options-list space-y-1 ml-4">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="text-sm" :class="{
                    'text-green-700 font-medium': optIndex === question.correctOptionIndex,
                    'text-red-700 font-medium': optIndex === userAnswers[index] && optIndex !== question.correctOptionIndex
                  }">
                    <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}.</span> {{ option }}
                    <span v-if="optIndex === question.correctOptionIndex" class="ml-2 text-green-600">
                      (Correct Answer)
                    </span>
                    <span v-else-if="optIndex === userAnswers[index] && optIndex !== question.correctOptionIndex"
                      class="ml-2 text-red-600">
                      (Your Answer)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="quiz-completed-actions text-center mt-8">
        <el-button type="primary" @click="closeQuiz">
          Close
        </el-button>
        <el-button type="warning" @click="retakeQuiz">
          <i class="material-icons mr-2">replay</i>
          Retake Quiz
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElButton, ElProgress } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import type { Quiz, QuizQuestion } from '@/types/quiz';

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

import { submitQuizAttempt, getUserQuizAttempts } from '@/api/user/quiz.api';

const props = defineProps<{
  quiz: Quiz;
}>();

const emit = defineEmits<{
  (e: 'quiz-started'): void;
  (e: 'quiz-completed', result: { score: number; passed: boolean; silent?: boolean }): void;
}>();

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Quiz state
const quizStarted = ref(false);
const quizCompleted = ref(false);
const currentQuestionIndex = ref(0);
const selectedOption = ref<number | null>(null);
const userAnswers = ref<number[]>([]);
const timeRemaining = ref(0);
const timerInterval = ref<number | null>(null);
const existingAttempt = ref<QuizAttempt | null>(null);

// Computed properties
const currentQuestion = computed<QuizQuestion>(() => {
  return props.quiz.questions[currentQuestionIndex.value];
});

const score = computed(() => {
  if (existingAttempt.value && !quizStarted.value) {
    return existingAttempt.value.score;
  }

  if (!quizCompleted.value) return 0;

  const correctAnswers = userAnswers.value.filter(
    (answer, index) => answer === props.quiz.questions[index].correctOptionIndex
  ).length;

  return Math.round((correctAnswers / props.quiz.questions.length) * 100);
});

const isPassed = computed(() => {
  if (existingAttempt.value && !quizStarted.value) {
    return existingAttempt.value.passed;
  }

  if (!props.quiz.passingScore) return true;
  return score.value >= props.quiz.passingScore;
});

// Methods
const startQuiz = () => {
  // Reset quiz state
  quizStarted.value = true;
  quizCompleted.value = false;
  currentQuestionIndex.value = 0;
  selectedOption.value = null;

  // Emit quiz-started event
  emit('quiz-started');

  // Initialize user answers array with nulls
  userAnswers.value = Array(props.quiz.questions.length).fill(null);

  // Start timer if there's a time limit
  if (props.quiz.timeLimit) {
    timeRemaining.value = props.quiz.timeLimit * 60; // Convert minutes to seconds
    startTimer();
  }

  console.log('Quiz started with reset state');
};

const retakeQuiz = () => {
  // Reset all quiz state variables
  existingAttempt.value = null;
  quizCompleted.value = false;
  quizStarted.value = false; // Reset to false first to trigger proper state changes
  currentQuestionIndex.value = 0;
  selectedOption.value = null;
  userAnswers.value = Array(props.quiz.questions.length).fill(null);

  // Use setTimeout to ensure the component has time to update its state
  setTimeout(() => {
    // Start a new quiz
    startQuiz();
  }, 0);
};

const startTimer = () => {
  timerInterval.value = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      // Time's up, auto-submit the quiz
      clearInterval(timerInterval.value as number);
      submitQuiz();
    }
  }, 1000);
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const selectOption = (index: number) => {
  selectedOption.value = index;
  userAnswers.value[currentQuestionIndex.value] = index;
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.quiz.questions.length - 1) {
    currentQuestionIndex.value++;
    selectedOption.value = userAnswers.value[currentQuestionIndex.value];
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedOption.value = userAnswers.value[currentQuestionIndex.value];
  }
};

const submitQuiz = async () => {
  // Stop the timer if it's running
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }

  try {
    // Check if all questions are answered
    const unansweredQuestions = userAnswers.value.filter(answer => answer === null).length;
    if (unansweredQuestions > 0) {
      const confirmSubmit = confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }

    // Calculate score
    const correctAnswers = userAnswers.value.filter(
      (answer, index) => answer === props.quiz.questions[index].correctOptionIndex
    ).length;
    const calculatedScore = Math.round((correctAnswers / props.quiz.questions.length) * 100);

    // Submit quiz to API
    if (authStore.user && authStore.user.uid) {
      const result = await submitQuizAttempt({
        quizId: props.quiz._id,
        userId: authStore.user._id,
        answers: userAnswers.value,
        timeSpent: props.quiz.timeLimit ? (props.quiz.timeLimit * 60) - timeRemaining.value : 0,
        score: calculatedScore
      });

      // Update existing attempt
      existingAttempt.value = result;
    }

    // Mark quiz as completed
    quizCompleted.value = true;

    // Emit completion event
    emit('quiz-completed', {
      score: score.value,
      passed: isPassed.value,
      silent: false // Explicitly set to false to ensure notification is shown
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    notificationStore.showError('Failed to submit quiz', 'Error');
  }
};

// Check for existing attempt
const checkExistingAttempt = async () => {
  if (!authStore.user || !authStore.user._id) return;

  try {
    const attempts = await getUserQuizAttempts(authStore.user._id);
    const attempt = attempts.find(a => {
      // Handle both string quizId and object with _id
      const attemptQuizId = typeof a.quizId === 'string'
        ? a.quizId
        : (a.quizId as { _id: string })._id;

      return attemptQuizId === props.quiz._id;
    });

    if (attempt) {
      console.log('Found existing attempt:', attempt);
      existingAttempt.value = attempt;
    }
  } catch (error) {
    console.error('Error checking existing attempt:', error);
  }
};

const closeQuiz = () => {
  // Don't emit quiz-completed event when just closing the dialog
  // This prevents showing the completion notification again
  emit('quiz-completed', {
    score: 0,
    passed: false,
    silent: true // Add a flag to indicate this is just closing the dialog
  });
};

// Lifecycle hooks
onMounted(async () => {
  // Check for existing attempt
  await checkExistingAttempt();

  // If viewing results of a quiz, load the answers from the existing attempt
  if (existingAttempt.value) {
    // If we're just viewing results, load the answers from the existing attempt
    userAnswers.value = [...existingAttempt.value.answers];

    // Don't automatically mark the quiz as completed
    // This allows the user to retake the quiz properly
  }
});

onBeforeUnmount(() => {
  // Clear timer if it's running
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});
</script>

<style scoped>
.quiz-detail-container {
  padding: 1rem;
}

.option-marker {
  min-width: 1.5rem;
}

.option-item {
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: #6366f1;
}

.question-result {
  transition: all 0.2s ease;
}
</style>
