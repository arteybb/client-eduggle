import axios from './instance/axios';

export const signIn = async (payload: any): Promise<any> => {
    const { data } = await axios.post('auth/login', { email: payload.email })
    return data

}

export const register = async (payload: any): Promise<any> => {
    try {
        const { data } = await axios.post('auth/register', payload)
        return data
    } catch (error) {
        console.log(error)
        throw new Error('register failed');
    }
}

export const getUserById = async (uid: string): Promise<any> => {
    try {
        const { data } = await axios.get(`user/${uid}`);
        return data;
    } catch (error) {
        console.error('Error finding user:', error);
        throw new Error('User not found');
    }
}

export const editUser = async (uid: string, payload: { displayName: string; photoImg?: string | null; }): Promise<any> => {
    try {
        const { data } = await axios.put(`user/edit/${uid}`, payload);
        console.log(data)
        return data;

    } catch (error) {
        console.error('Error finding user:', error);
        throw new Error('User not found');
    }
}


