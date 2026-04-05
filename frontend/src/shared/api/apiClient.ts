import axios from 'axios';

/**
 * Axios instance - Configured for NestJS backend API
 *
 * Configuration:
 *   - Base URL: Reads from NEXT_PUBLIC_API_URL environment variable
 *     (set in .env.local), should already include /api suffix
 *   - Default: http://localhost:3001/api (backend on port 3001)
 *   - Timeout: 15 seconds to prevent request hanging
 *   - Content-Type: application/json for all requests
 *   - JWT: Automatically adds Authorization header with Bearer token
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// Interceptor to automatically add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to unwrap the TransformInterceptor's data structure
apiClient.interceptors.response.use(
  (response) => {
    // Tự động bóc lớp "data" bên ngoài của NestJS TransformInterceptor
    // giúp Frontend nhận lại dữ liệu thô như cũ
    if (response.data && response.data.data !== undefined) {
      // Vì Axios trả về config ở response.data, và TransformInterceptor trả về object có thuộc tính 'data'
      // Nên object thực sự là response.data.data
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
