<template>

  <FetchingData v-if="loading"></FetchingData>

  <div class="discussions-section mt-4" v-else>
    <div v-if="!isEnrolled && authStore.user.role !== 'T'" class="py-8">
      <el-alert title="You need to be enrolled in this course to participate in discussions" type="info"
        :closable="false" show-icon class="mb-4" />
    </div>
    <div v-else>
      <div class="discussions-header flex justify-between items-center mb-6">
        <h4 class="text-xl font-semibold">Discussions</h4>
        <el-button size="large" round type="primary" @click="openNewDiscussionModal" class="new-discussion-btn">
          <i class="material-icons mr-1" style="font-size: 16px;">add</i>
          New Discussion
        </el-button>
      </div>

      <el-empty v-if="props.discussions.length === 0"
        description="No discussions yet. Be the first to start a discussion!" />
      <div v-else class="discussions-list">
        <div v-for="discussion in props.discussions as Discussion[]" :key="discussion._id"
          class="discussion-item p-4 border rounded-lg mb-4 hover:bg-gray-50 cursor-pointer"
          @click="openDiscussionDetails(discussion)">
          <div class="flex items-start">
            <el-avatar :size="40"
              :src="`${baseUrl}/uploads/${discussion.userPhotoURL}` || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
              class="mr-3" />
            <div class="discussion-content flex-grow">
              <h5 class="font-medium text-lg">{{ discussion.title }}</h5>
              <p class="text-sm text-gray-600 mt-1">{{ discussion.content.substring(0, 100) }}{{
                discussion.content.length > 100 ? '...' : '' }}</p>
              <div class="discussion-meta flex items-center mt-2">
                <span class="text-xs text-gray-500">{{ discussion.displayName }}</span>
                <span class="text-xs text-gray-400 mx-2">•</span>
                <span class="text-xs text-gray-500">{{ formatDate(discussion.createdAt) }}</span>
                <span class="text-xs text-gray-400 mx-2">•</span>
                <span class="text-xs text-gray-500">
                  <i class="material-icons" style="font-size: 14px; vertical-align: middle;">comment</i>
                  {{ discussion.comments.length }} comments
                </span>
              </div>
            </div>
            <div class="discussion-actions ml-2" @click.stop>
              <el-button v-if="discussion.userId === authStore.user?._id" circle size="large" icon="delete"
                @click="confirmDeleteDiscussion(discussion)">
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="newDiscussionModalVisible" title="New Discussion" :before-close="handleCloseNewDiscussionModal"
    :width="isMobile ? '90%' : '1000px'">
    <div class="new-discussion-content">
      <el-form :model="newDiscussionForm" @submit.prevent="createNewDiscussion" label-position="top">
        <el-form-item label="Title">
          <el-input v-model="newDiscussionForm.title" placeholder="Enter the title" />
        </el-form-item>
        <el-form-item label="Content">
          <el-input v-model="newDiscussionForm.content" type="textarea" placeholder="Enter the content" />
        </el-form-item>
        <div class="flex justify-end">
          <el-form-item>
            <el-button round size="large" type="primary" @click="createNewDiscussion">Create
              Discussion</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </el-dialog>

  <el-dialog v-model="deleteConfirmationVisible" title="Confirm Delete" :width="isMobile ? '90%' : '600px'">
    <span>{{ deleteConfirmationMessage }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button round size="large" @click="deleteConfirmationVisible = false">Cancel</el-button>
        <el-button round size="large" type="danger" @click="handleDelete">Delete</el-button>
      </span>
    </template>
  </el-dialog>

</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { getCourseDiscussions, createDiscussion, getDiscussionById, deleteDiscussion, deleteComment } from '@/api/user/discussion.api';
import type { Discussion, CreateDiscussionPayload } from '@/types/discussion';
import FetchingData from '@/components/FetchingData.vue';
import { useWindowSize } from '@/use/useWindowSize';
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const { mobileMode: isMobile } = useWindowSize()
const props = defineProps<{
  courseId: string;
  course: any;
  discussions: Discussion[];
  isEnrolled: boolean;
}>();
const newDiscussionModalVisible = ref(false);
const newDiscussionForm = ref({
  title: '',
  content: ''
});
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const selectedDiscussion = ref<Discussion | null>(null);

const courseId = props.courseId;
const isEnrolled = props.isEnrolled;

const deleteConfirmationVisible = ref(false);
const deleteConfirmationMessage = ref('');
const itemToDelete = ref<{ type: 'discussion' | 'comment', id: string }>();

const emit = defineEmits<{
  'discussion-created': [discussion: Discussion];
  'discussions-updated': [discussions: Discussion[]];
}>();

onMounted(() => {
  fetchDiscussions();
});

const openNewDiscussionModal = () => {
  if (!courseId) return;

  if (!isEnrolled && authStore.user._id === props.course.teacherId) {
    notificationStore.showWarning('You need to be enrolled to start a discussion', 'Enrollment Required');
    return;
  }
  newDiscussionForm.value = { title: '', content: '' };
  newDiscussionModalVisible.value = true;
};

const loading = ref(false);

const createNewDiscussion = async () => {
  if (!authStore.user || !authStore.user._id) {
    notificationStore.showWarning('Please log in to create a discussion', 'Authentication Required');
    return;
  }

  if (!newDiscussionForm.value.title.trim() || !newDiscussionForm.value.content.trim()) {
    notificationStore.showWarning('Please provide both title and content', 'Validation Error');
    return;
  }

  try {
    const payload: CreateDiscussionPayload = {
      title: newDiscussionForm.value.title,
      content: newDiscussionForm.value.content,
      courseId: courseId,
      userId: authStore.user._id,
      userPhotoURL: authStore.user.photoImg ?? authStore.user.photoURL,
    };

    const newDiscussion = await createDiscussion(payload);
    notificationStore.showSuccess('Discussion created successfully', 'Success');
    newDiscussionModalVisible.value = false;

    // Emit an event to parent component to refresh discussions instead of trying to fetch them here
    emit('discussion-created', newDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    notificationStore.showError('Failed to create discussion', 'Error');
  }
};

const fetchDiscussions = async () => {
  if (!courseId) return;

  if (!isEnrolled && authStore.user._id === props.course.teacherId) return

  loading.value = true;
  try {
    const userId = authStore.user?.uid;
    const data = await getCourseDiscussions(courseId, userId);
    // Emit the discussions-updated event with the fetched data
    emit('discussions-updated', data);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    notificationStore.showError('Failed to load discussions', 'Error');
  } finally {
    loading.value = false;
  }
};

const openDiscussionDetails = async (discussion: Discussion) => {

  if (!isEnrolled && authStore.user._id === props.course.teacherId) {
    notificationStore.showWarning('You need to be enrolled in this course to view discussions', 'Enrollment Required');
    return;
  }

  router.push(`/courses/${courseId}/discussions/${discussion._id}`);
};

const confirmDeleteDiscussion = (discussion: Discussion) => {
  deleteConfirmationMessage.value = `Are you sure you want to delete this discussion? This action cannot be undone.`;
  deleteConfirmationVisible.value = true;
  selectedDiscussion.value = discussion;
  itemToDelete.value = { type: 'discussion', id: discussion._id };
};

const handleDelete = async () => {
  if (!authStore.user?.uid || !itemToDelete.value) return;

  try {
    if (itemToDelete.value.type === 'discussion') {
      await deleteDiscussion(itemToDelete.value.id, authStore.user._id);
      notificationStore.showSuccess('Discussion deleted successfully', 'Success');
      await fetchDiscussions();
      // Close the detail modal if it's open
      if (newDiscussionModalVisible.value) {
        newDiscussionModalVisible.value = false;
      }
    } else if (itemToDelete.value.type === 'comment' && selectedDiscussion.value) {
      await deleteComment(selectedDiscussion.value._id, itemToDelete.value.id, authStore.user._id);
      notificationStore.showSuccess('Comment deleted successfully', 'Success');

      // Refresh the discussion to show the updated comments
      const refreshedDiscussion = await getDiscussionById(selectedDiscussion.value._id, authStore.user._id);
      selectedDiscussion.value = refreshedDiscussion;

      // Update the local copy instead of mutating props
      const updatedDiscussions = [...props.discussions];
      const index = updatedDiscussions.findIndex(d => d._id === selectedDiscussion.value?._id);
      if (index !== -1) {
        updatedDiscussions[index] = refreshedDiscussion;
        emit('discussions-updated', updatedDiscussions);
      }
    }

    deleteConfirmationVisible.value = false;
  } catch (error: unknown) {
    console.error(`Error deleting ${itemToDelete.value.type}:`, error);

    // Check if the error is related to authorization
    if (error && typeof error === 'object' && 'response' in error &&
      error.response && typeof error.response === 'object' &&
      'status' in error.response && error.response.status === 400) {
      notificationStore.showWarning('You are not authorized to delete this item', 'Authorization Error');
    } else {
      notificationStore.showError(`Failed to delete ${itemToDelete.value.type}`, 'Error');
    }

    deleteConfirmationVisible.value = false;
  }
};

const handleCloseNewDiscussionModal = () => {
  newDiscussionModalVisible.value = false;
};
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (error: unknown) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

</script>
