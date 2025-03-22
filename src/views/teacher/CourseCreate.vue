<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12">
            <h2 class="text-4xl mb-5 font-bold">Create New Course</h2>
            <p style="color:gray;line-height: 20px;">
              Fill in the details to create a new course for your students.
            </p>
          </div>
        </div>
      </div>

      <div class="course-form mt-8">
        <el-form :model="courseForm" :rules="rules" ref="courseFormRef" label-position="top"
          @submit.prevent="submitForm">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Course details section -->
            <div class="lg:col-span-2">
              <el-form-item label="Course Name" prop="name">
                <el-input v-model="courseForm.name" placeholder="Enter course name" />
              </el-form-item>

              <el-form-item label="Course Description" prop="description">
                <el-input v-model="courseForm.description" type="textarea" :rows="6"
                  placeholder="Enter course description" />
              </el-form-item>

              <div class="form-actions flex items-center mt-8">
                <el-button @click="goBack">Cancel</el-button>
                <el-button type="primary" size="large" round @click="submitForm" :loading="submitting">
                  Create Course
                </el-button>
              </div>
            </div>

            <!-- Course image upload section -->
            <div class="course-image-section">
              <h3 class="text-lg font-medium mb-4">Course Image</h3>

              <div class="image-upload-container border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div v-if="!imagePreview" class="upload-placeholder">
                  <i class="material-icons text-gray-400" style="font-size: 48px;">image</i>
                  <p class="text-gray-500 mt-2">Upload a course image</p>
                  <el-upload class="mt-4" action="#" :auto-upload="false" :show-file-list="false"
                    :on-change="handleImageChange">
                    <el-button type="primary">Select Image</el-button>
                  </el-upload>
                </div>

                <div v-else class="image-preview">
                  <img :src="imagePreview" alt="Course preview" class="w-full h-48 object-cover rounded-lg" />
                  <div class="image-actions mt-4 flex justify-center space-x-2">
                    <el-button size="small" @click="removeImage">
                      <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
                      Remove
                    </el-button>
                    <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleImageChange">
                      <el-button size="small" type="primary">
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
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { createCourse } from '@/api/user/teacher.api';
import { ElForm, ElFormItem, ElInput, ElButton, ElUpload } from 'element-plus';
import type { FormInstance, FormRules, UploadFile } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const courseFormRef = ref<FormInstance>();
const submitting = ref(false);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const courseForm = ref({
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
};

// Submit form
const submitForm = async () => {
  if (!courseFormRef.value) return;

  await courseFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;

        if (!authStore.user || !authStore.user.uid) {
          notificationStore.showWarning('Please log in to create a course', 'Authentication Required');
          return;
        }

        // Create form data for API request
        const formData = new FormData();
        formData.append('name', courseForm.value.name);
        formData.append('description', courseForm.value.description);
        formData.append('teacherId', authStore.user.uid);

        if (imageFile.value) {
          formData.append('image', imageFile.value);
        }

        // Call API to create course
        await createCourse(formData);

        notificationStore.showSuccess('Course created successfully!', 'Success');
        router.push('/teacher/dashboard');
      } catch (error) {
        console.error('Error creating course:', error);
        notificationStore.showError('Failed to create course', 'Error');
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

onMounted(() => {
  // Check if user is a teacher
  if (authStore.user && authStore.user.role !== 'T') {
    notificationStore.showWarning('Only teachers can create courses', 'Access Denied');
    router.push('/home');
  }
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
