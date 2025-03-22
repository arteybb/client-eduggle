<template>
  <div class="assignment-list">
    <div class="header-section mb-6">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-semibold">Assignments</h3>
        <el-button round size="large" v-if="isTeacher" type="primary" @click="showCreateAssignmentModal = true">
          <i class="material-icons mr-1" style="font-size: 16px;">add</i>
          Create Assignment
        </el-button>
      </div>

    </div>

    <!-- Loading state -->
    <FetchingData v-if="loading"></FetchingData>

    <!-- Empty state -->
    <div v-else-if="assignments.length === 0" class="py-8 text-center">
      <el-empty description="No assignments found">
        <template #extra v-if="isTeacher">
          <el-button type="primary" @click="showCreateAssignmentModal = true">
            Create First Assignment
          </el-button>
        </template>
      </el-empty>
    </div>

    <!-- Assignment list -->
    <div v-else class="assignment-cards">
      <el-card v-for="assignment in assignments" :key="assignment._id" class="mb-4 assignment-card" shadow="hover">

        <div class="flex justify-between">
          <div>
            <h3 class="text-xl font-semibold">{{ assignment.title }}</h3>
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
          <div class="flex items-center" style="position:relative;bottom:15px;left:10px;">
            <el-button size="large" circle @click="viewAssignment(assignment)">
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
                  <el-dropdown-item @click="editAssignment(assignment)">
                    <i class="material-icons text-sm mr-1">edit</i> Edit
                  </el-dropdown-item>
                  <el-dropdown-item @click="confirmDeleteAssignment(assignment)" class="text-red-500">
                    <i class="material-icons text-sm mr-1">delete</i> Delete
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="mt-3" v-if="assignment.description">
          <p class="text-gray-700">{{ truncateText(assignment.description, 150) }}</p>
        </div>

        <div class="mt-3 flex flex-wrap" v-if="assignment.attachments && assignment.attachments.length > 0">
          <div class="text-sm font-medium mr-2">Attachments:</div>
          <div v-for="(attachment, index) in assignment.attachments" :key="index" class="attachment-chip">
            <a :href="`${$baseUrl}${attachment.fileUrl}`" target="_blank"
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center mr-2 mb-2">
              <i class="material-icons text-sm mr-1">attach_file</i>
              {{ truncateText(attachment.originalname, 20) }}
            </a>
          </div>
        </div>

        <div class="mt-3 flex justify-between items-center">
          <div class="flex items-center">
            <i class="material-icons text-purple-500 mr-1">assignment_turned_in</i>
            <span class="text-sm">
              {{ assignment.submissions?.length || 0 }} submissions
            </span>
          </div>

          <div v-if="!isTeacher">
            <el-tag v-if="hasSubmitted(assignment)" type="success" size="small">
              Submitted
            </el-tag>
            <el-tag v-else-if="isOverdue(assignment)" type="danger" size="small">
              Overdue
            </el-tag>
            <el-tag v-else type="warning" size="small">
              Not Submitted
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Create Assignment Modal -->
    <el-dialog v-model="showCreateAssignmentModal" title="Create Assignment" :width="isMobile ? '90%' : '1000px'">
      <AssignmentForm :course-id="courseId" @submit="createNewAssignment" @cancel="showCreateAssignmentModal = false" />
    </el-dialog>

    <!-- Edit Assignment Modal -->
    <el-dialog v-model="showEditAssignmentModal" title="Edit Assignment" :width="isMobile ? '90%' : '1000px'">
      <AssignmentForm v-if="selectedAssignment" :course-id="courseId" :assignment="selectedAssignment"
        @submit="updateExistingAssignment" @cancel="showEditAssignmentModal = false" />
    </el-dialog>

    <!-- View Assignment Modal -->
    <el-dialog v-model="showViewAssignmentModal" :title="selectedAssignment?.title || 'Assignment Details'"
      :width="isMobile ? '90%' : '1000px'">
      <AssignmentDetail v-if="selectedAssignment" :assignment="selectedAssignment" :is-teacher="isTeacher"
        @refresh="fetchAssignments" @update:assignment="updateAssignment" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { ElButton, ElCard, ElEmpty, ElTag, ElDialog, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox } from 'element-plus';
