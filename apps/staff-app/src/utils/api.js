import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

export const socket = io(API_URL);

// ─── Theme helpers ─────────────────────────────────────────────────────────────
export const fetchThemes = async () => {
    const res = await api.get('/studio/themes');
    return res.data;
};

// ─── Queue helpers ─────────────────────────────────────────────────────────────
export const fetchQueue = async () => {
    const res = await api.get('/queue');
    return res.data; // returns { [themeName]: [queues...] }
};

export const callNext = async (themeId) => {
    const res = await api.post('/queue/call-next', { theme_id: themeId });
    return res.data;
};

export const startSession = async (queueId, boothId) => {
    const res = await api.post('/queue/start', { queue_id: queueId, booth_id: boothId });
    return res.data;
};

export const finishSession = async (queueId, boothId) => {
    const res = await api.post('/queue/finish', { queue_id: queueId, booth_id: boothId });
    return res.data;
};

export const sendToPrint = async (queueId) => {
    const res = await api.post('/queue/send-to-print', { queue_id: queueId });
    return res.data;
};
