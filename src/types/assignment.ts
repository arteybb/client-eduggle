export interface Attachment {
  filename: string;
  originalname: string;
  fileUrl: string;
}

export interface SubmissionFile {
  filename: string;
  originalname: string;
  fileUrl: string;
}

export interface Submission {
  userId: string;
  displayName: string;
  userPhotoURL?: string;
  files: SubmissionFile[];
  comment?: string;
  grade?: number;
  feedback?: string;
  isGraded?: boolean;
  submittedAt: Date;
  updatedAt: Date;
  gradedAt?: Date;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  attachments: Attachment[];
  dueDate?: Date;
  courseId: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoURL?: string;
  submissions: Submission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  courseId: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoURL?: string;
  dueDate?: Date;
  keepExistingAttachments?: boolean;
}

export interface SubmissionFormData {
  userId: string;
  displayName: string;
  userPhotoURL?: string;
  comment?: string;
  keepExistingFiles?: boolean;
}
