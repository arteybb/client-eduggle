<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12">
            <h2 class="text-4xl mb-5 font-bold">Edit Course</h2>
            <p style="color:gray;line-height: 20px;">
              Update your course details and content.
            </p>
          </div>
        </div>
      </div>

      <FetchingData v-if="loading"></FetchingData>

      <div v-else-if="!course" class="py-8">
        <el-empty description="Course not found or error loading course details">
          <template #extra>
            <el-button type="primary" @click="goBack">Back to Dashboard</el-button>
          </template>
        </el-empty>
      </div>


      <div v-else class="course-form mt-8">
        <div class="flex items-center mb-5">
          <span v-if="course.isPublished">Public</span>
          <span v-else>Draft</span>
          <el-switch v-model="course.isPublished" class="ml-2"
            style="--el-switch-on-color: #000; --el-switch-off-color: #ccc" @change="toggleDraft" />
        </div>
        <el-form :model="courseForm" :rules="rules" ref="courseFormRef" label-position="top"
          @submit.prevent="submitForm">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
              <el-form-item label="Course Name" prop="name">
                <el-input v-model="courseForm.name" placeholder="Enter course name" />
              </el-form-item>

              <el-form-item label="Course Description" prop="description">
                <el-input v-model="courseForm.description" type="textarea" :rows="6"
                  placeholder="Enter course description" />
              </el-form-item>

              <div class="form-actions mt-8">
                <el-button round size="large" @click="goBack">Cancel</el-button>
                <el-button round size="large" type="primary" @click="submitForm" :loading="submitting">
                  Save Changes
                </el-button>
              </div>
            </div>

            <!-- Course image upload section -->
            <div class="course-image-section">
              <h3 class="text-lg font-medium mb-4">Course Image</h3>

              <div class="image-upload-container border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div v-if="!imagePreview && !course.imageName" class="upload-placeholder">
                  <i class="material-icons text-gray-400" style="font-size: 48px;">image</i>
                  <p class="text-gray-500 mt-2">Upload a course image</p>
                  <el-upload class="mt-4" action="#" :auto-upload="false" :show-file-list="false"
                    :on-change="handleImageChange">
                    <el-button type="primary">Select Image</el-button>
                  </el-upload>
                </div>

                <div v-else-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Course preview" class="w-full h-48 object-cover rounded-lg" />
                  <div class="image-actions mt-4 flex justify-center space-x-2">
                    <el-button size="small" @click="removeImage">
                      <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
                      Remove
                    </el-button>
                    <el-upload round action="#" :auto-upload="false" :show-file-list="false"
                      :on-change="handleImageChange">
                      <el-button round size="small" type="primary">
                        <i class="material-icons mr-1" style="font-size: 16px;">edit</i>
                        Change
                      </el-button>
                    </el-upload>
                  </div>
                </div>

                <div v-else class="image-preview">
                  <img
                    :src="course.imageUrl || (course.imageName ? `${baseUrl}/uploads/images/${course.imageName}` : '')"
                    alt="Course image" class="w-full h-48 object-cover rounded-lg" />
                  <div class="image-actions mt-4 flex justify-center space-x-2">
                    <el-button round size="small" @click="removeExistingImage">
                      <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
                      Remove
                    </el-button>
                    <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleImageChange">
                      <el-button round size="small" type="primary">
                        <i class="material-icons mr-1" style="font-size: 16px;">edit</i>
                        Change
                      </el-button>
                    </el-upload>
                  </div>
                </div>
              </div>

              <div class="image-guidelines mt-4">
                <p class="text-sm text-gray-500">
                  Recommended image size: 1280x720 pixels (16:9 ratio)
                </p>
                <p class="text-sm text-gray-500">
                  Maximum file size: 2MB
                </p>
              </div>
            </div>
          </div>
        </el-form>

        <!-- Tabs for Course Content Management -->
        <div class="course-content mt-8">
          <h2 class="text-2xl font-bold mb-4">Course Content</h2>

          <el-tabs>
            <el-tab-pane label="Lessons">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Lessons</h3>
                <el-button round size="large" type="primary" @click="openLessonDialog()">
                  <i class="material-icons mr-1" style="font-size: 16px;">add</i>
                  Add Lesson
                </el-button>
              </div>

              <el-empty v-if="!course?.lessons?.length" description="No lessons added yet" />

              <div v-else class="lessons-list">
                <div v-for="(lesson, index) in course.lessons" :key="typeof lesson === 'string' ? lesson : lesson._id"
                  class="lesson-item p-4 border rounded-lg mb-3 hover:bg-gray-50">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-medium">{{ typeof lesson === 'string' ? '' : lesson.title }}</h4>
                      <p v-if="typeof lesson !== 'string' && lesson.description" class="text-gray-600 mt-1">{{
                        lesson.description }}</p>
                      <div v-if="typeof lesson !== 'string' && lesson.content" class="text-sm text-gray-500 mt-2">
                        <div class="content-preview">{{ lesson.content.substring(0, 100) }}{{ lesson.content.length >
                          100 ?
                          '...' : '' }}</div>
                      </div>
                    </div>
                    <div class="lesson-actions flex space-x-2">
                      <el-button size="large" circle @click="openLessonDialog(index)">
                        <el-icon>
                          <Edit />
                        </el-icon>
                      </el-button>
                      <el-button size="large" circle style="color:#ff2052"
                        @click="deleteLesson(typeof lesson === 'string' ? lesson : lesson._id)">
                        <i class="material-icons" style="font-size: 16px;">delete</i>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="Assignments">
              <AssignmentList v-if="course?._id" :courseId="course._id" />
            </el-tab-pane>

            <el-tab-pane label="Quizzes">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Quizzes</h3>
                <el-button round size="large" type="primary" @click="openQuizDialog()">
                  <i class="material-icons mr-1" style="font-size: 16px;">add</i>
                  Add Quiz
                </el-button>
              </div>

              <el-empty v-if="!course?.quizzes?.length" description="No quizzes added yet" />

              <div v-else class="quizzes-list">

                <div v-for="(quiz, index) in course.quizzes" :key="typeof quiz === 'string' ? quiz : quiz._id"
                  class="quiz-item p-4 border rounded-lg mb-3 hover:bg-gray-50">

                  <!-- แสดงสถานะ draft -->
                  <span v-if="typeof quiz !== 'string' && quiz.draft">Public</span>
                  <span v-else-if="typeof quiz !== 'string'">Draft</span>
                  <el-switch v-model="quiz.draft" class="ml-2"
                    style="--el-switch-on-color: #000; --el-switch-off-color: #ccc"
                    @change="toggleDraftQuiz(typeof quiz === 'string' ? quiz : quiz._id)" />

                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-medium">{{ typeof quiz === 'string' ? '' : quiz.title }}</h4>
                      <p v-if="typeof quiz !== 'string' && quiz.description" class="text-gray-600 mt-1">
                        {{ quiz.description }}
                      </p>
                      <div v-if="typeof quiz !== 'string'" class="text-sm text-gray-500 mt-2">
                        {{ quiz.questions.length }} question{{ quiz.questions.length !== 1 ? 's' : '' }}
                      </div>
                    </div>

                    <div class="quiz-actions flex items-center space-x-2">
                      <el-button circle size="large"
                        @click="openViewQuizDialog(typeof quiz === 'string' ? quiz : quiz._id, typeof quiz === 'string' ? '' : quiz.title)">
                        <el-icon>
                          <View />
                        </el-icon>
                      </el-button>

                      <el-dropdown v-if="isTeacher" trigger="click">
                        <el-button size="small" style="border:none;background-color: #fff;" class="ml-2">
                          <i class="material-icons">more_vert</i>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="openQuizDialog(index)">
                              <i class="material-icons text-sm mr-1">edit</i> Edit
                            </el-dropdown-item>
                            <el-dropdown-item @click="deleteQuiz(typeof quiz === 'string' ? quiz : quiz._id)"
                              class="text-red-500">
                              <i class="material-icons text-sm mr-1">delete</i> Delete
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>

              </div>
            </el-tab-pane>
            <el-tab-pane label="Members">
              <MemberList :id="courseId"></MemberList>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </MainLayout>

  <!-- Lesson Dialog -->
  <el-dialog v-model="lessonDialogVisible" :title="lessonForm.isEdit ? 'Edit Lesson' : 'Create New Lesson'"
    :width="isMobile ? '90%' : '1000px'">
    <el-form :model="lessonForm" :rules="lessonRules" ref="lessonFormRef" label-position="top">
      <el-form-item label="Lesson Title" prop="title">
        <el-input v-model="lessonForm.title" placeholder="Enter lesson title" />
      </el-form-item>

      <el-form-item label="Lesson Description">
        <el-input v-model="lessonForm.description" type="textarea" :rows="3"
          placeholder="Enter lesson description (optional)" />
      </el-form-item>

      <el-form-item label="Lesson Video">
        <el-upload class="upload-demo" :auto-upload="false" :on-change="handleVideoChange"
          :on-remove="handleVideoRemove" accept="video/*">
          <template #trigger>
            <el-button style="color:#000;">Select File</el-button>
          </template>

          <template #tip>
            <div v-if="lessonForm.mediaPath" class="el-upload__tip">
              Current file: {{ lessonForm.mediaPath }}
            </div>
            <div class="el-upload__tip">
              Video files supported (max. 100MB)
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="Lesson Content">
        <el-input v-model="lessonForm.content" type="textarea" :rows="10" placeholder="Enter lesson content" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button round size="large" style="color:#ff0252;" @click="lessonDialogVisible = false">Cancel</el-button>
        <el-button round size="large" type="primary" @click="submitLessonForm" :loading="submitting">
          {{ lessonForm.isEdit ? 'Update' : 'Create' }}
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- Quiz Dialog -->
  <el-dialog v-model="quizViewDialogVisible" :title="titleQuizOverview" :width="isMobile ? '90%' : '800px'">
    <div>
      <div v-if="userAttempt.length > 0">
        <h3 class="mt-5 flex justify-center items-center"
          style="background-color:green;padding:6px;color:#fff;width:120px;border-radius:20px;">
          Attempted
        </h3>
        <el-table class="mt-5" :data="userAttempt" style="width: 100%">
          <el-table-column type="index" label="#" />
          <el-table-column label="User">
            <template #default="scope">
              <div style="display: flex; align-items: center; gap: 10px;">
                <el-image :src="getImageUrl(scope.row.photoImg)"
                  style="width: 50px; height: 50px; border-radius: 50%;" />
                <span>{{ scope.row.displayName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="Score" />
          <el-table-column label="Attempted At">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="userNotAttempt">
        <h3 class="mt-5 flex justify-center items-center"
          style="background-color:gray;padding:6px;color:#fff;width:120px;border-radius:20px;">Not Attempted</h3>
        <el-table class="mt-5" :data="userNotAttempt" style="width: 100%">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column label="User">
            <template #default="scope">
              <div style="display: flex; align-items: center; gap: 10px;">
                <el-image :src="getImageUrl(scope.row.photoImg)"
                  style="width: 50px; height: 50px; border-radius: 50%;" />
                <span>{{ scope.row.displayName }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>


  <el-dialog v-model="quizDialogVisible" :title="quizForm.isEdit ? 'Edit Quiz' : 'Create New Quiz'"
    :width="isMobile ? '90%' : '1000px'">
    <el-form :model="quizForm" :rules="quizRules" ref="quizFormRef" label-position="top">
      <el-form-item label="Quiz Title" prop="title">
        <el-input v-model="quizForm.title" placeholder="Enter quiz title" />
      </el-form-item>

      <el-form-item label="Quiz Description">
        <el-input v-model="quizForm.description" type="textarea" :rows="3"
          placeholder="Enter quiz description (optional)" />
      </el-form-item>

      <div class="questions-section mt-4">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-medium">Questions</h4>
          <el-button round type="success" size="large" @click="openQuestionDialog()">
            <i class="material-icons mr-1" style="font-size: 16px;">add</i>
            Add Question
          </el-button>
        </div>

        <el-empty v-if="quizForm.questions.length === 0" description="No questions added yet" />

        <div v-else class="question-list">
          <div v-for="(question, index) in quizForm.questions" :key="index"
            class="question-item p-4 border rounded-lg mb-3 hover:bg-gray-50">
            <div class="flex items-start justify-between">
              <div>
                <h6 class="font-medium">{{ question.text }}</h6>
                <div class="options-list mt-2">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex"
                    class="option-item flex items-center mt-1">
                    <div class="w-4 h-4 rounded-full mr-2"
                      :class="optIndex === question.correctOptionIndex ? 'bg-green-500' : 'bg-gray-200'"></div>
                    <span>{{ option }}</span>
                  </div>
                </div>
              </div>
              <div class="question-actions flex space-x-2">

                <el-button size="large" circle @click="openQuestionDialog(index)">
                  <i class="material-icons" style="font-size: 16px;">edit</i>
                </el-button>
                <el-button size="large" circle @click="deleteQuestion(index)">
                  <i class="material-icons" style="font-size: 16px;color:red;">delete</i>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="large" style="color:#ff0252" round @click="quizDialogVisible = false">Cancel</el-button>
        <el-button size="large" round type="primary" @click="submitQuizForm" :loading="submitting">
          {{ quizForm.isEdit ? 'Update' : 'Create' }}
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- Question Dialog -->
  <el-dialog v-model="questionDialogVisible" :title="editingQuestionIndex >= 0 ? 'Edit Question' : 'Add Question'"
    :width="isMobile ? '90%' : '1000px'">
    <el-form label-position="top">
      <div class="question-form">
        <el-form-item label="Question Text">
          <el-input v-model="currentQuestion.text" type="textarea" :rows="2" placeholder="Enter question text" />
        </el-form-item>

        <div class="options-section mt-4">
          <h5 class="text-md font-medium mb-2">Options</h5>
          <div v-for="(option, index) in currentQuestion.options" :key="index"
            class="option-input flex items-center mb-2">
            <el-radio v-model="currentQuestion.correctOptionIndex" :label="index" class="mr-2" />
            <el-input v-model="currentQuestion.options[index]" placeholder="Enter option text" />
            <el-button v-if="index > 1 && index === currentQuestion.options.length - 1" type="danger" size="small"
              circle class="ml-2" @click="currentQuestion.options.splice(index, 1)">
              <i class="material-icons" style="font-size: 16px;">remove</i>
            </el-button>
          </div>

          <el-button v-if="currentQuestion.options.length < 6" type="success" round
            @click="currentQuestion.options.push('')" class="mt-2">
            <i class="material-icons mr-1" style="font-size: 16px;">add</i>
            Add Option
          </el-button>
        </div>
      </div>

    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="large" style="color:#ff0252;" round @click="questionDialogVisible = false">Cancel</el-button>
        <el-button size="large" round type="primary" @click="saveQuestion">
          Save
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { getCourseById, updateCourse, createLesson, updateLesson, deleteLesson as deleteLessonApi, createQuiz, updateQuiz, deleteQuiz as deleteQuizApi } from '@/api/user/teacher.api';
import { ElForm, ElFormItem, ElInput, ElButton, ElUpload, ElEmpty, ElTabs, ElTabPane, ElDialog } from 'element-plus';
import type { FormInstance, FormRules, UploadFile } from 'element-plus';
import type { Course } from '@/types/course';
import type { QuizQuestion } from '@/types/quiz';
import AssignmentList from '@/components/courses/AssignmentList.vue';
import FetchingData from '@/components/FetchingData.vue';
import { useWindowSize } from '@/use/useWindowSize';
import { getQuizAttemptStatus } from '@/api/user/quiz.api';
import { getIsPublic } from '@/api/user/course.api';
import { getIsPublicQuiz } from '@/api/user/quiz.api';
import MemberList from '@/components/courses/MemberList.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseId = route.params.id as string;
const isTeacher = computed(() => {
  return authStore.user?.role === 'T';
});

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

const course = ref<any | null>({
  _id: '',
  name: '',
  description: '',
  teacherId: '',
  isPublished: false,
  lessons: [],
  quizzes: []
});







const loading = ref(true);
const courseFormRef = ref<FormInstance>();
const submitting = ref(false);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const removeCurrentImage = ref(false);
const { mobileMode: isMobile } = useWindowSize()
const notificationStore = useNotificationStore();
const lessonDialogVisible = ref(false);
const lessonForm = reactive({
  _id: '',
  title: '',
  description: '',
  content: '',
  mediaPath: '',
  isEdit: false
});

const isPublishedQuiz = ref(false);

const toggleDraftQuiz = async (quizId: any) => {
  try {
    const res = await getIsPublicQuiz(quizId);
    console.log(res)
    isPublishedQuiz.value = res.draft;
    console.log(isPublishedQuiz.value)
    if (isPublishedQuiz.value) {
      notificationStore.showSuccess('Quiz is now Public!', 'Success');
    } else {
      notificationStore.showSuccess('Quiz is now in Draft mode.', 'Success');
    }

  } catch (error) {
    console.log(error);
  }
};

const toggleDraft = async () => {
  try {
    const res = await getIsPublic(courseId)
    if (course.value) {
      course.value.isPublished = res.isPublished;
    }
  } catch (error) {
    console.log(error)
  } finally {
    if (course.value?.isPublished === true) {
      notificationStore.showSuccess('Course is now Public!', 'Success');
    } else {
      notificationStore.showSuccess('Course is now in Draft mode.', 'Success');
    }


  }

};


const getImageUrl = (image: string) => {
  return `${import.meta.env.VITE_APP_BASE_URL}/uploads/${image}`;
};
const lessonRules = ref<FormRules>({
  title: [
    { required: true, message: 'Please enter a lesson title', trigger: 'blur' },
    { min: 3, max: 100, message: 'Length should be 3 to 100 characters', trigger: 'blur' },
  ],
});

const lessonFormRef = ref<FormInstance>();

const userAttempt = ref([])
const userNotAttempt = ref([])
const quizDialogVisible = ref(false);
const quizViewDialogVisible = ref(false);
const titleQuizOverview = ref('')
const openViewQuizDialog = async (quizId: any, title: string) => {
  titleQuizOverview.value = title
  quizViewDialogVisible.value = true;
  const res = await getQuizAttemptStatus(courseId, quizId);
  userAttempt.value = res.attemptedUsers
  userNotAttempt.value = res.notAttemptedUsers
}

const quizForm = reactive({
  _id: '',
  title: '',
  description: '',
  questions: [] as QuizQuestion[],
  isEdit: false
});

const quizRules = ref<FormRules>({
  title: [
    { required: true, message: 'Please enter a quiz title', trigger: 'blur' },
    { min: 3, max: 100, message: 'Length should be 3 to 100 characters', trigger: 'blur' },
  ],
});



const quizFormRef = ref<FormInstance>();

// Question being edited
const currentQuestion = reactive({
  text: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0
});

// Question dialog
const questionDialogVisible = ref(false);
const editingQuestionIndex = ref(-1);

const courseForm = reactive({
  name: '',
  description: '',
});

const rules = ref<FormRules>({
  name: [
    { required: true, message: 'Please enter a course name', trigger: 'blur' },
    { min: 3, max: 100, message: 'Length should be 3 to 100 characters', trigger: 'blur' },
  ],
  description: [
    { required: true, message: 'Please enter a course description', trigger: 'blur' },
    { min: 10, max: 2000, message: 'Length should be 10 to 2000 characters', trigger: 'blur' },
  ],
});

// Add video file ref
const videoFile = ref<File | null>(null);

// Simple video change handler
const handleVideoChange = (file: any) => {
  if (!file.raw) return;
  videoFile.value = file.raw;
};

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Handle video remove
const handleVideoRemove = () => {
  videoFile.value = null;
  lessonForm.mediaPath = '';
};

// Fetch course details
const fetchCourseDetails = async () => {
  try {
    loading.value = true;
    console.log('Fetching course details for ID:', courseId);
    const courseData = await getCourseById(courseId);
    console.log('Course data received:', courseData);

    // Ensure lessons and quizzes are properly initialized
    if (!courseData.lessons) courseData.lessons = [];
    if (!courseData.quizzes) courseData.quizzes = [];

    // Log lessons and quizzes for debugging
    console.log('Lessons:', courseData.lessons);
    console.log('Quizzes:', courseData.quizzes);

    // Update the course data
    course.value = courseData;

    // Populate form with course data
    courseForm.name = courseData.name;
    courseForm.description = courseData.description || '';

    loading.value = false;
  } catch (error) {
    console.error('Error fetching course details:', error);
    notificationStore.showError('Failed to load course details', 'Error');
    loading.value = false;
  }
};

// Handle image upload
const handleImageChange = (file: UploadFile) => {
  if (!file.raw) {
    notificationStore.showError('Invalid file upload', 'Upload Error');
    return;
  }

  const isImage = file.raw.type.startsWith('image/');
  const isLt2M = file.raw.size / 1024 / 1024 < 2;

  if (!isImage) {
    notificationStore.showError('You can only upload image files!', 'Upload Error');
    return;
  }

  if (!isLt2M) {
    notificationStore.showError('Image size can not exceed 2MB!', 'Upload Error');
    return;
  }

  imageFile.value = file.raw;
  removeCurrentImage.value = true;

  // Create preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};

// Remove selected image
const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  removeCurrentImage.value = true;
};

// Remove existing image
const removeExistingImage = () => {
  removeCurrentImage.value = true;
  imageFile.value = null;
  imagePreview.value = null;
};

// Submit form
const submitForm = async () => {
  if (!courseFormRef.value) return;

  await courseFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;

        if (!authStore.user || !authStore.user.uid) {
          notificationStore.showWarning('Please log in to update a course', 'Authentication Required');
          return;
        }
        const formData = new FormData();
        formData.append('name', courseForm.name);
        formData.append('description', courseForm.description);
        formData.append('teacherId', authStore.user.uid);
        formData.append('removeImage', removeCurrentImage.value.toString());

        if (imageFile.value) {
          formData.append('image', imageFile.value);
        }

        // Call API to update course
        await updateCourse(courseId, formData);

        notificationStore.showSuccess('Course updated successfully!', 'Success');
        // router.push('/teacher/dashboard');
      } catch (error) {
        console.error('Error updating course:', error);
        notificationStore.showError('Failed to update course', 'Error');
      } finally {
        submitting.value = false;
      }
    } else {
      notificationStore.showWarning('Please correct the errors in the form', 'Validation Error');
    }
  });
};

