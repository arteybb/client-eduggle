import axios from '../user/instance/axios';
import type { Assignment, Submission } from '@/types/assignment';
import { getUserEnrollments } from '../user/course.api';


export const getAssignmentsByCourse = async (courseId: string): Promise<Assignment[]> => {
  try {
    const { data } = await axios.get(`assignment/course/${courseId}`);
    return data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};


export const getUserAssignments = async (userId: string): Promise<Assignment[]> => {
  try {

    const enrolledCourses = await getUserEnrollments(userId);


    const assignmentPromises = enrolledCourses.map(course =>
      getAssignmentsByCourse(course._id)
    );


    const assignmentsArrays = await Promise.all(assignmentPromises);


    const allAssignments = assignmentsArrays.flat();


    return allAssignments.sort((a, b) => {

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (a.dueDate) return -1;

      if (b.dueDate) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    throw error;
  }
};


export const getAssignmentById = async (assignmentId: string): Promise<Assignment> => {
  try {
    const { data } = await axios.get(`assignment/${assignmentId}`);
    return data;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
};


export const createAssignment = async (formData: FormData): Promise<Assignment> => {
  try {
    const { data } = await axios.post('assignment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};


export const updateAssignment = async (assignmentId: string, formData: FormData): Promise<Assignment> => {
  try {
    const { data } = await axios.patch(`assignment/${assignmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};


export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  try {
    await axios.delete(`assignment/${assignmentId}`);
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

export const submitAssignment = async (assignmentId: string, formData: FormData): Promise<Submission> => {
  try {
    const { data } = await axios.post(`assignment/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};


export const getStudentSubmission = async (assignmentId: string, userId: string): Promise<Submission | null> => {
  try {
    const { data } = await axios.get(`assignment/${assignmentId}/submissions/${userId}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching submission:', error);
    throw error;
  }
};

export const gradeSubmission = async (
  assignmentId: string,
  userId: string,
  gradeData: { grade: number; feedback: string }
): Promise<Submission> => {
  try {
    const { data } = await axios.post(`assignment/${assignmentId}/grade`, {
      userId,
      grade: gradeData.grade,
      feedback: gradeData.feedback
    });
    return data;
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};
