<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <FetchingData v-if="isLoading"></FetchingData>

      <div v-else>
        <div class="profile-header mb-8">
          <h1 class="text-2xl font-bold mb-2">My Profile</h1>
          <p class="text-gray-500">Manage your personal information and account settings</p>
        </div>

        <el-card class="profile-card mb-6">

          <div class="flex flex-col md:flex-row items-center md:items-start">
            <div class="profile-avatar mb-6 md:mb-0 md:mr-8">
              <el-avatar :size="120"
                :src="imageUrl || (authStore.user?.photoImg ? `${$baseUrl}/uploads/${authStore.user.photoImg}` : '')"
                class="mb-2">
                <span v-if="!imageUrl && !authStore.user?.photoImg" class="text-2xl font-bold">
                  {{ authStore.user?.displayName?.charAt(0).toUpperCase() || 'U' }}
                </span>
              </el-avatar>

              <el-upload class="avatar-uploader mt-2" action="#" :auto-upload="false" :show-file-list="false"
                :on-change="handleFileChange">
                <el-button size="small" round plain>
                  <i class="material-icons text-sm mr-1">photo_camera</i>
                  Change Photo
                </el-button>
              </el-upload>
            </div>

            <div class="profile-info flex-grow">
              <h2 class="text-xl font-semibold mb-2">{{ authStore.user?.displayName }}</h2>
              <p class="text-gray-500 mb-4">{{ authStore.user?.email }}</p>

              <div class="user-role mb-4">
                <el-tag type="info">
                  {{ authStore.user?.role === 'T' ? 'Teacher' : 'Student' }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="profile-form-card">
          <template #header>
            <div class="card-header">
              <h3 class="text-lg font-medium">Edit Profile Information</h3>
            </div>
          </template>

          <el-form :model="formProfile" @submit.prevent="editUserData" label-position="top"
            :hide-required-asterisk="true">
            <el-form-item label="Display Name">
              <el-input v-model="formProfile.displayName" placeholder="Enter your display name" />
            </el-form-item>

            <el-divider />

            <div class="flex justify-end">
              <el-button type="primary" size="large" round native-type="submit" :loading="isSubmitting">
                Update Profile
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { editUser } from '@/api/user/user.api';
import { useAuthStore } from '@/stores/auth';
import MainLayout from '@/layouts/MainLayout.vue';
import { ElMessage, ElAvatar, ElButton, ElCard, ElDivider, ElForm, ElFormItem, ElInput, ElTag, ElUpload } from 'element-plus';
import FetchingData from '@/components/FetchingData.vue';
import type { UploadFile } from 'element-plus';

const authStore = useAuthStore();

const formProfile = ref({
  displayName: authStore.user?.displayName || '',
  photoImg: null as File | null
});

const imageUrl = ref<string | null>(null);
const isLoading = ref(true);
const isSubmitting = ref(false);

const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string;
      if (file.raw) {
        formProfile.value.photoImg = file.raw;
      }
    };
    if (file.raw) {
      reader.readAsDataURL(file.raw);
    }
  }
};

const editUserData = async () => {
  try {
    isSubmitting.value = true;

    if (formProfile.value.photoImg) {
      const formData = new FormData();
      formData.append('displayName', formProfile.value.displayName);
      formData.append('photoImg', formProfile.value.photoImg);

      const updatedUser = await editUser(authStore.user?.uid as string, formData as unknown as { displayName: string; photoImg?: string | null });
      if (updatedUser) {
        ElMessage.success("Profile updated successfully!");
        authStore.user = updatedUser;
      }
    } else {
      const payload = {
        displayName: formProfile.value.displayName
      };

      const updatedUser = await editUser(authStore.user?.uid as string, payload);
      if (updatedUser) {
        ElMessage.success("Profile updated successfully!");
        authStore.user = updatedUser;
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    ElMessage.error("Failed to update profile.");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  isLoading.value = false;
});
</script>

<style scoped>
:deep(.el-input__wrapper) {
  border-radius: 20px;
  height: 40px;
}

.content-container {
  max-width: 800px;
  padding: 2rem 1rem;
}

.profile-card {
  border-radius: 20px;
  padding: 30px;
}

.profile-form-card {
  border-radius: 20px;
  padding: 30px;
}

.avatar-uploader {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
