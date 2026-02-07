import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Request interceptor to add Firebase ID token
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // Handle Unauthorized
            if (status === 401) {
                localStorage.removeItem('userInfo');
                // Optional: window.location.href = '/login';
            }

            // Handle AI Rate Limits Globally
            if (status === 429) {
                console.warn('[API] AI Rate Limit hit. Global handling triggered.');
                error.message = "AI Service is temporarily busy. Please wait 30 seconds and try again.";
            }
        }
        return Promise.reject(error);
    }
);

export const resumeService = {
    create: (title) => api.post('/resumes', { title }),
    getAll: (params = {}) => api.get('/resumes', { params }),
    getById: (id) => api.get(`/resumes/${id}`),
    update: (id, data) => api.put(`/resumes/${id}`, data),
    delete: (id) => api.delete(`/resumes/${id}`),
    restore: (id) => api.put(`/resumes/${id}/restore`),
    permanentDelete: (id) => api.delete(`/resumes/${id}/permanent`),
};

export const aiService = {
    enhance: (text, type, mode) => api.post('/ai/enhance', { text, type, mode }),
    parse: (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        return api.post('/ai/parse', formData);
    },
    analyze: (file) => {
        if (typeof file === 'string') {
            return api.post('/ai/analyze', { resumeText: file }); // Handle text input
        }
        const formData = new FormData();
        formData.append('resume', file);
        return api.post('/ai/analyze', formData);
    },
    jobMatch: (resumeText, jobDescription) => api.post('/ai/job-match', { resumeText, jobDescription }),
    coverLetter: (resumeText, jobDescription) => api.post('/ai/cover-letter', { resumeText, jobDescription }),
    trim: (resumeText) => api.post('/ai/trim', { resumeText }),
    extractText: (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        return api.post('/ai/extract-text', formData);
    }
};

export const templateService = {
    getAll: () => api.get('/templates'),
    seed: () => api.post('/templates/seed')
};

export const imageService = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/images/upload', formData);
    },
    removeBg: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/images/remove-bg', formData);
    },
};

export default api;
