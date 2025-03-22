<template>
  <div class="main-container">
    <button style="position: fixed;z-index: 9999;left:8px;top:5px;" @click="toggleSidebar"
      class="text-3xl btn-menu btn-m">☰</button>
    <div :class="['sidebar', { 'collapsed': isSidebarCollapsed }]" class="fixed h-full">
      <div class="sidebar-top pl-2 pt-3 ">
        <button @click="toggleSidebar" class="text-3xl btn-menu btn-pc">☰</button>
        <div class="logo-text">
          <h1 class="mt-2 logo"><span style="color:gray;">.</span>eduggle</h1>
        </div>
      </div>

      <div class="sidebar-content">

        <!-- Teacher Dashboard Link (only visible for teachers) -->
        <RouterLink v-if="authStore.user && authStore.user.role === 'T'" to="/teacher/dashboard" active-class="active">
          <div class="sidebar-menu-item flex items-center gap-5">
            <div class="sidebar-icon text-xl ml-5 mr-2 pt-2 pb-2">
              <el-icon>
                <Reading />
              </el-icon>
            </div>
            <div class="sidebar-text">
              Dashboard
            </div>
            <div v-if="$route.path.startsWith('/teacher')" class="sidebar-border-right"></div>
          </div>
        </RouterLink>

        <div v-if="authStore.user">
          <RouterLink to="/courses">
            <div class="sidebar-menu-item flex items-center gap-5">
              <div class="sidebar-icon text-xl ml-5 mr-2 pt-2 pb-2">
                <el-icon>
                  <Compass />
                </el-icon>
              </div>
              <div class="sidebar-text">
                Explore
              </div>
              <div v-if="$route.path === '/courses'" class="sidebar-border-right"></div>
            </div>
          </RouterLink>

          <RouterLink to="/home" active-class="active">
            <div class="sidebar-menu-item flex items-center gap-5">
              <div class="sidebar-icon text-xl ml-5 mr-2 pt-2 pb-2">
                <el-icon>
                  <House />
                </el-icon>
              </div>
              <div class="sidebar-text">
                Home
              </div>
              <div v-if="$route.path === '/home'" class="sidebar-border-right"></div>
            </div>
          </RouterLink>
        </div>

        <RouterLink to="/profile" active-class="active">
          <div class="sidebar-menu-item flex items-center gap-5">
            <div class="sidebar-icon text-xl ml-5 mr-2 pt-2 pb-2">
              <el-icon>
                <User />
              </el-icon>
            </div>
            <div class="sidebar-text">
              Profile
            </div>
            <div v-if="$route.path === '/profile'" class="sidebar-border-right"></div>
          </div>
        </RouterLink>

      </div>
    </div>
    <div class="main-wrapper flex">
      <div class="navbar w-full flex justify-end fixed items-center " style="z-index: 100;">
        <div class="mt-6 mr-4" style="position: relative;">
          <div v-if="!isLoading && unreadCount > 0" class="badge text-xs flex justify-center items-center"
            style="user-select:none;cursor:pointer;position: absolute;z-index: 5;top:-5px;right:0;color:#fff;background-color: #ff2052;width:20px;height:20px;border-radius: 50%;">
            {{ unreadCount }}
          </div>
          <el-icon :class="{ 'shake': unreadCount > 0 }"
            style="font-size:22px;box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;width:50px;height:50px;cursor:pointer;border-radius: 50%;background-color: #fff;"
            @click="onToggleNotification">
            <Bell />
          </el-icon>
        </div>

        <div ref="notificationContainer" class="notifications" v-if="isNotificationVisible">
          <h2 class="text-sm text-center mt-3 mb-3">Notifications</h2>
          <hr>
          <div v-if="notifications.length > 0">

            <div v-for="(notification, index) in notifications" :key="index"
              class="notification text-xs pt-5 pl-2 pr-2 pb-5 flex gap-3" style="border-bottom: 1px solid #e5e7eb;">
              <div style="width:5px;height:5px;border-radius: 50%;background-color:green;position: relative;top:5px;">

              </div>
              <div>
                <RouterLink :to="notification.link">
                  <h3 class="font-bold">{{ notification.title }}</h3>
                  <p>{{ notification.message }}</p>
                  <span>{{ formatDate(notification.createdAt) }}</span>
                </RouterLink>
              </div>

            </div>

          </div>


          <div v-else style="width:100%;height:200px;color:#ccc" class="flex justify-center items-center">
            <div>
              <div class="text-center">
                <el-icon style="font-size:50px;">
                  <Bell />
                </el-icon>
                <div>
                </div>
                No Notification
              </div>
            </div>


          </div>

        </div>
        <ProfileDropdown :user="user" class="mt-4 mr-4" />
      </div>
      <div class="content-wrapper">
        <div class="content-body">
          <slot></slot>
        </div>
      </div>
    </div>
    <!-- <div class="footer-area">
      <div class="footer-inner">
        @2025 Educraft Valley
      </div>
    </div> -->

  </div>
</template>

<script setup lang="ts">

import { useAuthStore } from '@/stores/auth';
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import type { IUser } from '@/types/user';
import ProfileDropdown from '@/components/ProfileDropdown.vue';
import { User, Compass, House, Reading } from '@element-plus/icons-vue';
import { getNotifications, markNotificationAsRead } from '@/api/notification/notification.api';
import { io } from 'socket.io-client';
import { useWindowSize } from '@/use/useWindowSize';
const { mobileMode: isMobile } = useWindowSize()
const authStore = useAuthStore();
interface Notification {
  title: string;
  message: string;
  link: string;
  createdAt: Date;
}

