<template>
  <div class="assignment-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submitForm">
      <el-form-item label="Title" prop="title">
        <el-input v-model="form.title" placeholder="Enter assignment title" />
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="Enter assignment description" />
      </el-form-item>

      <el-form-item label="Due Date" prop="dueDate">
        <el-date-picker v-model="form.dueDate" type="datetime" placeholder="Select due date and time"
          format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disablePastDates" />
      </el-form-item>

      <el-form-item label="Attachments">
        <el-upload ref="uploadRef" multiple :auto-upload="false" :on-change="handleFileChange"
          :on-remove="handleFileRemove" :file-list="fileList" action="#">
          <el-button size="large" style="color:#000">
            <i class="material-icons mr-1">attach_file</i>
            Select Files
          </el-button>
        </el-upload>
      </el-form-item>

      <div v-if="isEditing && assignment?.attachments?.length" class="mb-4">
        <div class="text-sm font-medium mb-2">Current Attachments:</div>
        <div class="flex flex-wrap">
          <div v-for="(attachment, index) in assignment.attachments" :key="index" class="attachment-chip">
            <a :href="attachment.fileUrl" target="_blank"
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              <i class="material-icons text-sm mr-1">attach_file</i>
              {{ truncateText(attachment.originalname, 20) }}
            </a>
            <i class="material-icons text-red-500 text-sm ml-1 cursor-pointer" @click="removeExistingAttachment(index)">
              close
            </i>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <el-button size="large" round style="color:#ff2052;" @click="cancel">Cancel</el-button>
        <el-button size="large" round type="primary" native-type="submit" :loading="loading">
          {{ isEditing ? 'Update' : 'Create' }} Assignment
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElDatePicker, ElUpload, ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { createAssignment, updateAssignment } from '@/api/assignment/assignment.api';
import type { Assignment, AssignmentFormData } from '@/types/assignment';

// Define props
const props = defineProps<{
  courseId: string;
  assignment?: Assignment;
}>();

// Define emits
const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

// Component state
const formRef = ref<InstanceType<typeof ElForm> | null>(null);
const uploadRef = ref<InstanceType<typeof ElUpload> | null>(null);
const loading = ref(false);
const fileList = ref<any[]>([]);
const removedAttachmentIndices = ref<number[]>([]);

// Get auth store
const authStore = useAuthStore();

// Computed properties
const isEditing = computed(() => !!props.assignment);

// Form data
const form = reactive<AssignmentFormData>({
  title: '',
  description: '',
  courseId: props.courseId,
  teacherId: authStore.user?.uid || '',
  teacherName: authStore.user?.displayName || '',
  teacherPhotoURL: authStore.user?.photoURL || '',
  dueDate: undefined,
  keepExistingAttachments: true,
});

// Form validation rules
const rules = {
  title: [
    { required: true, message: 'Please enter a title', trigger: 'blur' },
    { min: 3, max: 100, message: 'Title must be between 3 and 100 characters', trigger: 'blur' },
  ],
  description: [
    { max: 2000, message: 'Description cannot exceed 2000 characters', trigger: 'blur' },
  ],
};

// Initialize form with assignment data if editing
onMounted(() => {
  if (props.assignment) {
    form.title = props.assignment.title;
    form.description = props.assignment.description || '';
    form.dueDate = props.assignment.dueDate;
    // fileList.value = props.assignment.attachments || [];
  }
});

// Handle file change
const handleFileChange = (file: any, newFileList: any) => {
  console.log('File added:', file);

  // อัปเดต fileList โดยตรง
  fileList.value = newFileList.map((f: any) => f.raw);
  console.log('Updated file list:', fileList.value);
};

const handleFileRemove = (file: any) => {
  console.log('File removed:', file);

  // ลบไฟล์ออกจาก fileList โดยเปรียบเทียบกับ file.raw หรืออาจจะใช้ไฟล์อื่นๆ ที่สามารถเทียบได้
  fileList.value = fileList.value.filter((f: any) => f.name !== file.name);
  console.log('Updated file list after remove:', fileList.value);
};

// Remove existing attachment
const removeExistingAttachment = (index: number) => {
  if (!props.assignment || !props.assignment.attachments) return;

  removedAttachmentIndices.value.push(index);
};

// Disable past dates in date picker
const disablePastDates = (date: Date) => {
  return date.getTime() < Date.now() - 8.64e7; // Allow today
};

// Truncate text
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};


const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    // สร้าง FormData สำหรับส่งข้อมูล
    const formData = new FormData();

    formData.append('title', form.title);
    formData.append('description', form.description || '');
    formData.append('courseId', form.courseId);
    formData.append('teacherId', form.teacherId);
    formData.append('teacherName', form.teacherName);
    formData.append('dueDate', form.dueDate ? new Date(form.dueDate).toISOString() : '');

    // เพิ่มไฟล์ไปใน FormData
    if (fileList.value.length > 0) {
      fileList.value.forEach((file: any) => {
        formData.append('files', file); // ส่งไฟล์จริงไปที่ฟิลด์ 'files'

      });
    }

    // ส่งข้อมูลไปยัง API
    if (isEditing.value && props.assignment) {
      await updateAssignment(props.assignment._id, formData);
    } else {
      await createAssignment(formData);
    }

    // รีเซ็ตฟอร์ม
    resetForm();
    emit('submit');
  } catch (error) {
    console.error('Form validation or submission error:', error);
    ElMessage.error('Please check the form for errors');
  } finally {
    loading.value = false;
  }
};




// Reset form
const resetForm = () => {
  form.title = '';
  form.description = '';
  form.dueDate = undefined;

  // Clear file list
  fileList.value = [];
  removedAttachmentIndices.value = [];

  // Clear upload component
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }

  // Reset form validation
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// Cancel form
const cancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.attachment-chip {
  display: inline-flex;
  align-items: center;
  background-color: #f0f7ff;
  border-radius: 4px;
  padding: 2px 8px;
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
