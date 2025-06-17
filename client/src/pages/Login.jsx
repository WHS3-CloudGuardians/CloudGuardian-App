// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    email:    '',  // 백엔드 로그인 필드는 email
    password: '',
    // remember: false, // 더 이상 사용하지 않으므로 주석 처리
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    // email과 password가 모두 입력되었는지 확인
    if (!form.email || !form.password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    try {
      // email, password만 전달
      await login({ email: form.email, password: form.password });
    } catch (e) {
      setError('로그인에 실패했습니다. 계정 정보를 확인해 주세요.');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: '0 auto' }}>
      <h2>로그인</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      <div>
        <label>이메일:<br />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>비밀번호:<br />
          <div style={{ position: 'relative' }}>
            <input
              name="password"
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              style={{
                position: 'absolute', right: 8, top: 4,
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {showPwd ? '숨기기' : '보기'}
            </button>
          </div>
        </label>
      </div>

      {/*
      <div style={{ marginTop: 12 }}>
        <label>
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={onChange}
          />{' '}
          아이디 저장
        </label>
      </div>
      */}

      <button type="submit" style={{ marginTop: 16, width: '100%' }}>
        로그인
      </button>
    </form>
  );
}
