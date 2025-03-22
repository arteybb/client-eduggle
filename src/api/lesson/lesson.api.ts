import axios from '../user/instance/axios';



export const getLesson = async (courseId: any): Promise<any> => {
  try {
    const { data } = await axios.get(`/lesson/course/${courseId}`);
    return data
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
}