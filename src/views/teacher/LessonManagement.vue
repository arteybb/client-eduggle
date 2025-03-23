<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12 lg:col-span-8">
            <h2 class="text-4xl mb-5 font-bold">Manage Lessons</h2>
            <p style="color:gray;line-height: 20px;" v-if="course">
              {{ course.name }} - Create and organize lessons for your students.
            </p>
          </div>
          <div class="col-span-12 lg:col-span-4 flex justify-end items-center">
            <el-button type="primary" @click="openCreateLessonModal" class="create-lesson-btn">
              <i class="material-icons mr-2">add_circle</i>
              Add New Lesson
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

      <!-- Lessons list -->
      <div v-else class="lessons-container mt-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-xl font-semibold mb-6">Lessons ({{ course.lessons.length }})</h3>

          <!-- No lessons state -->
          <el-empty v-if="course.lessons.length === 0"
            description="No lessons yet. Add your first lesson to get started.">
            <template #extra>
              <el-button type="primary" @click="openCreateLessonModal">Add First Lesson</el-button>
            </template>
          </el-empty>

          <!-- Lessons list with drag and drop -->
          <div v-else class="lessons-list">
            <draggable v-model="lessonsList" item-key="_id" handle=".drag-handle" @end="handleLessonOrderChange"
              class="space-y-3">
              <template #item="{ element, index }">
                <div class="lesson-item border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="drag-handle cursor-move mr-3 text-gray-400 hover:text-gray-600">
                        <i class="material-icons">drag_indicator</i>
                      </div>
                      <div
                        class="lesson-number bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        {{ index + 1 }}
                      </div>
                      <div class="lesson-info">
                        <h4 class="font-medium">{{ element.title }}</h4>
                        <p class="text-sm text-gray-600 mt-1">{{ truncateText(element.content, 100) }}</p>
                      </div>
                    </div>
                    <div class="lesson-actions flex space-x-2">
                      <el-button type="primary" size="small" @click="editLesson(element)">
                        <i class="material-icons mr-1" style="font-size: 16px;">edit</i>
                        Edit
                      </el-button>
                      <el-button type="danger" size="small" @click="confirmDeleteLesson(element)">
                        <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
                        Delete
                      </el-button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Lesson Modal -->
    <el-dialog v-model="lessonModalVisible" :title="isEditMode ? 'Edit Lesson' : 'Create New Lesson'" width="50%"
      :before-close="handleCloseModal">
      <el-form :model="lessonForm" :rules="lessonRules" ref="lessonFormRef" label-position="top">
        <el-form-item label="Lesson Title" prop="title">
          <el-input v-model="lessonForm.title" placeholder="Enter lesson title" />
        </el-form-item>

        <el-form-item label="Lesson Content" prop="content">
          <el-input v-model="lessonForm.content" type="textarea" :rows="10"
            placeholder="Enter lesson content (supports markdown)" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="lessonModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="saveLesson" :loading="submitting">
            {{ isEditMode ? 'Save Changes' : 'Create Lesson' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Delete Confirmation Modal -->
    <el-dialog v-model="deleteConfirmationVisible" title="Confirm Deletion" width="30%">
      <div class="delete-confirmation-content">
        <p>Are you sure you want to delete this lesson? This action cannot be undone.</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmationVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteLesson" :loading="submitting">
            <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
            Delete
          </el-button>
        </span>
      </template>
    </el-dialog>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import {
  getCourseById,
  createLesson,
  updateLesson,
  deleteLesson as deleteLessonApi,
  updateLessonOrder
} from '@/api/user/teacher.api';
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElEmpty } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { Course } from '@/types/course';
import draggable from 'vuedraggable';
import FetchingData from '@/components/FetchingData.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const courseId = route.params.id as string;
const course = ref<Course | null>(null);
const loading = ref(true);
const lessonFormRef = ref<FormInstance>();
const submitting = ref(false);
const lessonModalVisible = ref(false);
const deleteConfirmationVisible = ref(false);
const selectedLesson = ref<any | null>(null);
const isEditMode = ref(false);

const lessonForm = ref({
  title: '',
  content: '',
});

const lessonRules = ref<FormRules>({
  title: [
    { required: true, message: 'Please enter a lesson title', trigger: 'blur' },
    { min: 3, max: 100, message: 'Length should be 3 to 100 characters', trigger: 'blur' },
  ],
  content: [
    { required: true, message: 'Please enter lesson content', trigger: 'blur' },
    { min: 10, message: 'Content should be at least 10 characters', trigger: 'blur' },
  ],
});

// Computed property for lessons list to enable drag and drop
const lessonsList = computed({
  get: () => course.value?.lessons || [],
  set: (value) => {
    if (course.value) {
      course.value.lessons = value;
    }
  }
});

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

// Open create lesson modal
const openCreateLessonModal = () => {
  isEditMode.value = false;
  lessonForm.value = {
    title: '',
    content: '',
  };
  lessonModalVisible.value = true;
};

// Edit lesson
const editLesson = (lesson: any) => {
  isEditMode.value = true;
  selectedLesson.value = lesson;
  lessonForm.value = {
    title: lesson.title,
    content: lesson.content,
  };
  lessonModalVisible.value = true;
};

// Handle close modal
const handleCloseModal = () => {
  lessonModalVisible.value = false;
  lessonForm.value = {
    title: '',
    content: '',
  };
  selectedLesson.value = null;
};

// Save lesson (create or update)
const saveLesson = async () => {
  if (!lessonFormRef.value) return;

  await lessonFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;

        if (!authStore.user || !authStore.user.uid) {
          notificationStore.showWarning('Please log in to manage lessons', 'Authentication Required');
          return;
        }

        if (isEditMode.value && selectedLesson.value) {
          // Update existing lesson
          await updateLesson(courseId, selectedLesson.value._id, {
            title: lessonForm.value.title,
            content: lessonForm.value.content,
          });

          notificationStore.showSuccess('Lesson updated successfully!', 'Success');
        } else {
          // Create new lesson
          await createLesson(courseId, {
            title: lessonForm.value.title,
            content: lessonForm.value.content,
          });

          notificationStore.showSuccess('Lesson created successfully!', 'Success');
        }

        // Refresh course data
        await fetchCourseDetails();
        lessonModalVisible.value = false;
      } catch (error) {
        console.error('Error saving lesson:', error);
        notificationStore.showError('Failed to save lesson', 'Error');
      } finally {
        submitting.value = false;
      }
    } else {
      notificationStore.showWarning('Please correct the errors in the form', 'Validation Error');
    }
  });
};