const notifications = ref<Notification[]>([]);

const initWebSocket = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  const socket = io(socketUrl, {
    query: { userId: authStore.user._id },
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('notifications', (newNotifications) => {
    notifications.value = newNotifications;
  });

  socket.on('notification', (notification) => {
    console.log('noti')
    notifications.value.unshift(notification);
    unreadCount.value += 1;
  });



  onBeforeUnmount(() => {
    socket.disconnect();
  });
};

const unreadCount = ref(0);

const fetchNotifications = async () => {
  try {
    const response = await getNotifications(authStore.user._id)
    notifications.value = response
    unreadCount.value = response.filter((n: any) => !n.isRead).length;
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }

};
const isLoading = ref(true)

const user = computed(() => authStore.user as IUser | null);

const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const checkScreenWidth = () => {
  if (window.innerWidth <= 500) {
    isSidebarCollapsed.value = true;
  } else {
    isSidebarCollapsed.value = false;
  }
};
const isNotificationVisible = ref(false)
const onToggleNotification = async () => {
  isNotificationVisible.value = !isNotificationVisible.value;
  if (unreadCount.value === 0) return

  if (isNotificationVisible.value) {
    await markNotificationAsRead(authStore.user._id);
    notifications.value.forEach((notification: any) => {
      notification.isRead = true;
    });
    await fetchNotifications()
  }
};





onMounted(async () => {
  await fetchNotifications()
  initWebSocket()
  checkScreenWidth();

  window.addEventListener('resize', checkScreenWidth);
});



</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  transition: width 0.2s ease;
  z-index: 10;
  background-color: #fff;
  overflow: hidden;
  font-family: "IBM Plex Mono", serif;
  font-weight: 500;
  border-right: 1px solid #f4f4f4;
  background-color: #fff;
  z-index: 999;

  .active {
    background-color: #f4f4f4;
  }


  .sidebar-border-right {
    position: absolute;
    background-color: #000;
    width: 4px;
    height: 40px;
    right: 0;
    border-radius: 15px;
  }



  .logo-text {
    color: #000;
    font-family: "Quicksand", serif;
    user-select: none;
    font-size: 22px;
  }
}

.btn-m {
  display: none;
}

.sidebar-menu-item {
  cursor: pointer;
  display: button;
  height: 50px;
}

.sidebar-text {
  font-size: 15px;
  color: #000;
  font-weight: 400;
}

.sidebar-content {
  width: 100%;
  height: 100vh;
  margin-top: 30px;
  white-space: nowrap;
}

.menu-icon {
  font-size: 25px;
}

.sidebar.collapsed {
  width: 65px;
}

.content-wrapper {
  margin-left: 250px;
  margin-top: 48px;
  padding: 16px;
  width: 100%;
  min-height: 100vh;
  transition: margin 0.2s ease;
}

* {
  font-family: Poppins;
}

.badge {
  user-select: none;
}

.notifications {
  background-color: #fff;
  position: absolute;
  top: 90px;
  right: 120px;
  height: 280px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  box-sizing: border-box;
  border-radius: 15px;
  overflow-x: auto;
  user-select: none;
  width: 250px;
}

.notification:hover {
  background-color: #f4f4f4;
  transition: 0.4s;
}

.footer-area {
  background-color: #fff;
  padding: 10px;
  color: #323232;
  transition: margin-left 0.2s ease;
  margin-left: 220px;
  font-weight: bold;
}

.sidebar-top {
  width: 100%;
  height: 100px;
}

.main-container {
  display: block;
}

.card {
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  padding: 16px;
  background-color: #fff;
  border-radius: 15px;
}

.profile {
  max-width: 650px;
  margin: 0 auto;
  background-color: #f4f4f4;
}

.btn-menu {
  padding: 5px 10px;
  border-radius: 50%;
  transition: 0.4s;
  position: relative;
  top: -5px;
}

.add-course-btn {
  border: 1px solid #f4f4f4;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 16px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  box-sizing: border-box;
  transition: all 0.2s;
}

.add-course-active {
  width: 200px;
  height: 50px;
  border-radius: 30px;
  transition: all 0.2s;
}

.btn-menu:hover {
  background-color: #f4f4f4;
  transition: 0.4s;
}

.sidebar.collapsed~.main-wrapper .content-wrapper {
  margin-left: 60px;
}

.sidebar.collapsed~.footer-area {
  margin-left: 60px;
}

.add-courseIcon-active {
  position: relative;
  right: 20px;
  transition: all 0.2s;
}

.logo {
  position: relative;
  left: 60px;
  bottom: 50px;
}

@media screen and (max-width: 500px) {
  .sidebar.collapsed~.main-wrapper .content-wrapper {
    margin-left: 0px;
  }

  .sidebar {}

  .collapsed {
    transform: translateX(-500px);
    transition: all 0.4s;
  }

  .btn-pc {
    display: none;
  }

  .btn-m {
    display: block;
  }

  .logo {
    bottom: 5px;
  }

  .content-wrapper {
    margin-left: 0px;
  }
}
</style>


<style>
@keyframes shake {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-10deg);
  }

  50% {
    transform: rotate(10deg);
  }

  75% {
    transform: rotate(-10deg);
  }

  100% {
    transform: rotate(10deg);
  }
}

.shake {
  animation: shake 0.7s ease-in-out infinite !important;
}
</style>