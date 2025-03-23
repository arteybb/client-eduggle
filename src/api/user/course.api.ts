import axios from './instance/axios';
import type { Course } from '@/types/course';

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const { data } = await axios.get(`course`);
    return data;

  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};


export const getCourseById = async (id: string): Promise<Course> => {
  try {
    const { data: courseData } = await axios.get(`course/${id}`);

    try {
      const { data: enrollmentData } = await axios.get(`enroll/course/${id}/count`);
      courseData.enrollmentCount = enrollmentData.count;
    } catch (countError) {
      console.error("Error fetching enrollment count:", countError);
      courseData.enrollmentCount = 0;
    }

    return courseData;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const getIsPublic = async (courseId: string): Promise<Course> => {
  try {
    const { data } = await axios.patch(`/course/${courseId}/draft`)
    return data
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }

}

export const getCountPromise = async (courseId: any) => {
  try {
    const { data } = await axios.get(`/enroll/course/${courseId}/count`);
    return data
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

export const enrollUser = async (userId: string, courseId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`enroll`, {
      userId,
      courseId
    });

    return response.data;
  } catch (error) {
    console.error('Error enrolling user:', error);
    throw error;
  }
};

export const getUserEnrollments = async (userId: string): Promise<Course[]> => {
  try {
    const { data } = await axios.get(`enroll/user/${userId}/courses`);
    return data;
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    throw error;
  }
};

export const checkIfEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    const enrolledCourses = await getUserEnrollments(userId);
    return enrolledCourses.some((course: Course) => course._id === courseId);
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return false;
  }
};

