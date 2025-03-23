<template>
  <MainLayout>

    <div class="content-container mx-auto" style="user-select: none;">
      <h2 class="text-5xl">{{ course?.name }}</h2>
      <p>{{ course?.description }}</p>
      <div class="course-tabs mt-8">
        <el-tabs v-model="state.activeTab" @tab-click="onTabCoursePageChange" class="demo-tabs">
          <el-tab-pane name="lesson">
            <template #label>
              <div class="label-custom">
                <span>Lesson</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="assignments">
            <template #label>
              <div class="label-custom">
                <span>Assignments</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="quizzes">
            <template #label>
              <div class="label-custom">
                <span>Quizzes</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="discussion">
            <template #label>
              <div class="label-custom">
                <span>Discussion</span>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <el-col :span="24" class="booking-content">
        <LessonView v-if="state.activeTab === 'lesson'"></LessonView>
        <AssignmentList v-if="state.activeTab === 'assignments'" :courseId="courseId" />
        <QuizList v-if="state.activeTab === 'quizzes'" :courseId="courseId" />
        <CourseDiscussion v-if="state.activeTab === 'discussion'" :course="course" :discussions="discussions"
          :isEnrolled="isEnrolled" :courseId="courseId" @discussion-created="fetchDiscussions"
          @discussions-updated="updateDiscussions" />


      </el-col>
    </div>









  </MainLayout>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import LessonView from '@/components/courses/lesson/LessonView.vue';
import { enrollUser, getCourseById, checkIfEnrolled } from '@/api/user/course.api';
import { getCourseDiscussions, createDiscussion, getDiscussionById, deleteDiscussion, deleteComment } from '@/api/user/discussion.api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { ElTabs, ElTabPane } from 'element-plus';
import type { Course } from '@/types/course';
import type { Discussion, CreateDiscussionPayload } from '@/types/discussion';
import CourseDiscussion from '@/components/courses/CourseDiscussion.vue';
import AssignmentList from '@/components/courses/AssignmentList.vue';
import QuizList from '@/components/courses/QuizList.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const course = ref<Course | null>(null);
const loading = ref<boolean>(true);
const route = useRoute();
const router = useRouter();
const courseId = route.params.courseId as string;
const isEnrolled = ref(false);
const enrollmentCount = ref(0);
const loadingDiscussions = ref(false);
const discussions = ref<Discussion[]>([]);
const courseDetail = ref(<any>null);
const courseInfo = ref(<any>null);

const updateCourseInfoPosition = () => {
  if (courseDetail.value && courseInfo.value) {
    const rect = courseDetail.value.getBoundingClientRect();
    courseInfo.value.style.right = `${window.innerWidth - rect.right + 20}px`;
  }
};


const state = reactive({
  activeTab: 'lesson'
})

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

// Format date for display


// Fetch discussions for the course
const fetchDiscussions = async () => {
  if (!course.value) return;


  if (!isEnrolled.value && authStore.user._id === course.value.teacherId) return;

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





// Update discussions when the child component emits discussions-updated
const updateDiscussions = (updatedDiscussions: Discussion[]) => {
  discussions.value = updatedDiscussions;
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
