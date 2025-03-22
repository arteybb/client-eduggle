import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', () => {
  // แสดงการแจ้งเตือนทั่วไป
  const showNotification = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'info',
    duration: number = 3000
  ) => {
    ElNotification({
      title,
      message,
      type,
      duration,
      customClass: 'app-notification',
    });
  };

  // แสดงการแจ้งเตือนสำเร็จ
  const showSuccess = (message: string, title: string = 'Success') => {
    showNotification(title, message, 'success');
  };

  // แสดงการแจ้งเตือนข้อผิดพลาด
  const showError = (message: string, title: string = 'Error') => {
    showNotification(title, message, 'error');
  };

  // แสดงการแจ้งเตือนข้อมูล
  const showInfo = (message: string, title: string = 'Information') => {
    showNotification(title, message, 'info');
  };

  // แสดงการแจ้งเตือนคำเตือน
  const showWarning = (message: string, title: string = 'Warning') => {
    showNotification(title, message, 'warning');
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
});
