<template>
  <MainLayout>
    <FetchingData v-if="isLoading"></FetchingData>
    <div class="content-container mx-auto" v-else>
      <div class="content-header mt-10">
        <h2 class="text-4xl mb-5 font-bold">Welcome, {{ authStore.user.displayName }}</h2>
        <p style="color:gray;line-height: 20px;">
          Jump back in, or start something new.
        </p>
      </div>

      <hr>



      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 p-4">
        <div class="course-area">
          <div class="flex items-center mb-4">
            <h2 class="font-bold">My Courses</h2>
            <el-badge :value="enrolledCourses.length" class="ml-2" type="primary" v-if="enrolledCourses.length > 0" />
          </div>

          <div v-if="enrolledCourses.length === 0" class="mt-4 empty-state p-6 bg-gray-50 rounded-lg text-center">
            <el-empty description="No enrolled courses yet">
              <template #extra>
                <router-link to="/courses">
                  <el-button type="primary">Browse Courses</el-button>
                </router-link>
              </template>
            </el-empty>
          </div>

          <div v-else class="enrolled-courses-container">
            <div :class="{ flex: !isMobile }"
              class="course-list justify-between items-center mt-3 p-4 bg-white rounded-lg border-l-4 border-black shadow-md transition-all"
              v-for="(course) in enrolledCourses" :key="course._id">
              <div class="course-item">
                <div class="course-icon bg-gray-200 flex items-center justify-center"
                  style="width:50px;height:50px;border-radius: 50%;">
                  <i class="material-icons text-black">school</i>
                </div>
              </div>
              <div class="course-item flex-grow mx-4 mt-3">
                <h3 class="text-sm font-bold">{{ course.name }}</h3>
                <p class="text-xs text-gray-600">
                  {{ course.description || 'No description available' }}
                </p>
                <div class="course-stats flex mt-3">
                  <span class="text-xs bg-gray-200 text-green-600 px-2 py-1 rounded mr-2">
                    {{ course.lessons?.length || 0 }} lessons
                  </span>
                  <span class="text-xs bg-gray-200 text-blue-600 px-2 py-1 rounded">
                    {{ course.quizzes?.length || 0 }} quizzes
                  </span>
                </div>
              </div>
              <div class="course-item mt-3">
                <router-link :to="`/courses/view/${course._id}`" class="resume-btn">
                  <el-button size="large" class="flex items-center" round
                    style="background-color: #000;color:#fff;font-size:12px;">
                    <span>Resume</span>
                    <i class="material-icons ml-1" style="font-size: 16px;">arrow_forward</i>
                  </el-button>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="assign-area">
          <h2 class="font-bold mb-4">More things to do</h2>

          <div v-if="assignments.length === 0" class="mt-4 empty-state p-6 bg-gray-50 rounded-lg text-center">
            <el-empty description="No assignments yet">
              <template #extra>
                <p class="text-sm text-gray-500">Assignments from your courses will appear here</p>
              </template>
            </el-empty>
          </div>

          <div v-else>
            <div v-for="assignment in assignments" :key="assignment._id" :class="{ flex: !isMobile }"
              class="course-list justify-between items-center mt-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              @click="goToAssignment(assignment)">
              <div class="course-item mt-3">
                <div class="course-icon bg-gray-200 flex items-center justify-center"
                  style="width:50px;height:50px;border-radius: 50%;">
                  <i class="material-icons text-gray-500">assignment</i>
                </div>
              </div>

              <div class="course-item flex-grow mx-4 mt-3">
                <h3 class="text-sm font-bold">{{ assignment.title }}</h3>
                <p class="text-xs text-gray-600">
                  {{ truncateText(assignment.description || 'No description', 100) }}
                </p>
                <div class="flex items-center mt-1">
                  <span class="text-xs text-gray-500 mr-2">
                    Course: {{enrolledCourses.find((c: Course) => c._id === assignment.courseId)?.name || 'Unknown'}}
                  </span>
                  <span v-if="assignment.dueDate" class="text-xs text-amber-600">
                    Due: {{ formatDate(assignment.dueDate) }}
                  </span>
                </div>
              </div>

              <div class="course-item mt-3">
                <el-button round type="info" size="large" plain>
                  <span v-if="hasSubmitted(assignment)">View</span>
                  <span v-else>Start</span>
                </el-button>
                <div class="mt-1 flex justify-end">
                  <el-tag v-if="hasSubmitted(assignment)" type="success" size="small" class="mt-1">
                    Submitted
                  </el-tag>
                  <el-tag v-else-if="isOverdue(assignment)" type="danger" size="small" class="mt-1">
                    Overdue
                  </el-tag>
                  <el-tag v-else type="warning" size="small" class="mt-1">
                    Pending
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- Load more button -->
            <div v-if="hasMoreAssignments" class="text-center mt-4">
              <el-button type="primary" plain @click="loadMoreAssignments">
                Load More
              </el-button>
            </div>

            <!-- Show total count -->
            <div class="text-center mt-2 text-xs text-gray-500">
              Showing {{ assignments.length }} of {{ allAssignments.length }} assignments
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>


