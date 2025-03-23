// src/stores/user.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserById } from '@/api/user/user.api';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(<any>null);


  const fetchUserData = async (id: string) => {
    loading.value = true;
    try {
      const response = await getUserById(id);
      user.value = response.data;
      error.value = null;
    } catch (error: any) {
      error.value = 'Failed to fetch user data';
    } finally {
      loading.value = false;
    }
  };


  return {
    user,
    loading,
    error,
    fetchUserData
  };
});
