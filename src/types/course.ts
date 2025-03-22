import type { Lesson } from './lesson';
import type { Quiz } from './quiz';

export interface Course {
  _id: string;
  name: string;
  description?: string;
  imageName?: string;
  imageUrl?: string;
  teacherId: string;
  lessons: string[] | Lesson[];
  quizzes: string[] | Quiz[];
  isPublished?: boolean;
  price?: number;
  rating?: number;
  enrollmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
