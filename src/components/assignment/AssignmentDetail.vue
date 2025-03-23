<template>
  <div class="assignment-detail">
    <!-- Assignment Info -->
    <div class="assignment-info mb-6">
      <div class="flex justify-between items-start">
        <div>
          <div class="text-sm text-gray-500 mt-1 flex items-center">
            <i class="material-icons text-sm mr-1">person</i>
            {{ assignment.teacherName }}
            <span class="mx-2">•</span>
            <i class="material-icons text-sm mr-1">calendar_today</i>
            {{ formatDate(assignment.createdAt) }}
            <span v-if="assignment.dueDate" class="mx-2">•</span>
            <span v-if="assignment.dueDate" class="text-amber-600 font-medium flex items-center">
              <i class="material-icons text-sm mr-1">event</i>
              Due: {{ formatDate(assignment.dueDate) }}
            </span>
          </div>
        </div>
        <div v-if="!isTeacher">
          <el-tag v-if="hasSubmitted" type="success" size="small">
            Submitted
          </el-tag>
          <el-tag v-else-if="isOverdue" type="danger" size="small">
            Overdue
          </el-tag>
          <el-tag v-else type="warning" size="small">
            Not Submitted
          </el-tag>
        </div>
      </div>

      <div class="mt-4" v-if="assignment.description">
        <p class="text-gray-700 whitespace-pre-line">{{ assignment.description }}</p>
      </div>

      <div class="mt-4" v-if="assignment.attachments && assignment.attachments.length > 0">
        <div class="text-sm font-medium mb-2">Attachments:</div>
        <div class="flex flex-wrap">
          <div v-for="(attachment, index) in assignment.attachments" :key="index" class="attachment-chip">
            <a :href="`${baseUrl}${attachment.fileUrl}`" target="_blank"
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              <i class="material-icons text-sm mr-1">attach_file</i>
              {{ attachment.originalname }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Submission Section -->
    <div v-if="!isTeacher" class="student-submission mt-6">
      <el-divider>Your Submission</el-divider>

      <div v-if="studentSubmission" :key="`submission-${studentSubmission.submittedAt}`" class="mb-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm text-gray-500">
              Submitted on {{ formatDate(studentSubmission.submittedAt) }}
            </div>
            <div v-if="studentSubmission.comment" class="mt-2">
              <div class="text-sm font-medium">Comment:</div>
              <p class="text-gray-700 whitespace-pre-line">{{ studentSubmission.comment }}</p>
            </div>
          </div>
          <div v-if="studentSubmission.grade !== undefined">
            <el-tag type="success" size="large">
              Grade: {{ studentSubmission.grade }}/100
            </el-tag>
          </div>
        </div>

        <div class="mt-3" v-if="studentSubmission.files && studentSubmission.files.length > 0">
          <div class="text-sm font-medium mb-2">Your Files:</div>
          <div class="flex flex-wrap">
            <div v-for="(file, index) in studentSubmission.files" :key="index"
              class="attachment-chip flex items-center">
              <a :href="`${baseUrl}${file.fileUrl}`" target="_blank"
                class="text-sm text-blue-600 hover:text-blue-800 flex items-center mr-2">
                <i class="material-icons text-sm mr-1">attach_file</i>
                {{ file.originalname }}
              </a>
              <!-- <button @click="removeExistingFile(index)" class="text-red-500 hover:text-red-700" title="Remove file">
                <i class="material-icons text-sm">close</i>
              </button> -->
            </div>
          </div>
        </div>

        <div v-if="studentSubmission.feedback" class="mt-4 p-3 bg-blue-50 rounded-md">
          <div class="text-sm font-medium">Teacher Feedback:</div>
          <p class="text-gray-700 whitespace-pre-line">{{ studentSubmission.feedback }}</p>
        </div>

        <div class="mt-4">
          <el-button round type="default" @click="initUpdateForm">
            Update Submission
          </el-button>
        </div>

        <!-- Update submission form -->
        <div v-if="showSubmitForm" class="mt-4">
          <el-form ref="submissionFormRef" :model="submissionForm" label-position="top"
            @submit.prevent="submitAssignment" class="p-4 border border-gray-200 rounded-md">
            <el-form-item label="Comment (Optional)">
              <el-input v-model="submissionForm.comment" type="textarea" :rows="3"
                placeholder="Add a comment to your submission" />
            </el-form-item>

            <el-form-item v-if="studentSubmission.files && studentSubmission.files.length > 0" label="Current Files">
              <div class="flex flex-wrap">
                <div v-for="(file, index) in studentSubmission.files" :key="index"
                  class="attachment-chip flex items-center mb-2 mr-2"
                  :class="{ 'opacity-50 line-through': removedFileIndices.includes(index) }">
                  <a :href="`${baseUrl}${file.fileUrl}`" target="_blank"
                    class="text-sm text-blue-600 hover:text-blue-800 flex items-center mr-2">
                    <i class="material-icons text-sm mr-1">attach_file</i>
                    {{ file.originalname }}
                  </a>
                  <button @click="removeExistingFile(index)" class="text-red-500 hover:text-red-700" title="Remove file"
                    type="button">
                    <i class="material-icons text-sm">close</i>
                  </button>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="Add New Files">
              <el-upload ref="uploadRef" multiple :auto-upload="false" :on-change="handleFileChange"
                :on-remove="handleFileRemove" action="#">
                <el-button round type="default">
                  <i class="material-icons mr-1">attach_file</i>
                  Select Files
                </el-button>
              </el-upload>
            </el-form-item>

            <div class="flex justify-end mt-4">
              <el-button size="large" round style="color:#ff2052;" @click="showSubmitForm = false" class="mr-2">
                Cancel
              </el-button>
              <el-button size="large" round type="primary" native-type="submit" :loading="submitting">
                Update Submission
              </el-button>
            </div>
          </el-form>
        </div>
      </div>

      <div v-else>
        <p class="text-gray-600 mb-4">You haven't submitted this assignment yet.</p>

        <!-- Direct submission form instead of modal -->
        <el-form ref="submissionFormRef" :model="submissionForm" label-position="top" @submit.prevent="submitAssignment"
          class="mt-4">
          <el-form-item label="Comment (Optional)">
            <el-input v-model="submissionForm.comment" type="textarea" :rows="3"
              placeholder="Add a comment to your submission" />
          </el-form-item>

          <el-form-item label="Files">
            <el-upload ref="uploadRef" multiple :auto-upload="false" :on-change="handleFileChange"
              :on-remove="handleFileRemove" action="#">
              <el-button type="default">
                <i class="material-icons mr-1">attach_file</i>
                Select Files
              </el-button>
            </el-upload>
          </el-form-item>

          <div class="flex justify-end mt-4" v-if="!isOverdue">
            <el-button round size="large" type="primary" native-type="submit" :loading="submitting">
              Submit Assignment
            </el-button>
          </div>
        </el-form>
      </div>
    </div>

    <!-- Teacher View - Submissions List -->
    <div v-else class="teacher-view mt-6">
      <el-divider>Student Submissions ({{ assignment.submissions?.length || 0 }})</el-divider>

      <div v-if="!assignment.submissions || assignment.submissions.length === 0" class="text-center py-4">
        <el-empty description="No submissions yet" />
      </div>

      <div v-else>
        <el-table :data="assignment.submissions" style="width: 100%">
          <el-table-column prop="displayName" label="Student" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <el-avatar v-if="scope.row.userPhotoURL" :src="scope.row.userPhotoURL" size="small" class="mr-2" />
                <span>{{ scope.row.displayName || 'Unknown Student' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="submittedAt" label="Submitted" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.submittedAt) }}
            </template>
          </el-table-column>

          <el-table-column prop="files" label="Files" width="100">
            <template #default="scope">
              {{ scope.row.files?.length || 0 }} files
            </template>
          </el-table-column>

          <el-table-column prop="grade" label="Grade" width="120">
            <template #default="scope">
              <div v-if="scope.row.grade !== undefined">
                <el-tag type="success">{{ scope.row.grade }}/100</el-tag>
              </div>
              <div v-else>
                <el-tag type="info">Not graded</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Actions" width="120">
            <template #default="scope">
              <el-button circle size="large" @click="viewSubmission(scope.row)">
                <el-icon>
                  <DocumentChecked />
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- View Submission Modal -->
      <el-dialog v-model="showSubmissionModal" title="Student Submission" :width="isMobile ? '90%' : '1000px'">

        <div v-if="selectedSubmission" class="submission-detail">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="flex items-center">
                <el-avatar v-if="selectedSubmission.userPhotoURL" :src="selectedSubmission.userPhotoURL" size="small"
                  class="mr-2" />
                <h3 class="text-lg font-semibold">{{ selectedSubmission.displayName || 'Unknown Student' }}</h3>
              </div>
              <div class="text-sm text-gray-500 mt-1">
                Submitted on {{ formatDate(selectedSubmission.submittedAt) }}
              </div>
            </div>
            <div v-if="selectedSubmission.grade !== undefined">
              <el-tag type="success" size="large">
                Grade: {{ selectedSubmission.grade }}/100
              </el-tag>
            </div>
          </div>

          <div v-if="selectedSubmission.comment" class="mb-4">
            <div class="text-sm font-medium">Comment:</div>
            <p class="text-gray-700 whitespace-pre-line">{{ selectedSubmission.comment }}</p>
          </div>

          <div class="mb-4" v-if="selectedSubmission.files && selectedSubmission.files.length > 0">
            <div class="text-sm font-medium mb-2">Files:</div>
            <div class="flex flex-wrap">
              <div v-for="(file, index) in selectedSubmission.files" :key="index" class="attachment-chip">
                <a :href="`${baseUrl}${file.fileUrl}`" target="_blank"
                  class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  <i class="material-icons text-sm mr-1">attach_file</i>
                  {{ file.originalname }}
                </a>
              </div>
            </div>
          </div>

          <el-divider>Grade Submission</el-divider>

          <el-form ref="gradeFormRef" :model="gradeForm" label-position="top" @submit.prevent="submitGrade">
            <el-form-item label="Grade (0-100)" prop="grade">
              <el-input-number v-model="gradeForm.grade" :min="0" :max="100" :precision="0" />
            </el-form-item>

            <el-form-item label="Feedback" prop="feedback">
              <el-input v-model="gradeForm.feedback" type="textarea" :rows="3"
                placeholder="Provide feedback to the student" />
            </el-form-item>

            <div class="flex justify-end mt-4">
              <el-button round size="large" style="color:red;" @click="showSubmissionModal = false">Cancel</el-button>
              <el-button round size="large" type="primary" native-type="submit" :loading="grading">
                Submit Grade
              </el-button>
            </div>
          </el-form>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElButton, ElTag, ElDivider, ElForm, ElFormItem, ElInput, ElUpload, ElTable, ElTableColumn, ElAvatar, ElInputNumber, ElDialog, ElEmpty } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { getStudentSubmission, gradeSubmission, submitAssignment as submitAssignmentAPI } from '@/api/assignment/assignment.api';
