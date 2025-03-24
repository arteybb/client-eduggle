<template>
  <nav>
    <div class="nav-container">
      <div class="nav-logo">
        <h1>
          <RouterLink to="/">
            <span style="color:gray;">.</span>eduggle
          </RouterLink>
        </h1>
      </div>

      <div v-if="!isLoggedIn" class="flex items-center">
        <li class=" feed-back-btn " style="font-size:15px;font-weight: bold;">
          <RouterLink to="/feedback">
            Feedback
          </RouterLink>
        </li>
        <li class="nav-login">
          <RouterLink to="/login">
            Login
          </RouterLink>
        </li>
      </div>
      <ProfileDropdown v-else :user="user" />
    </div>
  </nav>
  <br>
  <div class="container">
    <div class="feedback-form" style="margin-top:100px">
      <h2 class="mb-5 text-2xl">Feedback</h2>
      <el-form :model="form" :rules="rules" ref="feedbackForm" @submit.prevent="submitFeedback">
        <el-form-item label="ชื่อ" label-width="auto" label-position="top" prop="name">
          <el-input v-model="form.name" placeholder="กรุณากรอกชื่อของคุณ" />
        </el-form-item>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-10">
          <!-- คำถาม 1 -->
          <div class="col-span-1 md:col-span-1    ">
            การลงทะเบียนและเข้าสู่ระบบ
          </div>
          <div class="col-span-1 md:col-span-2">
            <el-form-item prop="registrationLogin">
              <el-radio-group v-model="form.registrationLogin" class="w-full flex space-x-4">
                <el-radio label="5" class="flex-1 text-center p-2">5 - ดีมาก</el-radio>
                <el-radio label="4" class="flex-1 text-center p-2">4 - ดี</el-radio>
                <el-radio label="3" class="flex-1 text-center p-2">3 - ปานกลาง</el-radio>
                <el-radio label="2" class="flex-1 text-center p-2">2 - น้อย</el-radio>
                <el-radio label="1" class="flex-1 text-center p-2">1 - น้อยมาก</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- คำถาม 2 -->
          <div class="col-span-1 md:col-span-1    ">
            การเข้าเรียนและการจัดการหลักสูตร
          </div>
          <div class="col-span-1 md:col-span-2">
            <el-form-item prop="courseManagement">
              <el-radio-group v-model="form.courseManagement" class="w-full flex space-x-4">
                <el-radio label="5" class="flex-1 text-center p-2">5 - ดีมาก</el-radio>
                <el-radio label="4" class="flex-1 text-center p-2">4 - ดี</el-radio>
                <el-radio label="3" class="flex-1 text-center p-2">3 - ปานกลาง</el-radio>
                <el-radio label="2" class="flex-1 text-center p-2">2 - น้อย</el-radio>
                <el-radio label="1" class="flex-1 text-center p-2">1 - น้อยมาก</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- คำถาม 3 -->
          <div class="col-span-1 md:col-span-1    ">
            ความเข้ากันได้กับอุปกรณ์ต่าง ๆ
          </div>
          <div class="col-span-1 md:col-span-2">
            <el-form-item prop="deviceCompatibility">
              <el-radio-group v-model="form.deviceCompatibility" class="w-full flex space-x-4">
                <el-radio label="5" class="flex-1 text-center p-2">5 - ดีมาก</el-radio>
                <el-radio label="4" class="flex-1 text-center p-2">4 - ดี</el-radio>
                <el-radio label="3" class="flex-1 text-center p-2">3 - ปานกลาง</el-radio>
                <el-radio label="2" class="flex-1 text-center p-2">2 - น้อย</el-radio>
                <el-radio label="1" class="flex-1 text-center p-2">1 - น้อยมาก</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- คำถาม 4 -->
          <div class="col-span-1 md:col-span-1    ">
            การติดตามผลการเรียน
          </div>
          <div class="col-span-1 md:col-span-2">
            <el-form-item prop="performanceTracking">
              <el-radio-group v-model="form.performanceTracking" class="w-full flex space-x-4">
                <el-radio label="5" class="flex-1 text-center p-2">5 - ดีมาก</el-radio>
                <el-radio label="4" class="flex-1 text-center p-2">4 - ดี</el-radio>
                <el-radio label="3" class="flex-1 text-center p-2">3 - ปานกลาง</el-radio>
                <el-radio label="2" class="flex-1 text-center p-2">2 - น้อย</el-radio>
                <el-radio label="1" class="flex-1 text-center p-2">1 - น้อยมาก</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>

        <div class="flex justify-end mt-5">
          <el-form-item>
            <el-button :loading="isLoading" type="primary" round size="large" @click="submitFeedback">
              ส่งข้อเสนอแนะ
            </el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>

  <div class="footer-wrapper">
    <div class="container">
      <div class="footer-inner">
        <!-- <div class="footer-logo text-3xl text-white">
                    .learning
                </div>
                <div class="footer-list">
                    <div class="footer-grid">
                        <div class="footer-item">
                            Home
                        </div>
                        <div class="footer-item">
                            Abot
                        </div>
                        <div class="footer-item">
                            Our Service
                        </div>
                        <div class="footer-item">
                            Home to use
                        </div>
                        <div class="footer-item">
                            Contact us
                        </div>
                    </div>
                </div> -->
        <div class="footer-bottom">
          2025 @ Phuwakorn
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElForm, type FormInstance } from 'element-plus';
import type { IUser } from '@/types/user';
import ProfileDropdown from '@/components/ProfileDropdown.vue';
import { feedbackSubmit } from '@/api/feedback.api';
import { useNotificationStore } from '@/stores/notification';
const notificationStore = useNotificationStore()
const authStore = useAuthStore();
const isLoggedIn = computed(() => !!authStore.user);
const user = computed(() => authStore.user as IUser);

