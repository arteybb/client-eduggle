import axios from 'axios';
import type { Quiz, QuizAttempt, QuizSubmission } from '@/types/quiz';

/**
 * Get all quizzes for a specific course
 * @param courseId - The ID of the course
 * @returns Promise with array of quizzes
 */
export const getQuizzesByCourse = async (courseId: string): Promise<Quiz[]> => {
  try {
    const response = await axios.get(`quiz/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

export const getQuizAttemptStatus = async (courseId: string, quizId: string) => {
  try {
    const response = await axios.get(`quiz/${courseId}/${quizId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

export const getIsPublicQuiz = async (quizId: any): Promise<Quiz> => {
  try {
    const { data } = await axios.patch(`/quiz/${quizId}/draft`)
    return data
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }

}


/**
 * Get a specific quiz by ID
 * @param quizId - The ID of the quiz
 * @returns Promise with quiz data
 */
export const getQuizById = async (quizId: string): Promise<Quiz> => {
  try {
    const response = await axios.get(`quiz/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};

/**
 * Submit a quiz attempt
 * @param attemptData - The quiz attempt data
 * @returns Promise with the submission result
 */
export const submitQuizAttempt = async (attemptData: QuizSubmission): Promise<QuizAttempt> => {
  try {
    const response = await axios.post(`quiz/attempt`, attemptData);
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw error;
  }
};

/**
 * Get quiz attempts for a user
 * @param userId - The ID of the user
 * @returns Promise with array of quiz attempts
 */
export const getUserQuizAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  try {
    const response = await axios.get(`quiz/attempts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user quiz attempts:', error);
    throw error;
  }
};

/**
 * Get quiz attempts for a specific quiz
 * @param quizId - The ID of the quiz
 * @returns Promise with array of quiz attempts
 */
export const getQuizAttempts = async (quizId: string): Promise<QuizAttempt[]> => {
  try {
    const response = await axios.get(`quiz/${quizId}/attempts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    throw error;
  }
};
