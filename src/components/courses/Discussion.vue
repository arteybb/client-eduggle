<template>
  <div class="discussions-section mt-4">
    <!-- Not enrolled message -->
    <div v-if="!isEnrolled" class="py-8">
      <el-alert title="You need to be enrolled in this course to participate in discussions" type="info"
        :closable="false" show-icon class="mb-4" />
    </div>

    <!-- Content only visible for enrolled users -->
    <div v-else>
      <div class="discussions-header flex justify-between items-center mb-6">
        <h4 class="text-xl font-semibold">Discussions</h4>
        <el-button type="primary" @click="openNewDiscussionModal" class="new-discussion-btn">
          <i class="material-icons mr-1" style="font-size: 16px;">add</i>
          New Discussion
        </el-button>
      </div>

      <FetchingData v-if="loading"></FetchingData>


      <!-- No discussions yet -->
      <el-empty v-else-if="discussions.length === 0"
        description="No discussions yet. Be the first to start a discussion!" />

      <!-- Discussions list -->
      <div v-else class="discussions-list">
        <div v-for="discussion in discussions" :key="discussion._id"
          class="discussion-item p-4 border rounded-lg mb-4 hover:bg-gray-50 cursor-pointer"
          @click="openDiscussionDetails(discussion)">
          <div class="flex items-start">
            <el-avatar :size="40"
              :src="discussion.userPhotoURL || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
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
            <!-- Delete button for discussion owner -->
            <div class="discussion-actions ml-2" @click.stop>
              <el-button v-if="discussion.userId === authStore.user?.uid" type="danger" size="small" icon="delete"
                @click="confirmDeleteDiscussion(discussion)">
                Delete
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="newDiscussionModalVisible" title="New Discussion" width="30%"
    :before-close="handleCloseNewDiscussionModal">
    <div class="new-discussion-content">
      <el-form :model="newDiscussionForm" @submit.prevent="createNewDiscussion">
        <el-form-item label="Title">
          <el-input v-model="newDiscussionForm.title" />
        </el-form-item>
        <el-form-item label="Content">
          <el-input v-model="newDiscussionForm.content" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createNewDiscussion">Create Discussion</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>

  <el-dialog v-model="deleteConfirmationVisible" title="Confirm Deletion" width="30%">
    <div class="delete-confirmation-content">
      <p>{{ deleteConfirmationMessage }}</p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteConfirmationVisible = false">Cancel</el-button>
        <el-button type="danger" @click="handleDelete">
          <i class="material-icons mr-1" style="font-size: 16px;">delete</i>
          Delete
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
