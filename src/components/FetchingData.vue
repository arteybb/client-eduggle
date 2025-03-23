<template>
  <div class="flex gap-4 items-center justify-center space-y-2 mx-auto"
    style="background-color: #fff;box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;padding:10px;width:300px;border-radius:15px;height:100px;margin-top:100px;">
    <div class="loader"></div>
    <p class="text-lg font-medium" style="font-family: IBM Plex Mono">Fetching Data{{ dots }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

const dots = ref('');
const interval = ref<ReturnType<typeof setInterval> | null>(null);

onMounted(() => {
  interval.value = setInterval(() => {
    dots.value = dots.value.length < 3 ? dots.value + '.' : '';
  }, 300);
});

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value);
  }
});
</script>

<style scoped>
.loader {
  width: 20px;
  height: 20px;
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: relative;
  top: 3px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
