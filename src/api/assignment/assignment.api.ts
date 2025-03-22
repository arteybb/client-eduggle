import axios from '../user/instance/axios';
import type { Assignment, Submission } from '@/types/assignment';
import { getUserEnrollments } from '../user/course.api';

// Get all assignments for a course
export const getAssignmentsByCourse = async (courseId: string): Promise<Assignment[]> => {
  try {
    const { data } = await axios.get(`assignment/course/${courseId}`);
    return data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

// Get all assignments for a user from all enrolled courses
export const getUserAssignments = async (userId: string): Promise<Assignment[]> => {
  try {
    // Get all courses the user is enrolled in
    const enrolledCourses = await getUserEnrollments(userId);

    // Fetch assignments for each course
    const assignmentPromises = enrolledCourses.map(course =>
      getAssignmentsByCourse(course._id)
    );

    // Wait for all promises to resolve
    const assignmentsArrays = await Promise.all(assignmentPromises);

    // Flatten the array of arrays into a single array of assignments
    const allAssignments = assignmentsArrays.flat();

    // Sort assignments by due date (if available) or creation date
    return allAssignments.sort((a, b) => {
      // If both have due dates, compare them
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // If only a has a due date, it comes first
      if (a.dueDate) return -1;
      // If only b has a due date, it comes first
      if (b.dueDate) return 1;
      // If neither has a due date, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    throw error;
  }
};

// Get assignment by ID
export const getAssignmentById = async (assignmentId: string): Promise<Assignment> => {
  try {
    const { data } = await axios.get(`assignment/${assignmentId}`);
    return data;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
};

// Create a new assignment
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

// Update an assignment
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

// Delete an assignment
export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  try {
    await axios.delete(`assignment/${assignmentId}`);
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// Submit an assignment (student)
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

// Get a student's submission for an assignment
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

// Grade a submission (teacher)
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
