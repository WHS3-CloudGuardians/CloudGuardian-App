// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // 앱 시작 시 토큰이 있으면 사용자 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.post('/auth/me')
        .then(res => {
          setUser(res.data.data.user);
        })
        .catch(err => { console.error('❌ /auth/me 실패:', err); localStorage.removeItem('token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    // 백엔드가 { data: { accessToken, user } } 형태로 반환
    const payload = res.data.data || res.data;
    const { accessToken, user } = payload;
    localStorage.setItem('token', accessToken);
    setUser(user);
    nav('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
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
