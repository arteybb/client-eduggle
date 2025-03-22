export interface Comment {
  _id: string;
  content: string;
  userId: string;
  displayName: string;
  userPhotoURL?: string;
  createdAt: string;
}

export interface Discussion {
  _id: string;
  title: string;
  content: string;
  courseId: string;
  userId: string;
  displayName: string;
  userPhotoURL?: string;
  createdAt: string;
  comments: Comment[];
}

export interface CreateDiscussionPayload {
  title: string;
  content: string;
  courseId: string;
  userId: string;
  userPhotoURL: string;
}

export interface CreateCommentPayload {
  content: string;
  discussionId: string;
  userId: string;
  userPhotoURL: string;
}
