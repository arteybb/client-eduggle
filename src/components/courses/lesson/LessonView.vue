<template>
  <div class="container mx-auto p-4">
    <FetchingData v-if="loading"></FetchingData>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div class="flex justify-between">
      <!-- Lesson Details (อยู่ซ้าย) -->
      <div class="w-full" v-if="selectedLesson">
        <h2 class="text-xl font-semibold">{{ selectedLesson.title }}</h2>
        <p class="text-gray-600">{{ selectedLesson.description }}</p>
        <p v-if="selectedLesson.content" class="mt-2 mb-5">{{ selectedLesson.content }}</p>
        <div class="video-box flex justify-center shadow"
          style="border-radius:20px;padding:30px;width:90%; margin:0 auto">
          <video controls style="width:100%;height:600px;" v-if="selectedLesson.mediaUrl" :src="selectedLesson.mediaUrl"
            alt="Lesson Media" class="mt-2 w-full h-auto rounded" />
        </div>
      </div>
      <div class="w-2/3 p-4 text-gray-500" v-else>
        Select a lesson to view details
      </div>

      <!-- Lesson List (อยู่ขวา) -->
      <ul class="w-1/3 border-l p-4">
        <li v-for="lesson in lessons" :key="lesson._id" @click="selectLesson(lesson)"
          class="cursor-pointer p-2 hover:bg-gray-100 border-b"
          :class="{ 'bg-gray-200': lesson._id === selectedLesson?._id }">
          {{ lesson.title }}
        </li>
      </ul>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import FetchingData from '@/components/FetchingData.vue';
import { getLesson } from '@/api/lesson/lesson.api';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content?: string;
  mediaUrl?: string;
}

const route = useRoute();
const courseId = route.params.courseId as string;
const lessons = ref<Lesson[]>([]);
const selectedLesson = ref<Lesson | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchLessons = async () => {
  try {
    const response = await getLesson(courseId)
    lessons.value = response;

    // ตั้งค่าบทเรียนแรกให้เป็นค่าเริ่มต้น (ถ้ามีข้อมูล)
    if (lessons.value.length > 0) {
      selectedLesson.value = lessons.value[0];
    }
  } catch (error: any) {
    error.value = 'Error fetching lessons';
    console.log('error', error)
  } finally {
    loading.value = false;
  }
};

const selectLesson = (lesson: Lesson) => {
  selectedLesson.value = lesson;
};

onMounted(async () => {
  await fetchLessons()
});
</script>
