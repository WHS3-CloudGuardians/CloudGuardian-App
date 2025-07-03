// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // 앱 시작 시 쿠키 기반 사용자 정보 불러오기
  useEffect(() => {
  api.post('/auth/me')
    .then(res => {
      console.log(res.data.data.user);
      setUser(res.data.data.user);
    })
    .catch(err => {
      console.error('❌ /auth/me 실패:', err);
    })
    .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    await api.post('/auth/login', { email, password });
    const res = await api.get('/auth/me'); // 쿠키로 자동 인증됨
    const payload = res.data.data || res.data;
    setUser(payload.user);
    nav('/');
  };

  const logout = () => {
    setUser(null);
    nav('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
