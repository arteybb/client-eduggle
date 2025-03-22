<template>
  <div v-if="course">

    <!-- Lessons Section -->
    <div class="lessons-section mb-6 mt-5">
      <h5 class="text-lg font-medium mb-3">Lessons</h5>
      <el-empty v-if="course.lessons.length === 0" description="No lessons available yet" />
      <div v-else class="lesson-list">
        <div v-for="(lesson, index) in course.lessons" :key="lesson._id"
          class="lesson-item p-4 border rounded-lg mb-3 hover:bg-gray-50">
          <div class="flex items-center">
            <div
              class="lesson-number bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
              {{ index + 1 }}
            </div>
            <div class="lesson-info">
              <h6 class="font-medium">{{ lesson.title }}</h6>
              <p>{{ lesson.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
defineProps({
  course: Object,
  enrollmentCount: Number
});
</script>
