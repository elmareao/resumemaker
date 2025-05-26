import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Determine API base URL from environment variables
// Fallback to localhost if not set, which is common for development
// Ensure you have REACT_APP_API_BASE_URL in your .env file for frontend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
let isRefreshing = false; // Flag to prevent multiple refresh attempts
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (error?: any) => void }> = []; // Queue for failed requests

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check for 401 error and ensure it's not a retry and not the refresh token URL itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      if (isRefreshing) {
        // If already refreshing, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
            if (originalRequest.headers) {
                 originalRequest.headers['Authorization'] = 'Bearer ' + token;
            }
            return axiosInstance(originalRequest);
        })
        .catch(err => {
            return Promise.reject(err);
        });
      }

      originalRequest._retry = true; // Mark as retry
      isRefreshing = true;

      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) {
        console.error('Interceptor: No refresh token available. Logging out.');
        // Perform logout actions: clear local storage, redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        isRefreshing = false;
        window.location.href = '/login'; // Force redirect
        return Promise.reject(error);
      }

      try {
        console.log('Interceptor: Attempting to refresh token...');
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: currentRefreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Update localStorage
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) { // Backend might not always send a new refresh token
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        console.log('Interceptor: Token refreshed successfully.');

        // Update the Authorization header for the original request
        if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        
        processQueue(null, newAccessToken); // Process queued requests with new token
        isRefreshing = false;
        return axiosInstance(originalRequest); // Retry original request

      } catch (refreshError: any) {
        console.error('Interceptor: Token refresh failed.', refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null); // Reject queued requests
        isRefreshing = false;
        
        // Perform logout actions
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Force redirect

        return Promise.reject(refreshError.response?.data || refreshError);
      }
    }

    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

export default axiosInstance;
