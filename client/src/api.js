// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // TODO: 실제 백엔드 URL
  withCredentials: true, // 👈 쿠키 전송 허용
});

export default api;
