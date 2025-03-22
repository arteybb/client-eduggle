<template>
  <MainLayout>
    <div class="content-container mx-auto">
      <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12 lg:col-span-8">
            <h2 class="text-4xl mb-5 font-bold">Welcome,{{ authStore.user.displayName }}</h2>
            <p style="color:gray;line-height: 20px;">
              Manage your courses, lessons, and quizzes.
            </p>
          </div>
          <div class="col-span-12 lg:col-span-4 flex justify-end items-center">
            <el-button type="info" round size="large" @click="refreshCourses" class="refresh-btn mr-2"
              :loading="refreshing">
              <i class="material-icons mr-2">refresh</i>
              Refresh
            </el-button>
            <el-button size="large" type="primary" round @click="navigateToCreateCourse" class="create-course-btn">
              <i class="material-icons mr-2">add_circle</i>
              Create New Course
            </el-button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <FetchingData v-if="loading"></FetchingData>

      <!-- No courses state -->
      <div v-else-if="courses.length === 0" class="py-8">
        <el-empty description="You haven't created any courses yet">
          <template #extra>
            <el-button type="primary" @click="navigateToCreateCourse">Create Your First Course</el-button>
          </template>
        </el-empty>
      </div>

      <!-- Course list -->
      <div v-else class="mt-8">
        <h3 class="text-2xl font-semibold mb-4">Dashboard</h3>

        <el-table :data="courses" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="Course Name" min-width="200">
            <template #default="scope">
              <div class="flex items-center">
                <div class="course-image-small mr-3">
                  <img v-if="scope.row.imageUrl" :src="scope.row.imageUrl" alt="Course Image"
                    class="w-12 h-12 object-cover rounded" />
                  <div v-else class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <i class="material-icons text-gray-400">image</i>
                  </div>
                </div>
                <span class="font-medium">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="enrollmentCount" label="Students" width="120">
            <template #default="scope">
              <div class="flex items-center">
                <i class="material-icons text-amber-500 mr-1">people</i>
                <span>{{ scope.row.enrollmentCount || 0 }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="lessons" label="Lessons" width="120">
            <template #default="scope">
              <div class="flex items-center">
                <i class="material-icons text-blue-500 mr-1">menu_book</i>
                <span>{{ scope.row.lessons?.length || 0 }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="quizzes" label="Quizzes" width="120">
            <template #default="scope">
              <div class="flex items-center">
                <i class="material-icons text-purple-500 mr-1">quiz</i>
                <span>{{ scope.row.quizzes?.length || 0 }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Actions" width="200">
            <template #default="scope">
              <div class="flex space-x-2">
                <el-button circle size="large" @click="navigateToCourse(scope.row._id)">
                  <el-icon>
                    <View />
                  </el-icon>

                </el-button>

                <el-button circle size="large" @click="navigateToEditCourse(scope.row._id)">
                  <el-icon>
                    <Setting />
                  </el-icon>

                </el-button>

                <el-button circle size="large" style="border:1px solid rgb(234 114 141);color:#ff2052;"
                  @click="confirmDeleteCourse(scope.row)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { getTeacherCourses, deleteCourse } from '@/api/user/teacher.api';
import { ElButton, ElEmpty, ElTable, ElTableColumn, ElMessageBox } from 'element-plus';
import type { Course } from '@/types/course';
import FetchingData from '@/components/FetchingData.vue';

// Define component name
defineOptions({
  name: 'TeacherDashboard'
});

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const courses = ref<Course[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const refreshInterval = ref<number | null>(null);

// Function to fetch teacher's courses
const fetchTeacherCourses = async () => {
  try {
    loading.value = true;
    if (!authStore.user || !authStore.user.uid) {
      notificationStore.showWarning('Please log in to view your courses', 'Authentication Required');
      return;
    }

    const teacherCourses = await getTeacherCourses(authStore.user.uid);
    courses.value = teacherCourses;
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    notificationStore.showError('Failed to load your courses', 'Error');
  } finally {
    loading.value = false;
  }
};

// Navigation functions
const navigateToCreateCourse = () => {
  router.push('/courses/create');
};
const navigateToCourse = (courseId: string) => {
  router.push(`../courses/${courseId}/lesson`);
}

const navigateToEditCourse = (courseId: string) => {
  router.push(`/teacher/courses/${courseId}/edit`);
};

// Delete course function
const confirmDeleteCourse = (course: Course) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${course.name}"? This action cannot be undone.`,
    'Delete Course',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        loading.value = true;
        await deleteCourse(course._id);
        notificationStore.showSuccess('Course deleted successfully', 'Success');
        // Refresh the course list
        await fetchTeacherCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        notificationStore.showError('Failed to delete course', 'Error');
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      // User cancelled the deletion
    });
};

const refreshCourses = async () => {
  try {
    refreshing.value = true;
    await fetchTeacherCourses();
  } catch (error) {
    console.error('Error refreshing courses:', error);
    notificationStore.showError('Failed to refresh courses', 'Error');
  } finally {
    refreshing.value = false;
  }
};

// Auto-refresh function
const startAutoRefresh = () => {
  // Refresh every 30 seconds
  refreshInterval.value = window.setInterval(async () => {
    try {
      if (!refreshing.value && !loading.value) {
        refreshing.value = true;
        const teacherCourses = await getTeacherCourses(authStore.user.uid);
        courses.value = teacherCourses;
      }
    } catch (error) {
      console.error('Error auto-refreshing courses:', error);
    } finally {
      refreshing.value = false;
    }
  }, 30000); // 30 seconds
};

// Stop auto-refresh
const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
};

onMounted(async () => {
  // Check if user is a teacher
  if (authStore.user && authStore.user.role !== 'T') {
    notificationStore.showWarning('Only teachers can access this page', 'Access Denied');
    router.push('/home');
    return;
  }

  await fetchTeacherCourses();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.content-container {
  max-width: 1140px;
}

.create-course-btn {
  display: flex;
  align-items: center;
}

:deep(.el-table .cell) {
  padding: 12px;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f8fafc;
}
</style>
