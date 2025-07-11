// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // TODO: 실제 백엔드 URL
});

// 요청 시 JWT 토큰 자동 추가
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