// Confirm delete lesson
const confirmDeleteLesson = (lesson: any) => {
  selectedLesson.value = lesson;
  deleteConfirmationVisible.value = true;
};

// Delete lesson
const deleteLesson = async () => {
  if (!selectedLesson.value) return;

  try {
    submitting.value = true;

    await deleteLessonApi(courseId, selectedLesson.value._id);

    notificationStore.showSuccess('Lesson deleted successfully!', 'Success');
    deleteConfirmationVisible.value = false;

    // Refresh course data
    await fetchCourseDetails();
  } catch (error) {
    console.error('Error deleting lesson:', error);
    notificationStore.showError('Failed to delete lesson', 'Error');
  } finally {
    submitting.value = false;
  }
};

// Handle lesson order change after drag and drop
const handleLessonOrderChange = async () => {
  try {
    if (!course.value) return;

    const lessonIds = course.value.lessons.map(lesson => lesson._id);
    await updateLessonOrder(courseId, lessonIds);

    notificationStore.showSuccess('Lesson order updated successfully!', 'Success');
  } catch (error) {
    console.error('Error updating lesson order:', error);
    notificationStore.showError('Failed to update lesson order', 'Error');

    // Refresh course data to reset order
    await fetchCourseDetails();
  }
};

// Truncate text for display
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Go back to dashboard
const goBack = () => {
  router.push('/teacher/dashboard');
};

onMounted(async () => {
  // Check if user is a teacher
  if (authStore.user && authStore.user.role !== 'T') {
    notificationStore.showWarning('Only teachers can manage lessons', 'Access Denied');
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

.create-lesson-btn {
  display: flex;
  align-items: center;
}

.lessons-container {
  margin-bottom: 2rem;
}

.lesson-item {
  transition: all 0.2s ease;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
