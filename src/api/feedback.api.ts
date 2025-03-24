import axios from './user/instance/axios';

export const feedbackSubmit = async (payload: any): Promise<any> => {
  try {
    const { data } = await axios.post('/feedback/submit', payload);
    return data
  } catch (error) {
    return error;
  }
}

