import axios from 'axios';

export const signup = async (name, email, password) => {
    try {
        const response = await axios.post(`/api/user/signup?name=${name}&email=${email}&password=${password}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error during signup:", error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`/api/user/login?email=${email}&password=${password}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error during login:", error.response.data.error);
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await axios.post(`/api/user/profile`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error.response.data.error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await axios.post(`/api/user/logout`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error during logout:", error.response.data.error);
        throw error;
    }
};