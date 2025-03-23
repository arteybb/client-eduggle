<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <!-- <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12 lg:col-span-8">
            <h2 class="text-4xl mb-5 font-bold">Course Details</h2>
            <p style="color:gray;line-height: 20px;">
              View the details of the selected course.
            </p>
          </div>
        </div>
      </div> -->

      <!-- Loading state -->
      <FetchingData v-if="loading"></FetchingData>

      <!-- Error state -->
      <div v-else-if="!course" class="py-8">
        <el-empty description="Course not found or error loading course details">
          <template #extra>
            <router-link to="/courses">
              <el-button type="primary">Browse Courses</el-button>
            </router-link>
          </template>
        </el-empty>
      </div>



      <!-- Display course details -->
      <div v-else class="course-details p-5 mb-5" ref="courseDetail" :style="{
        backgroundImage: `url('${baseUrl}/uploads/images/${course.imageName}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',

      }"
        style="color:#fff;border-radius: 20px;position: relative;overflow: hidden;min-height:400px;background-size:cover;">
        <div class="course-info p-5" ref="courseInfo" v-if="!isMobile"
          style="position: fixed;background-color: #fff;width:420px;min-height:60vh;border-radius: 20px;box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;z-index: 99;">

          <img style="background-color: #ccc;border-radius:10px;width:100%;height:200px; object-fit: cover;"
            :src="`${baseUrl}/uploads/images/${course.imageName}`" alt="">

          <div class="course-info-detail">


            <div class="grid grid-cols-3 gap-3 mt-5">
              <div class="stat-box bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div class="flex items-center">
                  <i class="material-icons text-blue-500 mr-2">menu_book</i>
                  <div>
                    <p class="text-sm text-blue-700">Lessons</p>
                    <p class="font-bold text-blue-900">{{ course.lessons.length }}</p>
                  </div>
                </div>
              </div>

              <div class="stat-box bg-purple-50 p-3 rounded-lg border border-purple-100">
                <div class="flex items-center">
                  <i class="material-icons text-purple-500 mr-2">quiz</i>
                  <div>
                    <p class="text-sm text-purple-700">Quizzes</p>
                    <p class="font-bold text-purple-900">{{ course.quizzes.length }}</p>
                  </div>
                </div>

              </div>


              <div class="stat-box bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div class="flex items-center">
                  <i class="material-icons text-amber-500 mr-2">people</i>
                  <div>
                    <p class="text-sm text-amber-700">Students</p>
                    <p class="font-bold text-amber-900">{{ enrollmentCount }}</p>
                  </div>
                </div>
              </div>

            </div>





          </div>

          <div class="course-info-detail absolute bottom-5 w-full">

            <el-button v-if="!isEnrolled" size="large" @click="openEnrollmentModal" class="enrollment-button">
              <i class="material-icons mr-2">add_circle</i>
              Enroll in this Course
            </el-button>
            <RouterLink v-else :to="`/courses/${course._id}/lesson`">
              <el-button type="success" size="large" :to="`/courses/${course._id}/learn`" class="enrollment-button">
                <i class="material-icons mr-2">play_circle</i>
                Start Learning
              </el-button>
            </RouterLink>

          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 absolute bottom-10">
          <!-- Course Info -->
          <div class="lg:col-span-2">
            <h3 class="text-2xl font-semibold">{{ course.name }}</h3>
            <p class="mt-4">{{ course.description }}</p>
          </div>


        </div>

        <!-- Tabs for Course Content and Discussions -->

      </div>
    </div>

    <div class="content-container mx-auto">
      <div class="course-info-detail" v-if="isMobile">


        <div class="grid grid-cols-3 gap-3 mt-5">
          <div class="stat-box bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div class="flex items-center">
              <i class="material-icons text-blue-500 mr-2">menu_book</i>
              <div>
                <p class="text-sm text-blue-700">Lessons</p>
                <p class="font-bold text-blue-900">{{ course?.lessons.length }}</p>
              </div>
            </div>
          </div>

          <div class="stat-box bg-purple-50 p-3 rounded-lg border border-purple-100">
            <div class="flex items-center">
              <i class="material-icons text-purple-500 mr-2">quiz</i>
              <div>
                <p class="text-sm text-purple-700">Quizzes</p>
                <p class="font-bold text-purple-900">{{ course?.quizzes.length }}</p>
              </div>
            </div>

          </div>


          <div class="stat-box bg-amber-50 p-3 rounded-lg border border-amber-100">
            <div class="flex items-center">
              <i class="material-icons text-amber-500 mr-2">people</i>
              <div>
                <p class="text-sm text-amber-700">Students</p>
                <p class="font-bold text-amber-900">{{ enrollmentCount }}</p>
              </div>
            </div>
          </div>



        </div>

        <div class="submit-box mt-5 flex justify-center">
          <el-button v-if="!isEnrolled" size="large" @click="openEnrollmentModal" class="enrollment-button">
            <i class="material-icons mr-2">add_circle</i>
            Enroll in this Course
          </el-button>
          <RouterLink v-else :to="`/courses/${course._id}/lesson`"
            style="width:100%;display:flex;justify-content: center;">
            <el-button type="success" size="large" :to="`/courses/${course._id}/learn`" class="enrollment-button">
              <i class="material-icons mr-2">play_circle</i>
              Start Learning
            </el-button>
          </RouterLink>
        </div>



      </div>
      <div class="course-tabs mt-8">
        <el-tabs v-model="state.activeTab" @tab-click="onTabCoursePageChange" class="demo-tabs">
          <el-tab-pane name="content">
            <template #label>
              <div class="label-custom">
                <span>Course Content</span>
              </div>
            </template>
          </el-tab-pane>

        </el-tabs>
      </div>
      <el-col :span="24" class="booking-content">

        <CourseContent v-if="state.activeTab === 'content' && course" :course="course"
          :enrollmentCount="enrollmentCount" />


      </el-col>
    </div>




    <!-- Enrollment Confirmation Modal -->
    <el-dialog v-model="enrollmentModalVisible" title="Confirm Enrollment" :width="isMobile ? '90%' : '1000px'"
      :before-close="handleCloseModal">
      <div class="enrollment-modal-content">

        <p class=" mb-4">Are you sure you want to enroll in <strong>{{ course?.name }}</strong>?</p>
        <p class="text-sm text-gray-600 mb-4">By enrolling, you'll get access to all lessons and quizzes in this course.
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="large" style="color:#ff2052;" round
            @click="enrollmentModalVisible = false">Cancel</el-button>
          <el-button size="large" type="primary" round @click="handleEnroll">
            <i class="material-icons mr-1" style="font-size: 16px;">check</i>
            Confirm Enrollment
          </el-button>
        </span>
      </template>
    </el-dialog>


  </MainLayout>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { enrollUser, getCourseById, checkIfEnrolled } from '@/api/user/course.api';
import { getCourseDiscussions, createDiscussion, getDiscussionById, deleteDiscussion, deleteComment } from '@/api/user/discussion.api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { ElDialog, ElButton, ElEmpty, ElTabs, ElTabPane } from 'element-plus';
import type { Course } from '@/types/course';
import type { Discussion, CreateDiscussionPayload } from '@/types/discussion';
import CourseContent from '@/components/courses/CourseContent.vue';
import FetchingData from '@/components/FetchingData.vue';
import { useWindowSize } from '@/use/useWindowSize';
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const course = ref<any | null>(null);
const loading = ref<boolean>(true);
const route = useRoute();
const router = useRouter();
const courseId = route.params.id as string;
const isEnrolled = ref(false);
const enrollmentCount = ref(0);
const enrollmentModalVisible = ref(false);
const loadingDiscussions = ref(false);
const discussions = ref<Discussion[]>([]);
const selectedDiscussion = ref<Discussion | null>(null);
const newDiscussionModalVisible = ref(false);
const { mobileMode: isMobile } = useWindowSize()
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const courseDetail = ref(<any>null);
const courseInfo = ref(<any>null);

const updateCourseInfoPosition = () => {
  if (courseDetail.value && courseInfo.value) {
    const rect = courseDetail.value.getBoundingClientRect();
    courseInfo.value.style.right = `${window.innerWidth - rect.right + 20}px`;
  }
};


const state = reactive({
  activeTab: 'content'
})
const deleteConfirmationVisible = ref(false);
const deleteConfirmationMessage = ref('');
const itemToDelete = ref<{ type: 'discussion' | 'comment', id: string }>();

const openEnrollmentModal = () => {
  if (!authStore.user || !authStore.user._id) {
    notificationStore.showWarning('Please log in to enroll in courses', 'Authentication Required');
    return;
  }
  enrollmentModalVisible.value = true;
};

const handleCloseModal = () => {
  enrollmentModalVisible.value = false;
};

const handleEnroll = async () => {
  try {
    const result = await enrollUser(authStore.user._id, courseId);
    notificationStore.showSuccess(result.message || 'Successfully enrolled in course', 'Enrollment Successful');
    isEnrolled.value = true;  // เปลี่ยนสถานะเป็น enrolled
    enrollmentCount.value += 1; // Increment enrollment count
    enrollmentModalVisible.value = false;
  } catch (error: unknown) {
    console.error('Error enrolling in course:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'There was an error enrolling in the course';

    notificationStore.showError(errorMessage, 'Enrollment Failed');
    enrollmentModalVisible.value = false;
  }
};

const checkEnrollmentStatus = async () => {
  try {
    if (authStore.user && authStore.user.uid) {
      isEnrolled.value = await checkIfEnrolled(authStore.user._id, courseId);
    }
  } catch (error) {
    console.error('Error checking enrollment status:', error);
  }
};


const onTabCoursePageChange = (tabPane: any) => {
  const { paneName: tabName } = tabPane

  router.push({ query: { tab: tabName } })
}

// Function to fetch course details by id
const fetchCourseDetails = async (id: string) => {
  try {
    const courseData = await getCourseById(id);
    course.value = courseData;


    enrollmentCount.value = courseData.enrollmentCount || 0;

    loading.value = false;  // ปิดสถานะ loading เมื่อได้ข้อมูล
  } catch (error) {
    console.error("Error fetching course details:", error);
    loading.value = false;  // ปิดสถานะ loading เมื่อเกิดข้อผิดพลาด
    notificationStore.showError('Failed to load course details', 'Error');
  }
};




// Fetch discussions for the course
const fetchDiscussions = async () => {
  if (!courseId) return;


  if (!isEnrolled.value) return;

  loadingDiscussions.value = true;
  try {
    const userId = authStore.user?.uid;
    const data = await getCourseDiscussions(courseId, userId);
    discussions.value = data;
  } catch (error) {
    console.error('Error fetching discussions:', error);
    notificationStore.showError('Failed to load discussions', 'Error');
  } finally {
    loadingDiscussions.value = false;
  }
};


// Create a new discussion

// เรียกฟังก์ชันเมื่อ component ถูก mounted
onMounted(async () => {
  await fetchCourseDetails(courseId);  // เรียกข้อมูล course ตาม id
  await checkEnrollmentStatus();  // ตรวจสอบสถานะการลงทะเบียน
  await fetchDiscussions();

  updateCourseInfoPosition();
  window.addEventListener("resize", updateCourseInfoPosition);

  if (route.query.tab) {
    state.activeTab = route.query.tab as string
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateCourseInfoPosition);
});

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
      await deleteDiscussion(itemToDelete.value.id, authStore.user.uid);
      notificationStore.showSuccess('Discussion deleted successfully', 'Success');
      await fetchDiscussions();
      // Close the detail modal if it's open
      if (newDiscussionModalVisible.value) {
        newDiscussionModalVisible.value = false;
      }
    } else if (itemToDelete.value.type === 'comment' && selectedDiscussion.value) {
      await deleteComment(selectedDiscussion.value._id, itemToDelete.value.id, authStore.user.uid);
      notificationStore.showSuccess('Comment deleted successfully', 'Success');

      // Refresh the discussion to show the updated comments
      const refreshedDiscussion = await getDiscussionById(selectedDiscussion.value._id, authStore.user.uid);
      selectedDiscussion.value = refreshedDiscussion;

      // Also update the discussion in the list
      const index = discussions.value.findIndex(d => d._id === selectedDiscussion.value?._id);
      if (index !== -1) {
        discussions.value[index] = refreshedDiscussion;
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
</script>

<style scoped>
.content-container {
  max-width: 1140px;
}

.course-details {
  margin-top: 2rem;
}

.course-image-container {
  height: 300px;
  overflow: hidden;
}

.course-image {
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  height: 100%;
  width: 100%;
}

.enrollment-button {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 90%;
  height: 50px;
  background-color: #000;
  color: #fff;
  border-radius: 50px;
}

.stat-box {
  min-width: 120px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.course-tabs {
  margin-top: 2rem;
}

.course-content {
  padding: 1rem;
}

.lessons-section {
  margin-bottom: 1rem;
}

.quizzes-section {
  margin-bottom: 1rem;
}

.lesson-list {
  margin-bottom: 1rem;
}

.lesson-item {
  cursor: pointer;
}

.quiz-list {
  margin-bottom: 1rem;
}

.quiz-item {
  cursor: pointer;
}

.discussions-section {
  margin-top: 1rem;
}

.discussions-header {
  margin-bottom: 1rem;
}

.new-discussion-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.discussions-list {
  margin-top: 1rem;
}

.discussion-item {
  cursor: pointer;
}

.new-discussion-content {
  padding: 1rem;
}

.delete-confirmation-content {
  padding: 1rem;
}

:deep(.el-tabs__content) {
  overflow: auto;

}

:deep(.el-tabs__active-bar) {
  background-color: #000;
}



:deep(.el-tabs__item.is-active) {
  color: #000;
}

:deep(.el-tabs__item:hover) {
  color: #000;
}
</style>