import type { Assignment, Submission, SubmissionFormData } from '@/types/assignment';
import type { UploadFile } from 'element-plus';
import { useWindowSize } from '@/use/useWindowSize';

// Define props
const props = defineProps<{
  assignment: Assignment;
  isTeacher: boolean;
}>();

// Define emits
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'update:assignment', assignment: Assignment): void;
}>();

const { mobileMode: isMobile } = useWindowSize()
const baseUrl = import.meta.env.VITE_APP_BASE_URL;

// Component state
const studentSubmission = ref<Submission | null>(null);
const showSubmitForm = ref(false);
const submitting = ref(false);
const uploadRef = ref<InstanceType<typeof ElUpload> | null>(null);
const submissionFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const fileList = ref<File[]>([]);
const removedFileIndices = ref<number[]>([]);
const showSubmissionModal = ref(false);
const selectedSubmission = ref<Submission | null>(null);
const gradeFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const grading = ref(false);

// Store access
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Computed properties
const isOverdue = computed(() => {
  if (!props.assignment.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(props.assignment.dueDate);
  return now > dueDate;
});

watch(() => props.assignment, async (newAssignment, oldAssignment) => {
  console.log('Assignment prop changed');
  if (newAssignment && !props.isTeacher && authStore.user) {
    if (!oldAssignment || newAssignment._id !== oldAssignment._id ||
      JSON.stringify(newAssignment.submissions) !== JSON.stringify(oldAssignment.submissions)) {
      console.log('Fetching student submission due to assignment change');
      submissionForm.value = {
        userId: authStore.user?._id || '',
        displayName: authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Unknown Student',
        userPhotoURL: authStore.user?.photoURL || '',
        comment: '',
      };
      fileList.value = [];
      removedFileIndices.value = [];
      showSubmitForm.value = false;
      if (uploadRef.value?.$refs?.upload) {
        (uploadRef.value.$refs.upload as { clearFiles: () => void }).clearFiles();
      }
      await fetchStudentSubmission();
    }
  }
}, { deep: true });

const hasSubmitted = computed(() => {
  if (!authStore.user) return false;

  if (studentSubmission.value) {
    return true;
  }

  return props.assignment.submissions?.some(sub => sub.userId === authStore.user?._id) || false;
});

// Submission form
const submissionForm = ref<SubmissionFormData>({
  userId: authStore.user?._id || '',
  displayName: authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Unknown Student',
  userPhotoURL: authStore.user?.photoURL || '',
  comment: '',
});

// Grade form
const gradeForm = ref({
  grade: 0,
  feedback: '',
});

// Format date
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

// Initialize update form with existing data
const initUpdateForm = () => {
  if (studentSubmission.value) {
    submissionForm.value.comment = studentSubmission.value.comment || '';
    removedFileIndices.value = [];
    showSubmitForm.value = true;
  }
};

// Handle file change
const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    fileList.value.push(file.raw);
  }
};

