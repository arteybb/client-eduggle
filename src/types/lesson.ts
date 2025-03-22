export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  mediaPath?: string;
  mediaUrl?: string;
  courseId: string;
  order?: number;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}