// Go back to dashboard
const goBack = () => {
  router.push('/teacher/dashboard');
};

// Open lesson dialog with existing lesson for editing
const openLessonDialog = (index?: number) => {
  if (index !== undefined && course.value && course.value.lessons && course.value.lessons[index]) {
    const lesson = course.value.lessons[index];
    if (typeof lesson !== 'string') {
      lessonForm._id = lesson._id;
      lessonForm.title = lesson.title;
      lessonForm.description = lesson.description || '';
      lessonForm.content = lesson.content || '';
      lessonForm.mediaPath = lesson.mediaPath || '';
      lessonForm.isEdit = true;
    }
  } else {
    // Creating a new lesson
    lessonForm._id = '';
    lessonForm.title = '';
    lessonForm.description = '';
    lessonForm.content = '';
    lessonForm.mediaPath = '';
    lessonForm.isEdit = false;
  }
  lessonDialogVisible.value = true;
};

// Submit lesson form
const submitLessonForm = async () => {
  if (!lessonFormRef.value) return;

  await lessonFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;

        const lessonData = new FormData();
        lessonData.append('title', lessonForm.title);
        lessonData.append('description', lessonForm.description || '');
        lessonData.append('content', lessonForm.content || '');
        lessonData.append('courseId', courseId);

        if (videoFile.value) {
          lessonData.append('mediaPath', videoFile.value);
        }

        if (lessonForm.isEdit && lessonForm._id) {
          await updateLesson(courseId, lessonForm._id, lessonData);
          notificationStore.showSuccess('Lesson updated successfully', 'Success');
        } else {
          await createLesson(courseId, lessonData);
          notificationStore.showSuccess('Lesson created successfully', 'Success');
        }
        // Refresh course data
        videoFile.value = null;

        await fetchCourseDetails();
        lessonDialogVisible.value = false;
      } catch (error) {
        console.error('Error saving lesson:', error);
        notificationStore.showError('Failed to save lesson', 'Error');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// Open quiz dialog with existing quiz for editing
const openQuizDialog = (index?: number) => {
  console.log('Opening quiz dialog with index:', index);
  console.log('Current quizzes:', course.value?.quizzes);

  if (index !== undefined && course.value && course.value.quizzes && course.value.quizzes[index]) {
    const quiz = course.value.quizzes[index];
    console.log('Editing quiz:', quiz);

    if (typeof quiz !== 'string') {
      quizForm._id = quiz._id;
      quizForm.title = quiz.title;
      quizForm.description = quiz.description || '';
      quizForm.questions = JSON.parse(JSON.stringify(quiz.questions || []));
      quizForm.isEdit = true;
    } else {
      // Handle string case (should not happen in normal operation)
      console.log('Warning: Quiz is a string ID instead of an object:', quiz);
      quizForm._id = quiz;
      quizForm.title = '';
      quizForm.description = '';
      quizForm.questions = [];
      quizForm.isEdit = true;
    }
  } else {
    // Creating a new quiz
    console.log('Creating a new quiz');
    quizForm._id = '';
    quizForm.title = '';
    quizForm.description = '';
    quizForm.questions = [];
    quizForm.isEdit = false;
  }
  quizDialogVisible.value = true;
};

// Open question dialog
const openQuestionDialog = (index = -1) => {
  if (index >= 0 && index < quizForm.questions.length) {
    // Edit existing question
    const question = quizForm.questions[index];
    currentQuestion.text = question.text;
    currentQuestion.options = [...question.options];
    currentQuestion.correctOptionIndex = question.correctOptionIndex;
    editingQuestionIndex.value = index;
  } else {
    // New question
    currentQuestion.text = '';
    currentQuestion.options = ['', '', '', ''];
    currentQuestion.correctOptionIndex = 0;
    editingQuestionIndex.value = -1;
  }
  questionDialogVisible.value = true;
};

// Save question
const saveQuestion = () => {
  // Validate question
  if (!currentQuestion.text.trim()) {
    notificationStore.showWarning('Please enter a question', 'Validation Error');
    return;
  }

  // Check if at least 2 options are filled
  const filledOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
  if (filledOptions.length < 2) {
    notificationStore.showWarning('Please provide at least 2 options', 'Validation Error');
    return;
  }

  // Check if correct option is valid
  if (currentQuestion.correctOptionIndex < 0 || currentQuestion.correctOptionIndex >= filledOptions.length) {
    notificationStore.showWarning('Please select a valid correct answer', 'Validation Error');
    return;
  }

  const questionData = {
    text: currentQuestion.text,
    options: currentQuestion.options.filter(opt => opt.trim() !== ''),
    correctOptionIndex: currentQuestion.correctOptionIndex
  };

  if (editingQuestionIndex.value >= 0) {
    // Update existing question
    quizForm.questions[editingQuestionIndex.value] = questionData;
  } else {
    // Add new question
    quizForm.questions.push(questionData);
  }

  questionDialogVisible.value = false;
};

// Delete question
const deleteQuestion = (index: number) => {
  quizForm.questions.splice(index, 1);
};

// Submit quiz form
const submitQuizForm = async () => {
  if (!quizFormRef.value) return;

  await quizFormRef.value.validate(async (valid) => {
    if (valid) {
      // Check if quiz has questions
      if (quizForm.questions.length === 0) {
        notificationStore.showWarning('Please add at least one question to the quiz', 'Validation Error');
        return;
      }

      try {
        submitting.value = true;

        const quizData = {
          title: quizForm.title,
          description: quizForm.description,
          courseId: courseId,
          questions: quizForm.questions
        };

        console.log('Submitting quiz data:', quizData);

        if (quizForm.isEdit && quizForm._id) {
          await updateQuiz(courseId, quizForm._id, quizData);
          notificationStore.showSuccess('Quiz updated successfully', 'Success');
        } else {
          await createQuiz(courseId, quizData);
          notificationStore.showSuccess('Quiz created successfully', 'Success');
        }

        // Refresh course data
        await fetchCourseDetails();
        quizDialogVisible.value = false;
      } catch (error) {
        console.error('Error saving quiz:', error);
        notificationStore.showError('Failed to save quiz', 'Error');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// Delete lesson
const deleteLesson = async (lessonId: string) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete this lesson? This action cannot be undone.`,
    'Delete Lesson',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        submitting.value = true;
        console.log('Deleting lesson:', courseId, lessonId);
        await deleteLessonApi(courseId, lessonId);
        notificationStore.showSuccess('Lesson deleted successfully', 'Success');
        // Refresh course data
        await fetchCourseDetails();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        notificationStore.showError('Failed to delete lesson', 'Error');
      } finally {
        submitting.value = false;
      }
    })
    .catch(() => {
      // User cancelled the deletion
    });
};

// Delete quiz
const deleteQuiz = async (quizId: string) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete this quiz? This action cannot be undone.`,
    'Delete Quiz',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        submitting.value = true;
        console.log('Deleting quiz:', courseId, quizId);
        await deleteQuizApi(courseId, quizId);
        notificationStore.showSuccess('Quiz deleted successfully', 'Success');
        // Refresh course data
        await fetchCourseDetails();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        notificationStore.showError('Failed to delete quiz', 'Error');
      } finally {
        submitting.value = false;
      }
    })
    .catch(() => {
      // User cancelled the deletion
    });
};

onMounted(async () => {
  if (authStore.user && authStore.user.role !== 'T') {
    notificationStore.showWarning('Only teachers can edit courses', 'Access Denied');
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

.course-form {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.image-upload-container {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
