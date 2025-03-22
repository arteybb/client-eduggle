import axios from './instance/axios';
import type { Discussion, CreateDiscussionPayload, CreateCommentPayload, Comment } from '@/types/discussion';


export const getCourseDiscussions = async (courseId: string, userId?: string): Promise<Discussion[]> => {
  try {
    const config = userId ? { data: { userId } } : {};
    const { data } = await axios.get(`discussion/course/${courseId}`, config);
    return data;
  } catch (error) {
    console.error('Error fetching course discussions:', error);
    throw error;
  }
};

export const getDiscussionById = async (discussionId: string, userId?: string): Promise<Discussion> => {
  try {
    const config = userId ? { data: { userId } } : {};
    const { data } = await axios.get(`discussion/${discussionId}`, config);
    return data;
  } catch (error) {
    console.error('Error fetching discussion:', error);
    throw error;
  }
};

export const createDiscussion = async (payload: CreateDiscussionPayload): Promise<Discussion> => {
  try {
    const { data } = await axios.post('discussion', payload);
    return data;
  } catch (error) {
    console.error('Error creating discussion:', error);
    throw error;
  }
};


export const addComment = async (payload: CreateCommentPayload): Promise<Comment> => {
  try {
    const { data } = await axios.post(`discussion/${payload.discussionId}/comment`, payload);
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};


export const deleteDiscussion = async (discussionId: string, userId: string): Promise<{ success: boolean }> => {
  try {
    const { data } = await axios.delete(`discussion/${discussionId}`, {
      data: { userId }
    });
    return data;
  } catch (error) {
    console.error('Error deleting discussion:', error);
    throw error;
  }
};


export const deleteComment = async (discussionId: string, commentId: string, userId: string): Promise<{ success: boolean }> => {
  try {
    const { data } = await axios.delete(`discussion/${discussionId}/comment/${commentId}`, {
      data: { userId }
    });
    return data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
