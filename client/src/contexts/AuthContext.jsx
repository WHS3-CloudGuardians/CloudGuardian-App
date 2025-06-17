// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  // 앱 시작 시 토큰이 있으면 사용자 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me') // TODO: GET /api/auth/me
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('token'); });
    }
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials); // TODO
    // localStorage.setItem('token', res.data.token);
    storage.setItem('token', res.data.token);
    setUser(res.data.user);
    nav('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    nav('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
