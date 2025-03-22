<template>
  <div class="form-auth-wrapper">
    <div class="form-auth">
      <div class="form-auth-head">
        <h1 class="logo mb-5"><span style="color:gray;">.</span>eduggle</h1>
        <h2 class="text-xl font-bold">Login to continue</h2>
        <p>
          Use your email or another service to continue
        </p>
      </div>
      <div class="form-auth-input mt-5">
        <el-form ref="formLoginRef" :model="formLogin" :rules="rules" @submit.prevent="login">
          <div class="input-item mb-2">
            <el-form-item prop="email" label="Email" style="display: block;">
              <el-input v-model="formLogin.email" placeholder="Email" />
            </el-form-item>
          </div>
          <div class="input-item mb-2">
            <el-form-item prop="password" label="password" style="display: block;">
              <el-input v-model="formLogin.password" placeholder="Password" type="password" show-password />
            </el-form-item>
          </div>
          <div class="input-item mt-10">
            <button class="login-btn" v-loading="isLoading">
              Login
            </button>
          </div>
        </el-form>

        <div class="input-item mt-2">
          <RouterLink to="/register">
            <button class="regis-btn">
              Sign up
            </button>
          </RouterLink>
        </div>

        <div class="line mt-10 mb-10">

        </div>

        <div class="input-item google mt-5">
          <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="">
          <button class="google-btn" @click="SigninWithGoogle()" v-loading="isLoading">
            Continue with Google
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from "@/stores/auth";
import { RouterLink } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus';
import { register, signIn } from '@/api/user/user.api'
import { ElNotification } from "element-plus";
import { useNotificationStore } from '@/stores/notification';
import type { RuleFormLogin } from '@/types/forms';
import router from '@/router';

const authStore = useAuthStore();
const isLoading = ref(false);
const { showError, showSuccess } = useNotificationStore();

const formLoginRef = ref<FormInstance>()
const formLogin = reactive<RuleFormLogin>({
  email: '',
  password: ''
})
const rules = reactive<FormRules<RuleFormLogin>>({
  email: [
    { required: true, message: 'Please input Email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' },

  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
  ],
})

const path = ref('');
const login = async () => {
  isLoading.value = true;
  try {
    const isValid = await formLoginRef.value?.validate();
    if (!isValid) {
      return
    }

    const payload = {
      email: formLogin.email,
      password: formLogin.password
    }
    console.log(payload.email);

    const user = await signIn({ email: payload.email })
    if (user) {
      await authStore.loginWithEmailAndPassword(payload.email, payload.password);
    }



    if (user.role === "T") {
      path.value = 'teacher-dashboard'
    } else {
      path.value = 'home'
    }


  } catch (error: any) {
    const { resDesc } = error.response?.data
    if (resDesc) {
      showError('No user found. Register to continue your adventure!', 'User not found');
    }
  } finally {
    router.push({ name: `${path.value}` });
    isLoading.value = false;
  }
}
const SigninWithGoogle = async () => {
  isLoading.value = true;
  try {

    const req = await authStore.loginWithGoogle();


  } catch (error) {
    console.error("Google Sign-In failed:", error);
  } finally {
    isLoading.value = false;
  }
};



</script>

<style scoped>
h1 {
  color: #000;
  font-size: 30px;
  text-align: center;
  user-select: none;
  font-family: "Quicksand", serif;
  font-weight: bold;

}

.form-auth-wrapper {
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 15px;
}





.form-auth {


  position: relative;
  top: 0px;
  background-color: #fff;
  width: 550px;
  margin: auto;
  padding: 30px;
  border-radius: 10px;
  margin: 0 15px;


  p {
    color: #828282;
    font-size: 14px;
  }

  .login-btn {
    background-color: #000;
    border-radius: 50px;
    width: 100%;
    height: 50px;
    color: #fff;
    font-weight: bold;
    transition: 0.4s;
    font-size: 14px;
  }

  .regis-btn {
    background-color: rgb(222, 217, 217);
    color: #000;
    border-radius: 50px;
    font-size: 14px;
    width: 100%;
    height: 50px;
    font-weight: bold;
    transition: 0.4s;
  }



  .line {
    height: 1px;
    background-color: #ccc;
  }

  .google {
    position: relative;

    img {
      position: absolute;
      left: 10px;
      top: 4px;
      width: 50px;
    }
  }

  .logo {
    font-family: "Quicksand", serif;
  }

  .google-btn {
    width: 100%;
    height: 60px;
    border-radius: 30px;
    transition: 0.4s;
    font-size: 16px;
    font-weight: bold;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  }

  .google-btn:hover {
    background-color: #f4f4f4;
    transition: 0.4s;
  }


}

.el-form-item__error {
  position: relative;
  top: 0%;
}

.user-noti-error {
  border-radius: 0px;
  border: none;
  border-right: 7px solid #000;
  border-bottom: 7px solid #000;
}

:deep(.el-input__wrapper) {

  height: 40px;
}
</style>