import { getAssignmentsByCourse, deleteAssignment, getAssignmentById } from '@/api/assignment/assignment.api';
import type { Assignment } from '@/types/assignment';
import AssignmentForm from '@/components/assignment/AssignmentForm.vue';
import AssignmentDetail from '@/components/assignment/AssignmentDetail.vue';
import FetchingData from '../FetchingData.vue';
import { useRoute } from 'vue-router';
import { useWindowSize } from '@/use/useWindowSize';
const { mobileMode: isMobile } = useWindowSize()
// Define props
const props = defineProps<{
  courseId: string;
}>();

// Component state
const assignments = ref<Assignment[]>([]);
const loading = ref(true);
const showCreateAssignmentModal = ref(false);
const showEditAssignmentModal = ref(false);
const showViewAssignmentModal = ref(false);
const selectedAssignment = ref<Assignment | null>(null);

// Store access
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

// Computed properties
const isTeacher = computed(() => {
  return authStore.user?.role === 'T';
});

// Fetch assignments
const fetchAssignments = async () => {
  try {
    loading.value = true;
    assignments.value = await getAssignmentsByCourse(props.courseId);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    notificationStore.showError('Failed to load assignments', 'Error');
  } finally {
    loading.value = false;
  }
};

// Format date
const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Truncate text
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Check if student has submitted
const hasSubmitted = (assignment: Assignment) => {
  if (!authStore.user) return false;
  return assignment.submissions?.some(sub => sub.userId === authStore.user?._id);
};

// Check if assignment is overdue
const isOverdue = (assignment: Assignment) => {
  if (!assignment.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  return now > dueDate;
};

// View assignment
const viewAssignment = (assignment: Assignment) => {
  selectedAssignment.value = assignment;
  showViewAssignmentModal.value = true;
};

// Update assignment when it changes in the child component
const updateAssignment = (updatedAssignment: Assignment) => {
  if (selectedAssignment.value) {
    // Update the selected assignment with a new object to ensure reactivity
    selectedAssignment.value = { ...updatedAssignment };

    // Also update the assignment in the assignments list
    const index = assignments.value.findIndex(a => a._id === updatedAssignment._id);
    if (index !== -1) {
      // Replace the assignment with a new object to ensure reactivity
      assignments.value[index] = { ...updatedAssignment };
    }
  }
};

// Edit assignment
const editAssignment = (assignment: Assignment) => {
  selectedAssignment.value = assignment;
  showEditAssignmentModal.value = true;
};

// Create new assignment
const createNewAssignment = async () => {
  showCreateAssignmentModal.value = false;
  await fetchAssignments();
  notificationStore.showSuccess('Assignment created successfully', 'Success');
};

// Update existing assignment
const updateExistingAssignment = async () => {
  showEditAssignmentModal.value = false;
  await fetchAssignments();
  notificationStore.showSuccess('Assignment updated successfully', 'Success');
};

// Delete assignment
const confirmDeleteAssignment = (assignment: Assignment) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`,
    'Delete Assignment',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteAssignment(assignment._id);
        await fetchAssignments();
        notificationStore.showSuccess('Assignment deleted successfully', 'Success');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        notificationStore.showError('Failed to delete assignment', 'Error');
      }
    })
    .catch(() => {
      // User cancelled the deletion
    });
};

// Check for assignmentId in URL and open the assignment dialog
const checkForAssignmentInUrl = async () => {
  const assignmentId = route.query.assignmentId as string;
  if (assignmentId && assignments.value.length > 0) {
    // Find the assignment in the loaded assignments
    const assignment = assignments.value.find(a => a._id === assignmentId);
    if (assignment) {
      viewAssignment(assignment);
    } else {
      // If not found in the loaded assignments, try to fetch it directly
      try {
        const fetchedAssignment = await getAssignmentById(assignmentId);
        if (fetchedAssignment) {
          selectedAssignment.value = fetchedAssignment;
          showViewAssignmentModal.value = true;
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
        notificationStore.showError('Failed to load the assignment', 'Error');
      }
    }
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchAssignments();
  checkForAssignmentInUrl();
});

// Watch for changes in the route query parameters
watch(() => route.query.assignmentId, async (newAssignmentId) => {
  if (newAssignmentId) {
    await checkForAssignmentInUrl();
  }
});
</script>

<style scoped>
.assignment-card {
  transition: all 0.3s ease;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.attachment-chip {
  display: inline-flex;
  align-items: center;
  background-color: #f0f7ff;
  border-radius: 16px;
  padding: 2px 8px;
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
