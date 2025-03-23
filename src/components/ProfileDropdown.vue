<template>
  <div class="profile-menu-container" ref="profileMenuRef">
    <div class="profile-menu flex gap-2 items-center" @click="toggleProfile">
      <div class="profile-img">
        <template v-if="props.user?.photoURL || props.user?.photoImg">
          <img :src="props.user?.photoURL || `${baseUrl}/uploads/${props.user.photoImg}`" alt="User Profile"
            style="border-radius: 50%; width: 30px; height: 30px;" />
        </template>
        <template v-else>
          <div
            style="border-radius: 50%; width: 30px; height: 30px; background: #ccc; display: flex; align-items: center; justify-content: center; font-weight: 500;">
            {{ props.user?.displayName?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </template>
      </div>
      <div class="profile-txt hide-name">
        {{ props.user?.displayName }}
      </div>
      <div class="profile-caret">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
        </svg>
      </div>
    </div>
    <div class="dropdown-profile" v-if="isOpen">
      <div class="dropdown-profile-inner">
        <div class="dropdown-profile-container">
          <RouterLink to="/profile">
            <div class="dropdown-profile-item flex gap-4">
              <div class="dropdown-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                </svg>
              </div>
              <div class="dropdown-text">
                Profile
              </div>
            </div>
          </RouterLink>

          <div class="dropdown-profile-item flex gap-4" @click="handleLogout">
            <div class="dropdown-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="logout-icon"
                viewBox="0 0 16 16">
                <path
                  d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path
                  d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
            </div>
            <div class="dropdown-text">
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { IUser } from '@/types/user';
import { RouterLink } from 'vue-router';
import defaultProfileImage from '@/assets/image/profileImage.png';

defineOptions({
  name: 'ProfileDropdown'
});

const props = defineProps<{
  user: IUser | null;
}>();
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const authStore = useAuthStore();
const isOpen = ref(false);
const profileMenuRef = ref<HTMLElement | null>(null);

// Handle clicks to close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (profileMenuRef.value && !profileMenuRef.value.contains(target) && isOpen.value) {
    isOpen.value = false;
  }
};

const toggleProfile = () => {
  isOpen.value = !isOpen.value;
};

const handleLogout = async () => {
  await authStore.logout();
  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Profile menu styles */
.profile-menu-container {
  position: relative;
  user-select: none;
}

.profile-menu {
  background-color: #e0e6ec;
  padding: 8px 15px;
  border-radius: 30px;
  filter: drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.25));
  user-select: none;
  cursor: pointer;
  font-weight: bold;
  color: #323232;
}

.profile-img {
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-txt {
  max-width: 120px;
  font-size: 1rem !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-profile {
  position: absolute;
  top: 60px;
  right: 0;
  z-index: 100;
}

.dropdown-profile-inner {
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 220px;
  padding: 20px;
  border-radius: 20px;
}

.dropdown-profile-container {
  padding-left: 16px;
}

.dropdown-profile-item {
  margin-bottom: 10px;
  cursor: pointer;
  padding: 8px 0;
}

.dropdown-icon {
  position: relative;
  top: 3px;
  font-weight: bold;
}

.logout-icon {
  transform: rotate(90deg);
}

.dropdown-text {
  font-weight: 500;
}

@media only screen and (max-width: 500px) {
  .hide-name {
    display: none;
  }




}
</style>
