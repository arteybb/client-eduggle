<template>
  <div class="form-auth-wrapper">
    <div class="form-auth">
      <div class="form-auth-head">
        <h1 class="logo mb-5"><span style="color:gray;">.</span>eduggle</h1>
        <h2 class="text-2xl font-bold">Sign up</h2>
        <p>
          Use your email or another service to continue
        </p>
      </div>
      <div class="form-auth-input mt-3">
        <el-form ref="formRegisRef" :rules="rules" :model="formRegis" @submit.prevent="signUp">
          <div class="first-page" v-if="currentPage === 1">
            <div class="input-item">
              <el-form-item prop="email" label="Email" style="display: block;">
                <el-input v-model="formRegis.email" placeholder="Email" />
              </el-form-item>
            </div>
            <div class="input-item">
              <el-form-item prop="password" label="Password" style="display: block;">
                <el-input type="password" v-model="formRegis.password" placeholder="Password" show-password />
              </el-form-item>
            </div>

            <div class="input-item">
              <el-form-item prop="displayName" label="Display Name" style="display: block;">
                <el-input type="textdwad" v-model="formRegis.displayName" placeholder="Display Name" />
              </el-form-item>
            </div>




            <div class="input-item mt-10">
              <div class="regis-btn flex justify-center items-center" @click="signUp">
                Sign up
              </div>
            </div>
          </div>


        </el-form>

        <div class="line mt-10 mb-10">

        </div>

        <RouterLink to="login">
          <div class="already text-center">
            <a class="">Already have an account? Sign in</a>
          </div>
        </RouterLink>






      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import type { RuleFormRegis } from '@/types/forms';

const authStore = useAuthStore();
const currentPage = ref(1);
const formRegisRef = ref<FormInstance>()
const formRegis = reactive<RuleFormRegis>({
  email: '',
  password: '',
  displayName: '',
})

const { showError, showSuccess } = useNotificationStore();
const router = useRouter();






const rules = reactive<FormRules<RuleFormRegis>>({
  email: [
    { required: true, message: 'Please input Email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' },

  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 3, max: 10, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],

  displayName: [
    { required: true, message: 'Please input display Name', trigger: 'blur' },
    { min: 3, max: 15, message: 'Length should be 3 to 15', trigger: 'blur' },
  ],

})






const signUp = async () => {
  try {
    const isValid = await formRegisRef.value?.validate();
    if (!isValid) {
      return
    }

    const req = await authStore.registerWithEmail(formRegis.email, formRegis.password, formRegis.displayName);
    if (req) {
      console.log('req', req);
      showSuccess('Registration successful.', 'Registration successful');
      router.push({ name: 'login' });
      formRegis.email = '';
      formRegis.password = '';
      formRegis.displayName = '';
    } else {
      console.log('something wrong');
      showError('Registration failed. Please try again.', 'Registration failed');
    }

  } catch (error) {
    console.log("error", error);
    if (error.code === 'auth/email-already-in-use' ||
      (error.message && error.message.includes('email-already-in-use'))) {
      showError('Email already exists. Please use a different email address.', 'Email already exists');
    } else {
      showError('Registration failed: ' + error.message, 'Registration failed');
    }
  }
}

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
    background-color: #000;
    color: #fff;
    border-radius: 50px;
    font-size: 14px;
    width: 100%;
    height: 50px;
    font-weight: bold;
    transition: 0.4s;
    cursor: pointer;
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
    border: 1px solid #ccc;
    border-radius: 30px;
    transition: 0.4s;
    font-size: 16px;
    font-weight: bold;
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
  /* border: 2px solid #ccc !important;
    outline: none;
    transition: border-color 0.2s ease-in-out;
    box-shadow: none; */
  height: 40px;
}

/* :deep(.el-input__wrapper.is-focus) {
    border-color: #ff5733 !important;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
    box-shadow: none !important;
    border-color: #ff0000 !important;
} */
</style>
