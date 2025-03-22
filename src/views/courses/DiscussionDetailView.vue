<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12 lg:col-span-8">
            <router-link :to="`/courses/${courseId}/lesson?tab=discussion`">
              <el-button type="default" style="color:#000;" size="large" icon="arrow-left">Back to Course</el-button>
            </router-link>

            <div class="flex items-center mb-5 mt-5">

              <h2 class="text-4xl font-bold">Discussion</h2>
            </div>
            <p style="color:gray;line-height: 20px;">
              View and participate in course discussions.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <FetchingData v-if="loading"></FetchingData>

      <!-- Error state -->
      <div v-else-if="!discussion" class="py-8">
        <el-empty description="Discussion not found or error loading discussion details">
          <template #extra>
            <router-link :to="`/courses/${courseId}`">
              <el-button type="primary">Back to Course</el-button>
            </router-link>
          </template>
        </el-empty>
      </div>

      <!-- Discussion details -->
      <div v-else class="discussion-details mt-6">
        <div class="discussion-header bg-white p-6 rounded-lg shadow-sm mb-6">
          <div class="flex items-start">
            <el-avatar :size="50"
              :src="`${$baseUrl}/uploads/${discussion.userPhotoURL}` || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
              class="mr-4" />
            <div class="flex-grow">
              <h3 class="text-2xl font-semibold mb-2">{{ discussion.title }}</h3>
              <p class="text-gray-700 mb-4">{{ discussion.content }}</p>
              <div class="discussion-meta flex items-center">
                <span class="text-sm text-gray-500">{{ discussion.displayName }}</span>
                <span class="text-sm text-gray-400 mx-2">•</span>
                <span class="text-sm text-gray-500">{{ formatDate(discussion.createdAt) }}</span>
              </div>
            </div>
            <!-- Delete button for discussion owner -->
            <div class="discussion-actions ml-2" v-if="discussion.userId === authStore.user?.uid">
              <el-button size="large" circle icon="delete" @click="confirmDeleteDiscussion(discussion)">

              </el-button>
            </div>
          </div>
        </div>

        <div class="comments-section bg-white p-6 rounded-lg shadow-sm">
          <h4 class="text-xl font-semibold mb-4">Comments</h4>

          <!-- Not enrolled message -->
          <el-alert v-if="!isEnrolled" title="You need to be enrolled in this course to participate in discussions"
            type="info" :closable="false" show-icon class="mb-4" />

          <!-- Comment input for enrolled users only -->
          <div v-if="isEnrolled" class="comment-form mb-6">
            <el-input v-model="newCommentContent" type="textarea" placeholder="Add a comment" :rows="3" class="mb-3" />
            <el-button type="primary" round size="large" @click="submitComment" :disabled="!newCommentContent.trim()">
              Add Comment
            </el-button>
          </div>

          <!-- Comments list -->
          <el-empty v-if="discussion.comments.length === 0" description="No comments yet" />
          <div v-else class="comment-list">
            <div v-for="comment in discussion.comments" :key="comment._id"
              class="comment-item p-4 border rounded-lg mb-3">
              <div class="flex items-start">
                <el-avatar :size="40"
                  :src="`${$baseUrl}/uploads/${comment.userPhotoURL}` || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                  class="mr-3" />
                <div class="comment-content flex-grow">
                  <p class="text-gray-700">{{ comment.content }}</p>
                  <div class="comment-meta flex items-center mt-2">
                    <span class="text-xs text-gray-500">{{ comment.displayName }}</span>
                    <span class="text-xs text-gray-400 mx-2">•</span>
                    <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                </div>
                <!-- Delete button for comment owner -->
                <div class="comment-actions ml-2" v-if="comment.userId === authStore.user?._id">
                  <el-button size="large" circle icon="delete" @click="confirmDeleteComment(comment)">

                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <el-dialog v-model="deleteConfirmationVisible" title="Confirm Deletion" :width="isMobile ? '90%' : '600px'">
      <div class="delete-confirmation-content">
        <p>{{ deleteConfirmationMessage }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button style="color:gray;" size="large" round
            @click="deleteConfirmationVisible = false">Cancel</el-button>
          <el-button size="large" round type="danger" @click="handleDelete">
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
import { getDiscussionById, addComment, deleteDiscussion, deleteComment } from '@/api/user/discussion.api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { ElDialog, ElButton, ElAlert, ElAvatar, ElInput } from 'element-plus';
import type { Discussion, CreateCommentPayload, Comment } from '@/types/discussion';
import FetchingData from '@/components/FetchingData.vue';
import { useWindowSize } from '@/use/useWindowSize';
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const route = useRoute();
const discussionId = route.params.id as string;
const courseId = route.params.courseId as string;
const loading = ref<boolean>(true);
const discussion = ref<Discussion | null>(null);
const isEnrolled = ref(true);
const newCommentContent = ref('');
const deleteConfirmationVisible = ref(false);
const deleteConfirmationMessage = ref('');
const itemToDelete = ref<{ type: 'discussion' | 'comment', id: string }>();
const { mobileMode: isMobile } = useWindowSize()
// Format date for display
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

const fetchDiscussionDetails = async () => {
  loading.value = true;
  try {
    const userId = authStore.user?.uid;
    const data = await getDiscussionById(discussionId, userId);
    discussion.value = data;
  } catch (error) {
    console.error('Error fetching discussion details:', error);
    notificationStore.showError('Failed to load discussion details', 'Error');
  } finally {
    loading.value = false;
  }
};

// // Check if user is enrolled in the course
// const checkEnrollmentStatus = async () => {
//   try {
//     if (authStore.user && authStore.user.uid) {
//       isEnrolled.value = await checkIfEnrolled(authStore.user._id, courseId);
//     }
//   } catch (error) {
//     console.error('Error checking enrollment status:', error);
//   }
// };

// Add a comment to the discussion
const submitComment = async () => {
  if (!authStore.user || !authStore.user._id || !discussion.value) {
    return;
  }

  if (!newCommentContent.value.trim()) {
    notificationStore.showWarning('Please enter a comment', 'Validation Error');
    return;
  }



  try {
    const payload: CreateCommentPayload = {
      content: newCommentContent.value,
      discussionId: discussion.value._id,
      userId: authStore.user._id,
      userPhotoURL: authStore.user.photoImg
    };

    await addComment(payload);
    newCommentContent.value = '';

    // Refresh the discussion to show the new comment
    await fetchDiscussionDetails();
    notificationStore.showSuccess('Comment added successfully', 'Success');
  } catch (error: unknown) {
    console.error('Error adding comment:', error);
    // Check if the error is related to enrollment
    if (error && typeof error === 'object' && 'response' in error &&
      error.response && typeof error.response === 'object' &&
      'status' in error.response) {
      if (error.response.status === 403) {
        notificationStore.showWarning('You need to be enrolled in this course to add comments', 'Enrollment Required');
      } else if (error.response.status === 400) {
        notificationStore.showWarning('You are not authorized to perform this action', 'Authorization Error');
      } else {
        notificationStore.showError('Failed to add comment', 'Error');
      }
    } else {
      notificationStore.showError('Failed to add comment', 'Error');
    }
  }
};

// Confirm delete discussion
const confirmDeleteDiscussion = (disc: Discussion) => {
  deleteConfirmationMessage.value = `Are you sure you want to delete this discussion? This action cannot be undone.`;
  deleteConfirmationVisible.value = true;
  itemToDelete.value = { type: 'discussion', id: disc._id };
};

// Confirm delete comment
const confirmDeleteComment = (comment: Comment) => {
  deleteConfirmationMessage.value = `Are you sure you want to delete this comment? This action cannot be undone.`;
  deleteConfirmationVisible.value = true;
  itemToDelete.value = { type: 'comment', id: comment._id };
};

// Handle delete
const handleDelete = async () => {
  if (!authStore.user?.uid || !itemToDelete.value || !discussion.value) return;

  try {
    if (itemToDelete.value.type === 'discussion') {
      await deleteDiscussion(itemToDelete.value.id, authStore.user.uid);
      notificationStore.showSuccess('Discussion deleted successfully', 'Success');
      // Navigate back to the course page

    } else if (itemToDelete.value.type === 'comment') {
      await deleteComment(discussion.value._id, itemToDelete.value.id, authStore.user._id);
      notificationStore.showSuccess('Comment deleted successfully', 'Success');
      // Refresh the discussion to show the updated comments
      await fetchDiscussionDetails();
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

onMounted(async () => {
  await fetchDiscussionDetails();
});
</script>

<style scoped>
.content-container {
  max-width: 1140px;
}

.discussion-details {
  margin-bottom: 2rem;
}

.discussion-header {
  border-left: 4px solid #000;
}

.comment-form {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.comment-item {
  transition: background-color 0.2s;
}

.comment-item:hover {
  background-color: #f9f9f9;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.delete-confirmation-content {
  padding: 1rem;
}

.discussion-actions,
.comment-actions {
  margin-left: auto;
}

.el-button.is-disabled,
.el-button.is-disabled:hover {
  background-color: rgb(195, 185, 185);
}
</style>
