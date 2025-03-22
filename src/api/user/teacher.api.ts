import axios from './instance/axios';
import type { Course } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import type { Quiz, QuizQuestion } from '@/types/quiz';

// Get courses created by a teacher
export const getTeacherCourses = async (teacherId: string): Promise<Course[]> => {
  try {
    const { data: courses } = await axios.get(`course/teacher/${teacherId}`);

    for (const course of courses) {
      if (course.enrollmentCount === undefined) {
        try {
          const { data: enrollmentData } = await axios.get(`enroll/course/${course._id}/count`);
          course.enrollmentCount = enrollmentData.count;
        } catch (countError) {
          console.error(`Error fetching enrollment count for course ${course._id}:`, countError);
          course.enrollmentCount = 0;
        }
      }
    }

    return courses;
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (id: string): Promise<Course> => {
  try {
    console.log('Fetching course by ID:', id);
    const { data: courseData } = await axios.get(`course/${id}`);
    console.log('Raw course data received:', courseData);

    // Ensure lessons and quizzes are arrays
    if (!courseData.lessons) courseData.lessons = [];
    if (!courseData.quizzes) courseData.quizzes = [];

    // If lessons are string IDs, fetch the full lesson objects
    if (courseData.lessons.length > 0 && typeof courseData.lessons[0] === 'string') {
      console.log('Lessons are IDs, fetching full lesson objects...');
      try {
        const lessonPromises = courseData.lessons.map(async (lessonId: string) => {
          try {
            const { data } = await axios.get(`lesson/${lessonId}`);
            return data;
          } catch (err) {
            console.error(`Error fetching lesson ${lessonId}:`, err);
            return null;
          }
        });

        const fetchedLessons = await Promise.all(lessonPromises);
        courseData.lessons = fetchedLessons.filter(lesson => lesson !== null);
        console.log('Fetched full lesson objects:', courseData.lessons);
      } catch (err) {
        console.error('Error fetching lesson details:', err);
      }
    }

    // If quizzes are string IDs, fetch the full quiz objects
    if (courseData.quizzes.length > 0 && typeof courseData.quizzes[0] === 'string') {
      console.log('Quizzes are IDs, fetching full quiz objects...');
      try {
        const quizPromises = courseData.quizzes.map(async (quizId: string) => {
          try {
            const { data } = await axios.get(`quiz/${quizId}`);
            return data;
          } catch (err) {
            console.error(`Error fetching quiz ${quizId}:`, err);
            return null;
          }
        });

        const fetchedQuizzes = await Promise.all(quizPromises);
        courseData.quizzes = fetchedQuizzes.filter(quiz => quiz !== null);
        console.log('Fetched full quiz objects:', courseData.quizzes);
      } catch (err) {
        console.error('Error fetching quiz details:', err);
      }
    }

    try {
      const { data: enrollmentData } = await axios.get(`enroll/course/${id}/count`);
      courseData.enrollmentCount = enrollmentData.count;
    } catch (countError) {
      console.error("Error fetching enrollment count:", countError);
      courseData.enrollmentCount = 0;
    }

    console.log('Processed course data:', courseData);
    return courseData;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

// Create a new course
export const createCourse = async (formData: FormData): Promise<Course> => {
  try {
    const { data } = await axios.post('course/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update an existing course
export const updateCourse = async (courseId: string, formData: FormData): Promise<Course> => {
  try {
    const { data } = await axios.put(`course/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    await axios.delete(`course/${courseId}`);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Create a new lesson
export const createLesson = async (courseId: string, lessonData: { title: string; description?: string; courseId: string; content?: string }): Promise<Lesson> => {
  try {
    console.log('Creating lesson with data:', lessonData);
    const { data } = await axios.post(`lesson/create`, lessonData);
    console.log('Lesson created:', data);
    return data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

// Update an existing lesson
export const updateLesson = async (courseId: string, lessonId: string, lessonData: { title?: string; description?: string; courseId?: string; content?: string }): Promise<Lesson> => {
  try {
    console.log('Updating lesson:', lessonId, 'with data:', lessonData);
    console.log('Content included in update:', lessonData.content);
    const { data } = await axios.put(`lesson/${lessonId}`, lessonData);
    console.log('Lesson updated:', data);
    console.log('Content in response:', data.content);
    return data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

// Delete a lesson
export const deleteLesson = async (courseId: string, lessonId: string): Promise<void> => {
  try {
    console.log('Deleting lesson:', lessonId, 'from course:', courseId);
    await axios.delete(`lesson/${lessonId}`);
    console.log('Lesson deleted successfully');
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

// Update lesson order
export const updateLessonOrder = async (courseId: string, lessonIds: string[]): Promise<void> => {
  try {
    await axios.put(`course/${courseId}/lessons/order`, { lessonIds });
  } catch (error) {
    console.error('Error updating lesson order:', error);
    throw error;
  }
};

// Create a new quiz
export const createQuiz = async (courseId: string, quizData: { title: string; description?: string; courseId: string; questions: QuizQuestion[] }): Promise<Quiz> => {
  try {
    console.log('Creating quiz with data:', quizData);
    const { data } = await axios.post(`quiz/create`, quizData);
    console.log('Quiz created:', data);
    return data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

// Update an existing quiz
export const updateQuiz = async (courseId: string, quizId: string, quizData: { title?: string; description?: string; courseId?: string; questions?: QuizQuestion[] }): Promise<Quiz> => {
  try {
    console.log('Updating quiz:', quizId, 'with data:', quizData);
    const { data } = await axios.put(`quiz/${quizId}`, quizData);
    console.log('Quiz updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
};

// Delete a quiz
export const deleteQuiz = async (courseId: string, quizId: string): Promise<void> => {
  try {
    console.log('Deleting quiz:', quizId, 'from course:', courseId);
    await axios.delete(`quiz/${quizId}`);
    console.log('Quiz deleted successfully');
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
};