// Handle file remove
const handleFileRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex(f =>
    f.name === file.name && f.size === file.size
  );
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

// Remove existing file
const removeExistingFile = (index: number) => {
  if (!studentSubmission.value || !studentSubmission.value.files) return;
  removedFileIndices.value.push(index);
};

// Define a local function for submitting assignments to avoid name conflict
const submitAssignmentToAPI = async (assignmentId: string, formData: FormData) => {
  // Use the imported API function which has the correct endpoint
  return await submitAssignmentAPI(assignmentId, formData);
};

const resetForm = () => {
  submissionForm.value = {
    userId: authStore.user?._id || '',
    displayName: authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Unknown Student',
    userPhotoURL: authStore.user?.photoURL || '',
    comment: '',
  };
  fileList.value = [];
  removedFileIndices.value = [];
  if (uploadRef.value?.$refs?.upload) {
    (uploadRef.value.$refs.upload as { clearFiles: () => void }).clearFiles();
  }
};

// Submit assignment
const submitAssignment = async () => {
  if (!props.assignment || !authStore.user) return;

  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append('userId', authStore.user._id);
    formData.append('displayName', authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'Unknown Student');
    if (authStore.user.photoURL) {
      formData.append('userPhotoURL', authStore.user.photoURL);
    }

    if (submissionForm.value.comment) {
      formData.append('comment', submissionForm.value.comment);
    }

    // Handle existing files
    if (studentSubmission.value?.files?.length) {
      const filesToKeep = studentSubmission.value.files.filter((_, index) =>
        !removedFileIndices.value.includes(index)
      );

      if (filesToKeep.length > 0) {
        formData.append('existingFiles', JSON.stringify(filesToKeep));
        formData.append('keepExistingFiles', 'true');
      }
    }

    if (fileList.value.length > 0) {
      fileList.value.forEach((file: File) => {
        formData.append('files', file);
      });
    }

    await submitAssignmentToAPI(props.assignment._id, formData);

    resetForm();
    showSubmitForm.value = false;

    // Fetch fresh submission data
    await fetchStudentSubmission();

    // Tell parent to refresh
    emit('refresh');

    notificationStore.showSuccess('Assignment submitted successfully', 'Success');
  } catch (error) {
    console.error('Error submitting assignment:', error);
    notificationStore.showError(
      error instanceof Error ? error.message : 'Failed to submit assignment',
      'Error'
    );
  } finally {
    submitting.value = false;
  }
};

