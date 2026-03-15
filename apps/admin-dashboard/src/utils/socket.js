import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthToken = () => {
    try {
        const storeStr = localStorage.getItem('jjikgo-admin-store');
        if (storeStr) {
            const { user } = JSON.parse(storeStr);
            return user?.token || null;
        }
    } catch (e) { }
    return null;
};

export const socket = io(API_URL, {
    withCredentials: true,
    auth: {
        token: getAuthToken(),
    }
});
