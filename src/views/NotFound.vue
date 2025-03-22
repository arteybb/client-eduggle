<template>
  <MainLayout>
    <div class="container">
      <div class="flex flex-col items-center justify-center text-center">
        <img
          src="https://img.freepik.com/premium-vector/oops-404-error-landing-page-concept-illustration_693194-164.jpg"
          alt="" style="width:700px">

        <RouterLink to="/home" class=" px-4 py-2 text-white rounded" style="background-color: #000;position: relative;width:300px;
          height:50px;display: flex;align-items: center;justify-content: center;border-radius:50px;bottom:30px;">
          Go to Dashboard
        </RouterLink>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
</script>

<style>
.content-container {
  max-width: 1140px;
}
</style>