// Fetch student submission
const fetchStudentSubmission = async () => {
  if (!props.assignment || !authStore.user) return;

  try {
    const submission = await getStudentSubmission(props.assignment._id, authStore.user._id);
    studentSubmission.value = submission ? JSON.parse(JSON.stringify(submission)) : null;

    if (submission) {
      submissionForm.value.comment = submission.comment || '';
    }
  } catch (error) {
    console.error('Error fetching student submission:', error);
    notificationStore.showError('Failed to fetch your submission', 'Error');
  }
};

// View submission (teacher)
const viewSubmission = (submission: Submission) => {
  selectedSubmission.value = submission;

  // Initialize grade form with existing data
  gradeForm.value.grade = submission.grade !== undefined ? submission.grade : 0;
  gradeForm.value.feedback = submission.feedback || '';

  showSubmissionModal.value = true;
};

// Submit grade (teacher)
const submitGrade = async () => {
  if (!gradeFormRef.value || !selectedSubmission.value) return;

  try {
    grading.value = true;

    await gradeSubmission(
      props.assignment._id,
      selectedSubmission.value.userId,
      {
        grade: gradeForm.value.grade,
        feedback: gradeForm.value.feedback
      }
    );

    // Update the local selectedSubmission
    if (selectedSubmission.value) {
      selectedSubmission.value.grade = gradeForm.value.grade;
      selectedSubmission.value.feedback = gradeForm.value.feedback;
    }

    // Update the submission in the assignment's submissions array
    if (props.assignment.submissions) {
      const submissionIndex = props.assignment.submissions.findIndex(
        sub => sub.userId === selectedSubmission.value?.userId
      );

      if (submissionIndex !== -1) {
        // Create a new assignment object to avoid mutating props directly
        const updatedAssignment = JSON.parse(JSON.stringify(props.assignment));
        updatedAssignment.submissions[submissionIndex].grade = gradeForm.value.grade;
        updatedAssignment.submissions[submissionIndex].feedback = gradeForm.value.feedback;

        // Emit the updated assignment to the parent
        emit('update:assignment', updatedAssignment);
      }
    }

    // Close modal
    showSubmissionModal.value = false;

    // Emit refresh to get fresh data from server
    emit('refresh');

    notificationStore.showSuccess('Submission graded successfully', 'Success');
  } catch (error) {
    console.error('Grading error:', error);
    notificationStore.showError('Failed to grade submission', 'Error');
  } finally {
    grading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  if (!props.isTeacher) {
    await fetchStudentSubmission();
  }
});
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

.whitespace-pre-line {
  white-space: pre-line;
}
</style>
