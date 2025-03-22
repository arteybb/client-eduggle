
import axios from '../user/instance/axios';
export const getNotifications = async (userId: any): Promise<any[]> => {
  try {
    const { data } = await axios.get(`/notification/${userId}`);
    return data;
  } catch (error) {
    console.error('Error fetching Notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  userId: string
): Promise<any> => {
  try {
    const { data } = await axios.patch(
      `/notification/read/${userId}`
    );
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};