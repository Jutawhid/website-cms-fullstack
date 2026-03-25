import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle transparent 401 automatic Refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already retried this exact request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error("No refresh token strictly available");
                
                // Ask Golang for a brand new Access Token!
                const res = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, {
                    refresh_token: refreshToken
                });
                
                const newAccessToken = res.data.access_token;
                
                // Save it for future requests
                localStorage.setItem('access_token', newAccessToken);
                
                // Attach new token mathematically to original failed request and retry!
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
                
            } catch (refreshError) {
                // If the Refresh Token ALSO expired, force a strict logout
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_role');
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);
