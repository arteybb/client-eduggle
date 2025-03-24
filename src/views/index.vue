<template>
  <nav>
    <div class="nav-container">
      <div class="nav-logo">
        <h1>
          <span style="color:gray;">.</span>eduggle
        </h1>
      </div>

      <div class="flex items-center">
        <li class="feed-back-btn" style="font-size:15px; font-weight: bold;">
          <RouterLink to="/feedback">
            Feedback
          </RouterLink>
        </li>

        <!-- If not logged in, show login link -->
        <li v-if="!isLoggedIn" class="nav-login">
          <RouterLink to="/login">
            Login
          </RouterLink>
        </li>

        <!-- If logged in, show profile dropdown -->
        <ProfileDropdown v-else :user="user" />
      </div>
    </div>
  </nav>

  <div class="header-wrapper">
    <div class="container">
      <div class="header-inner">
        <div class="header-text">
          <h2 class="text-center text-5xl font-bold">Working towards your dreams is hard. Not reaching
            them is
            harder.</h2>
          <p class="text-center text-xl mt-10 mb-10 ">
            Get work done with others from around the 🌎
          </p>

          <RouterLink v-if="!isLoggedIn" to="/login" class="signIn-link">
            <div class="signIn-btn">
              START LEARNING
            </div>
          </RouterLink>

          <RouterLink v-else to="/home" class="signIn-link">
            <div class="signIn-btn">
              GO TO DASHBOARD
            </div>
          </RouterLink>

        </div>
        <div class="bubble" style="right:0;top:0;">
          <img style="width:900px;"
            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2F49291ba917ced6f25ff01e5cc5b9a691.cdn.bubble.io%2Ff1737580296878x906876272810373600%2Fhero-circle-right-darker.png?w=768&h=1136&auto=compress&dpr=1&fit=max"
            alt="">
        </div>
        <div class="bubble" style="left:0px;bottom:-10px;">
          <img style="width:900px;"
            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2F49291ba917ced6f25ff01e5cc5b9a691.cdn.bubble.io%2Ff1737580340987x337687143188666560%2Fhero-circle-left-darker.png?w=768&h=1081&auto=compress&dpr=1&fit=max"
            alt="">

        </div>
        <div class="header-img">
          <img src="@/assets/image/index.png" alt="">
        </div>
      </div>
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
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { IUser } from '@/types/user';
import ProfileDropdown from '@/components/ProfileDropdown.vue';

defineOptions({
  name: 'LandingPage'
});

const authStore = useAuthStore();
const isLoggedIn = computed(() => !!authStore.user);
const user = computed(() => authStore.user as IUser);

const offset = ref(0);
const offsetMountain = ref(0);

const handleScroll = () => {
  offset.value = window.scrollY * -0.5;
};

const handleScrollMountain = () => {
  offsetMountain.value = window.scrollY * 0.5;
};

onMounted(async () => {
  if (!authStore.user) {
    await authStore.initAuth();
  }

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('scroll', handleScrollMountain);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('scroll', handleScrollMountain);
});
</script>

<style scoped>
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

  .feed-back-btn:hover {
    color: gray;
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
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
}


.header-wrapper {
  position: relative;
  top: 100px;
  overflow: hidden;
  height: 1500px;
}

.header-text {
  line-height: 120%;
  max-width: 580px;
  letter-spacing: 1px;
  margin: 0 auto;
  padding-top: 100px;
}

.header-inner img {
  width: 90%;
  height: 600px;
  margin: 0 auto;
  margin-top: 100px;
  border-radius: 20px;
}

.signIn-btn {
  z-index: 8;
}


.signIn-btn a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  /* เอาขีดเส้นใต้ของลิงก์ออก */
  color: inherit;
  /* ใช้สีตาม .signIn-btn */

}

.signIn-link {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  color: #fff;
  margin: 0 auto;
  width: 200px;
  height: 60px;
  border-radius: 20px;
  font-weight: bold;
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