<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getUserEnrollments } from '@/api/user/course.api';
import { useNotificationStore } from '@/stores/notification';
import { ElButton, ElBadge, ElEmpty } from 'element-plus';
import FetchingData from '@/components/FetchingData.vue';
import { getUserAssignments } from '@/api/assignment/assignment.api';
import type { Assignment } from '@/types/assignment';
import { useRouter } from 'vue-router';
import { useWindowSize } from '@/use/useWindowSize';
import { io } from 'socket.io-client';
import { getNotifications } from '@/api/notification/notification.api';

interface Course {
  _id: string;
  name: string;
  description?: string;
  lessons?: unknown[];
  quizzes?: unknown[];
}
const { mobileMode: isMobile } = useWindowSize()
const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const isLoading = ref(true);
const enrolledCourses = ref<Course[]>([]);
const assignments = ref<Assignment[]>([]);
const allAssignments = ref<Assignment[]>([]);
const itemsPerPage = ref(5);
const hasMoreAssignments = ref(false);
interface Notification {
  message: string;
  link: string;
}

const notifications = ref<Notification[]>([]);


const fetchNotifications = async () => {
  const response = await getNotifications(authStore.user._id)
  notifications.value = response

};


const loadEnrolledCourses = async () => {
  try {
    if (authStore.user && authStore.user._id) {
      isLoading.value = true;
      const courses = await getUserEnrollments(authStore.user._id);
      enrolledCourses.value = courses;
    }
  } catch (error) {
    console.error('Error loading enrolled courses:', error);
    notificationStore.showError('Failed to load your enrolled courses', 'Error');
  } finally {
    isLoading.value = false;
  }
};

const loadUserAssignments = async () => {
  isLoading.value = true;
  try {
    if (authStore.user && authStore.user._id) {
      const userAssignments = await getUserAssignments(authStore.user._id);

      const pendingAssignments = userAssignments.filter(assignment => {
        return !assignment.submissions?.some(sub => sub.userId === authStore.user?._id);
      }).sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });

      allAssignments.value = pendingAssignments;

      assignments.value = pendingAssignments.slice(0, itemsPerPage.value);

      hasMoreAssignments.value = pendingAssignments.length > itemsPerPage.value;
    }
  } catch (error) {
    console.error('Error loading user assignments:', error);
    notificationStore.showError('Failed to load your assignments', 'Error');
  } finally {
    isLoading.value = false;
  }
};

const loadMoreAssignments = () => {
  const currentCount = assignments.value.length;
  const newItems = allAssignments.value.slice(currentCount, currentCount + itemsPerPage.value);

  assignments.value = [...assignments.value, ...newItems];

  hasMoreAssignments.value = assignments.value.length < allAssignments.value.length;
};

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const goToAssignment = (assignment: Assignment) => {
  router.push(`/courses/${assignment.courseId}/lesson?tab=assignments&assignmentId=${assignment._id}`);
};

const isOverdue = (assignment: Assignment) => {
  if (!assignment.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  return now > dueDate;
};

const hasSubmitted = (assignment: Assignment) => {
  if (!authStore.user) return false;
  return assignment.submissions?.some(sub => sub.userId === authStore.user?._id);
};

onMounted(async () => {
  await fetchNotifications()
  await loadEnrolledCourses();
  await loadUserAssignments();
});
</script>

<style scoped>
.loading-main {
  font-family: 'IBM Plex Mono', serif;
  background-color: #fff;
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin-top: 50px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-container {
  max-width: 1140px;
  padding: 0 15px;
}

.enrolled-courses-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resume-btn {
  text-decoration: none;
}

.course-stats {
  margin-top: 8px;
}

.empty-state {
  border: 1px dashed #ccc;
}

.card {
  background-color: #fff;
  padding: 10px;
}

.view-all-btn {
  background-color: #f4f4f4;
  padding: 10px 25px;
  border-radius: 20px;
  font-weight: bold;
  color: #323232;
}

.card-btn {
  background-color: rgb(129, 223, 129);
  width: 40px;
  height: 40px;
  color: #fff;
  border-bottom: 7px solid #000;
  transition: 0.4s;
}

.card-btn:hover {
  transform: translateY(-5px);
  transition: 0.4s;
}

.icon {
  position: relative;
  top: 3px;
}

.card-bottom {
  margin-top: 60px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #f4f4f4;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.content-header {
  line-height: 10px;
  margin-bottom: 50px;
}

.progress {
  width: 20%;
  height: 100%;
  background-color: gold;
  border-radius: 20px;
}
</style>


<style>
.el-badge__content--primary {
  background-color: #000;
}
</style>