interface FeedbackForm {
  name: string;
  registrationLogin: number | null;
  courseManagement: number | null;
  deviceCompatibility: number | null;
  courseManagementFeedback: number | null;
  performanceTracking: number | null;
  performanceNotification: number | null;
}
const feedbackform = ref<FormInstance>()
const form = ref<FeedbackForm>({
  name: '',
  registrationLogin: null,
  courseManagement: null,
  deviceCompatibility: null,
  courseManagementFeedback: null,
  performanceTracking: null,
  performanceNotification: null,
});

const feedbackItems = ref([
  { label: "การลงทะเบียนและเข้าสู่ระบบ", key: "registrationLogin" },
  { label: "การเข้าเรียนและการจัดการหลักสูตร", key: "courseManagement" },
  { label: "ความเข้ากันได้กับอุปกรณ์ต่าง ๆ", key: "deviceCompatibility" },
  { label: "การจัดการคอร์ส", key: "courseManagementFeedback" },
  { label: "การติดตามผลการเรียน", key: "performanceTracking" },
  { label: "การแจ้งเตือน", key: "performanceNotification" },
]);

const isLoading = ref(false)

const rules = {
  name: [
    { required: true, message: 'กรุณากรอกชื่อของคุณ', trigger: 'blur' },
  ],
  registrationLogin: [
    { required: true, message: 'กรุณาประเมินการลงทะเบียนและเข้าสู่ระบบ', trigger: 'blur' },
  ],
  courseManagement: [
    { required: true, message: 'กรุณาประเมินการเข้าเรียนและการจัดการหลักสูตร', trigger: 'blur' },
  ],
  deviceCompatibility: [
    { required: true, message: 'กรุณาประเมินความเข้ากันได้กับอุปกรณ์ต่าง ๆ', trigger: 'blur' },
  ],
  courseManagementFeedback: [
    { required: true, message: 'กรุณาประเมินการจัดการคอร์ส', trigger: 'blur' },
  ],
  performanceTracking: [
    { required: true, message: 'กรุณาประเมินการติดตามผลการเรียน', trigger: 'blur' },
  ],
};
const feedbackForm = ref<FormInstance>()

const submitFeedback = async () => {
  const isValid = await feedbackForm.value?.validate();
  if (!isValid) {
    return
  }

  try {
    isLoading.value = true

    const payload = {
      name: form.value.name,
      registrationLogin: form.value.registrationLogin,
      courseManagement: form.value.courseManagement,
      deviceCompatibility: form.value.deviceCompatibility,
      performanceTracking: form.value.performanceTracking,
    };
    const response = await feedbackSubmit(payload);

    if (response) {
      console.log("ok")
    } else {
      console.log('error')
    }


  } catch (error) {
    console.log(error)
  } finally {
    form.value = {
      name: '',
      registrationLogin: null,
      courseManagement: null,
      deviceCompatibility: null,
      courseManagementFeedback: null,
      performanceTracking: null,
      performanceNotification: null,
    };
    feedbackForm.value?.clearValidate();
    isLoading.value = false
    notificationStore.showSuccess('Thank you for the valuable feedback. I will use it to make improvements', 'Success');
  }
};
</script>


<style scoped>
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
}

nav {
  position: fixed;
  width: 100%;
  height: 80px;
  font-size: 14px;
  background-color: #fff;
  z-index: 999;
  box-sizing: border-box;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  .nav-logo {
    margin-left: 10px;
    font-family: "Quicksand", serif;
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 15px;
  }

  .nav-logo h1 {
    color: #000;
    font-weight: bold;
    font-size: 30px;
    text-align: center;
    user-select: none;
    line-height: 90px;
  }
}

li {
  list-style: none;
  display: inline-block;
  font-weight: bold;
  margin: 5px;
  box-sizing: border-box;
}

li a {
  border-radius: 8px;
  box-sizing: border-box;
  font-weight: 400;
  transition: 0.2s;
  padding: 0 30px;

}

.nav-login {
  background-color: #000;
  color: #fff;
  border-radius: 15px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;

}

.nav-login li a {
  font-weight: bold;
}


.feedback-form {
  font-family: kanit;
  margin: auto;
  padding: 1.5rem;
  border-radius: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.footer-wrapper {
  margin-top: 200px;
}

.footer-inner {
  background-color: #232323;
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  position: relative;
  overflow: hidden;
}

* {
  box-sizing: border-box;

}

.footer-logo {
  text-align: center;
  position: relative;
  top: 30px;
  font-weight: bold;
}

.footer-list {
  color: #fff;
  font-weight: 200;
  margin-top: 100px;
  margin-bottom: 100px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  text-align: center;
}

.footer-bottom {
  background-color: #323232;
  color: #fff;
  text-align: center;
  padding: 20px;
}

.bubble {
  place-self: start end;
  min-width: 560px;
  max-width: 560px;
  width: 560px;
  height: max-content;
  margin: 140px 0px 0px;
  border-radius: 0px;
  opacity: 1;
  position: absolute;
}

.bubble img {
  z-index: 4;
}

.header-img img {
  z-index: 5;
  position: relative;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

@media only screen and (max-width: 600px) {
  .nav-menu {
    display: none;
  }




}
</style>
