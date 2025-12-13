import axios from 'axios';

// Tạo axios instance với interceptor
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:3001'
});

// Interceptor để xử lý lỗi ROLE_CHANGED
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message === 'ROLE_CHANGED' || error.response?.data?.needRelogin) {
      // Role đã thay đổi, logout và redirect
      localStorage.clear();
      alert('⚠️ Vai trò của bạn đã được thay đổi. Vui lòng đăng nhập lại!');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
