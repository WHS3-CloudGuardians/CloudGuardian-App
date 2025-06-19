// src/pages/DeleteAccount.jsx
import { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DeleteAccount() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onDelete = async () => {
    setError('');
    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    // 최종 확인 모달
    if (!window.confirm('탈퇴하면 모든 데이터가 영구 삭제됩니다. 정말 진행하시겠습니까?')) {
      return;
    }
    try {
      await api.delete('/auth', { data: { password } }); // TODO: DELETE /api/auth
      alert('탈퇴 처리되었습니다.');
      logout();
      navigate('/signup'); // 혹은 로그인 페이지로 리다이렉트
    } catch (e) {
      console.error(e);
      setError('탈퇴 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <h2>회원 탈퇴</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div>
        <label>현재 비밀번호:</label><br />
        <input
          type="password"
          placeholder="현재 비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>비밀번호 확인:</label><br />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </div>
      <button
        onClick={onDelete}
        style={{ marginTop: 16, width: '100%' }}
      >
        탈퇴하기
      </button>
    </div>
  );
}
