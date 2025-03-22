<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12 lg:col-span-8">
            <h2 class="text-4xl mb-5 font-bold">Manage Quizzes</h2>
            <p style="color:gray;line-height: 20px;" v-if="course">
              {{ course.name }} - Create and manage quizzes for your students.
            </p>
          </div>
          <div class="col-span-12 lg:col-span-4 flex justify-end items-center">
            <el-button type="primary" @click="openCreateQuizModal" class="create-quiz-btn">
              <i class="material-icons mr-2">add_circle</i>
              Add New Quiz
            </el-button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <FetchingData v-if="loading"></FetchingData>

      <!-- Error state -->
      <div v-else-if="!course" class="py-8">
        <el-empty description="Course not found or error loading course details">
          <template #extra>
            <el-button type="primary" @click="goBack">Back to Dashboard</el-button>
          </template>
        </el-empty>
      </div>

      <!-- Quizzes list -->
      <div v-else class="quizzes-container mt-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-xl font-semibold mb-6">Quizzes ({{ course.quizzes.length }})</h3>

          <!-- No quizzes state -->
          <el-empty v-if="course.quizzes.length === 0" description="No quizzes yet. Add your first quiz to get started.">
            <template #extra>
              <el-button type="primary" @click="openCreateQuizModal">Add First Quiz</el-button>
            </template>
          </el-empty>

          <!-- Quizzes list -->
          <div v-else class="quizzes-list space-y-3">
            <div
              v-for="(quiz, index) in course.quizzes"
              :key="quiz._id"
              class="quiz-item border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="quiz-number bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {{ index + 1 }}
                  </div>
                  <div class="quiz-info">
                    <h4 class="font-medium">{{ quiz.title }}</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ quiz.questions ? quiz.questions.length : 0 }} questions
                    </p>
                  </div>
                </div>
                <div class="quiz-actions flex space-x-2">
                  <el-button
                    type="primary"
                    size="small"
                    @click="editQuiz(quiz)"
                  >
                    <i class="material-icons mr-1" style="font-size: 16px;">edit</i>
                    Edit
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="confirmDeleteQuiz(quiz)"
                  >
                    <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
                    Delete
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Quiz Modal -->
    <el-dialog
      v-model="quizModalVisible"
      :title="isEditMode ? 'Edit Quiz' : 'Create New Quiz'"
      width="70%"
      :before-close="handleCloseModal"
    >
      <p class="text-gray-500 mb-4">Quiz creation and editing will be implemented in a future update.</p>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quizModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="saveQuiz" :loading="submitting">
            {{ isEditMode ? 'Save Changes' : 'Create Quiz' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Delete Confirmation Modal -->
    <el-dialog
      v-model="deleteConfirmationVisible"
      title="Confirm Deletion"
      width="30%"
    >
      <div class="delete-confirmation-content">
        <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmationVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteQuiz" :loading="submitting">
            <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
            Delete
          </el-button>
        </span>
      </template>
    </el-dialog>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import {
  getCourseById,
  deleteQuiz as deleteQuizApi
} from '@/api/user/teacher.api';
import { ElDialog, ElButton, ElEmpty } from 'element-plus';
import type { Course } from '@/types/course';
import FetchingData from '@/components/FetchingData.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const courseId = route.params.id as string;
const course = ref<Course | null>(null);
const loading = ref(true);
const submitting = ref(false);
const quizModalVisible = ref(false);
const deleteConfirmationVisible = ref(false);
const selectedQuiz = ref<any>(null);
const isEditMode = ref(false);

// Fetch course details
const fetchCourseDetails = async () => {
  try {
    loading.value = true;
    const courseData = await getCourseById(courseId);
    course.value = courseData;
    loading.value = false;
  } catch (error) {
    console.error('Error fetching course details:', error);
    notificationStore.showError('Failed to load course details', 'Error');
    loading.value = false;
  }
};

// Open create quiz modal
const openCreateQuizModal = () => {
  isEditMode.value = false;
  quizModalVisible.value = true;
};

// Edit quiz
const editQuiz = (quiz: any) => {
  isEditMode.value = true;
  selectedQuiz.value = quiz;
  quizModalVisible.value = true;
};

// Handle close modal
const handleCloseModal = () => {
  quizModalVisible.value = false;
  selectedQuiz.value = null;
};

// Save quiz (create or update) - placeholder for future implementation
const saveQuiz = async () => {
  try {
    submitting.value = true;

    // This is a placeholder for future implementation
    notificationStore.showInfo('Quiz creation/editing will be implemented in a future update', 'Coming Soon');

    quizModalVisible.value = false;
  } catch (error) {
    console.error('Error saving quiz:', error);
    notificationStore.showError('Failed to save quiz', 'Error');
  } finally {
    submitting.value = false;
  }
};

// Confirm delete quiz
const confirmDeleteQuiz = (quiz: any) => {
  selectedQuiz.value = quiz;
  deleteConfirmationVisible.value = true;
};

// Delete quiz
const deleteQuiz = async () => {
  if (!selectedQuiz.value) return;

  try {
    submitting.value = true;

    await deleteQuizApi(courseId, selectedQuiz.value._id);

    notificationStore.showSuccess('Quiz deleted successfully!', 'Success');
    deleteConfirmationVisible.value = false;

    // Refresh course data
    await fetchCourseDetails();
  } catch (error) {
    console.error('Error deleting quiz:', error);
    notificationStore.showError('Failed to delete quiz', 'Error');
  } finally {
    submitting.value = false;
  }
};

// Go back to dashboard
const goBack = () => {
  router.push('/teacher/dashboard');
};

onMounted(async () => {
  // Check if user is a teacher
  if (authStore.user && authStore.user.role !== 'T') {
    notificationStore.showWarning('Only teachers can manage quizzes', 'Access Denied');
    router.push('/home');
    return;
  }

  await fetchCourseDetails();
});
</script>

<style scoped>
.content-container {
  max-width: 1140px;
}

.create-quiz-btn {
  display: flex;
  align-items: center;
}

.quizzes-container {
  margin-bottom: 2rem;
}

.quiz-item {
  transition: all 0.2s ease;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
