<template>
  <MainLayout>

    <FetchingData v-if="isLoading"></FetchingData>

    <div class="content-container mx-auto" v-else>
      <div class="content-header mt-10">
        <div class="grid grid-cols-12">
          <div class="content-header-item col-span-12 lg:col-span-8">
            <h2 class="text-4xl mb-5 font-bold">Course</h2>
            <p style="color:gray;line-height: 20px;">
              Jump back in, or start something new.
            </p>
          </div>
          <div class="col-span-12 lg:col-span-4 flex justify-center">
            <img style=" width:200px;" src="@/assets/image/dd1.jpg" alt="">
          </div>
        </div>
      </div>

      <div class="search-area" style="width:100%;margin:0 auto;position: relative;">
        <div class="search-icon" style="position: absolute;left:25px;top:12px;">
          <i class="material-icons">search</i>
        </div>
        <input type="text" v-model="searchQuery"
          style="border:1px solid #ccc;height:50px;width:100%;border-radius:30px;font-size:14px;padding-left:60px;box-sizing: border-box;"
          placeholder="Search course">
      </div>

      <div class="course-list-area grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-5 gap-8">
        <div class="course-list" v-for="course in filteredCourses" :key="course._id">
          <div class="course-img">
            <img v-if="course.imageName" :src="`${baseUrl}/uploads/images/${course.imageName}`" :alt="course.name"
              style="width:100%;height:150px;object-fit:cover;" />
            <div v-else style="background-color: #ccc;width:100%;height:150px;"></div>
          </div>

          <div class="course-head pl-3 pr-5 pt-3 pb-3">
            <h3 class="font-bold text-md">{{ course.name }}</h3>
            <p class="text-xs pt-3 description-text">
              {{ course.description }}
            </p>
            <div class="course-stats flex mt-2">
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {{ course.lessons.length }} lessons
              </span>
              <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {{ course.quizzes.length }} quizzes
              </span>
            </div>
          </div>
          <hr>
          <div class="course-bottom flex justify-between items-center p-6">
            <div class="bottom-left flex items-center">
              <p class="text-xs">
                {{ course.enrollmentCount }} enroll
              </p>
              <div v-if="enrolledCourseIds.includes(course._id)" class="enrollment-badge ml-2">
                <el-tag type="success" effect="dark" class="enrollment-tag">
                  <i class="material-icons mr-1" style="font-size: 14px; vertical-align: middle;">check_circle</i>
                  Enrolled
                </el-tag>
              </div>
            </div>
            <RouterLink :to="`/courses/view/${course._id}`">
              <div class="bottom-right">
                <el-button size="large" class="flex items-center"
                  style="background-color: #000;color:#fff;border-radius: 20px;font-size:12px;">
                  <span>{{ enrolledCourseIds.includes(course._id) ? 'Continue' : 'View' }}</span>
                  <i class="material-icons ml-1" style="font-size: 16px;">chevron_right</i>
                </el-button>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>


<script setup lang="ts">
import { getAllCourses, getCountPromise } from '@/api/user/course.api';
import MainLayout from '@/layouts/MainLayout.vue';
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { getUserEnrollments } from '@/api/user/course.api';
import { ElButton, ElTag } from 'element-plus';
import type { Course } from '@/types/course';
import FetchingData from '@/components/FetchingData.vue';
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const authStore = useAuthStore();
const isLoading = ref(true);

const courses = ref<Course[]>([]);
const enrolledCourseIds = ref<string[]>([]);
const loading = ref(true); // สถานะการโหลด
const error = ref<string | null>(null);

const searchQuery = ref('');

// การคำนวณรายการ course ที่ตรงกับคำค้นหา
const filteredCourses = computed(() => {
  return courses.value.filter(course =>
    course.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Function to fetch enrollment counts for all courses
const fetchEnrollmentCounts = async (coursesList: Course[]) => {
  try {
    // Create an array of promises for fetching enrollment counts
    const countPromises = coursesList.map(async (course) => {
      try {
        const res = await getCountPromise(course._id)
        course.enrollmentCount = res.count;
      } catch (error) {
        console.error(`Error fetching enrollment count for course ${course._id}:`, error);
        course.enrollmentCount = 0;
      }
      return course;
    });

    // Wait for all promises to resolve
    await Promise.all(countPromises);
  } catch (error) {
    console.error('Error fetching enrollment counts:', error);
  }
};

// Function to fetch user's enrolled courses
const fetchUserEnrollments = async () => {
  try {
    if (authStore.user && authStore.user.uid) {
      const enrolledCourses = await getUserEnrollments(authStore.user.uid);
      enrolledCourseIds.value = enrolledCourses.map(course => course._id);
    }
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;

    // Fetch all courses
    const data = await getAllCourses();
    courses.value = data as unknown as Course[];

    // Fetch enrollment counts for all courses
    await fetchEnrollmentCounts(courses.value);

    // Fetch user's enrolled courses
    await fetchUserEnrollments();

  } catch (errorMsg) {
    error.value = 'Failed to load courses';
    console.error('Error loading courses:', errorMsg);
  } finally {
    isLoading.value = false;
    loading.value = false;
  }
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
}

.course-list {
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 400px;
  /* Fixed height for all cards */
}

.course-img {
  flex-shrink: 0;
}

.course-head {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.course-bottom {
  flex-shrink: 0;
}

.course-stats {
  display: flex;
  margin-top: 8px;
}

.enrollment-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.enrollment-tag {
  display: flex;
  align-items: center;
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

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 4.5em;
  /* Approximately 3 lines of text */
  margin-bottom: auto;
  /* Push the stats to the bottom of the flex container */
}

.enrollment-badge {
  display: flex;
  align-items: center;
}

.enrollment-tag {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  padding: 0 0.5rem;
}
</style>
