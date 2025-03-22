<template>
    <MainLayout>


        <div class="content-container mx-auto">
            <div class="content-header mt-10">
                <div class="grid grid-cols-12">
                    <div class="content-header-item col-span-12 lg:col-span-8">
                        <h2 class="text-4xl mb-5 font-bold">Course</h2>
                        <p style="color:gray;line-height: 20px;">
                            Jump back in, or start something new.
                        </p>
                    </div>
                    <div class="col-span-12 lg:col-span-4 flex justify-center">
                        <img style=" width:200px;"
                            src="https://www.kaggle.com/static/images/kernel/landing-header-light.svg" alt="">
                    </div>
                </div>
            </div>
        </div>

    </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
</script>