export interface QuizQuestion {
  _id?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAttempt {
  _id: string;
  quizId: string;
  userId: string;
  answers: number[];
  timeSpent: number;
  score: number;
  passed: boolean;
  createdAt?: string;
}

export interface QuizSubmission {
  quizId: string;
  userId: string;
  answers: number[];
  timeSpent: number;
  score: number;
}
