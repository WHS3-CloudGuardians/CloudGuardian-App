// src/pages/FindCredentials.jsx
import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function FindCredentials() {
  const [mode, setMode] = useState('id'); // 'id' or 'pw'
  const [form, setForm] = useState({
    email: '',
    userId: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({
    codeSent: false,
    codeVerified: false,
    result: '',
    error: '',
  });
  const nav = useNavigate();

  // 비밀번호 복잡도 체크
  const isValidPassword = pwd => {
    const checks = [/[A-Za-z]/.test(pwd), /\d/.test(pwd), /[!@#$%^&*(),.?":{}|<>]/.test(pwd)].filter(Boolean).length;
    return pwd.length >= 8 && checks >= 2;
  };

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setStatus(s => ({ ...s, error: '', result: '' }));
  };

  //인증번호 전송
  const sendCode = async () => {
    try {
      const endpoint = mode === 'id' ? '/auth/send-find-id-code' : '/auth/send-reset-pw-code'; // TODO
      await api.post(endpoint, mode === 'id' ? { email: form.email } : { email: form.email, userId: form.userId });
      setStatus(s => ({ ...s, codeSent: true, result: '인증번호를 발송했습니다.' }));
    } catch {
      setStatus(s => ({ ...s, error: '인증번호 발송에 실패했습니다.' }));
    }
  };

  //인증번호 검증
  const verifyCode = async () => {
    try {
      const endpoint = mode === 'id' ? '/auth/verify-find-id-code' : '/auth/verify-reset-pw-code'; // TODO
      const payload = { email: form.email, code: form.code };
      if (mode === 'pw') payload.userId = form.userId;
      const res = await api.post(endpoint, payload);
      setStatus(s => ({ ...s, codeVerified: true, result: '인증이 완료되었습니다.' }));
      if (mode === 'id') setStatus(s => ({ ...s, result: `당신의 아이디: ${res.data.userId}` }));
    } catch {
      setStatus(s => ({ ...s, error: '인증번호가 올바르지 않습니다.' }));
    }
  };

  //비밀번호 재설정
  const resetPassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setStatus(s => ({ ...s, error: '비밀번호가 일치하지 않습니다.' }));
      return;
    }
    if (!isValidPassword(form.newPassword)) {
      setStatus(s => ({ ...s, error: '비밀번호는 최소 8자, 영문·숫자·특수 중 2종 이상이어야 합니다.' }));
      return;
    }
    try {
      await api.post('/auth/reset-password', { userId: form.userId, password: form.newPassword }); // TODO
      setStatus(s => ({ ...s, result: '비밀번호가 성공적으로 변경되었습니다.' }));
      setTimeout(() => nav('/login'), 2000);
    } catch {
      setStatus(s => ({ ...s, error: '비밀번호 변경에 실패했습니다.' }));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>{mode === 'id' ? '아이디 찾기' : '비밀번호 재설정'}</h2>
      {status.error && <div style={{ color: 'red', marginBottom: 12 }}>{status.error}</div>}
      {status.result && <div style={{ color: 'green', marginBottom: 12 }}>{status.result}</div>}

      {/* 공통: 이메일 입력 */}
      <div>
        <label>이메일:</label><br />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          disabled={status.codeVerified && mode === 'id'}
          required
        />
      </div>

      {/* pw 모드에서는 userId 입력 필드 */}
      {mode === 'pw' && (
        <div style={{ marginTop: 8 }}>
          <label>아이디:</label><br />
          <input
            name="userId"
            value={form.userId}
            onChange={onChange}
            disabled={status.codeVerified}
            required
          />
        </div>
      )}

      {/* 인증번호 전송 */}
      {!status.codeSent && (
        <button
          type="button"
          onClick={sendCode}
          style={{ marginTop: 12 }}
        >
          인증번호 받기
        </button>
      )}

      {/* 인증번호 입력&확인 */}
      {status.codeSent && !status.codeVerified && (
        <div style={{ marginTop: 12 }}>
          <input
            name="code"
            placeholder="인증번호"
            value={form.code}
            onChange={onChange}
          />
          <button
            type="button"
            onClick={verifyCode}
            style={{ marginLeft: 8 }}
          >
            인증 확인
          </button>
        </div>
      )}

      {/* pw 모드: 인증 후 새 비밀번호 입력 */}
      {mode === 'pw' && status.codeVerified && (
        <>
          <div style={{ marginTop: 12 }}>
            <label>새 비밀번호:</label><br />
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={onChange}
              required
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>새 비밀번호 확인:</label><br />
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
              required
            />
          </div>
          <small style={{ color: '#666' }}>
            영문·숫자·특수문자 중 2종류 이상, 최소 8자
          </small>
          <button
            type="button"
            onClick={resetPassword}
            style={{ marginTop: 12 }}
          >
            비밀번호 변경
          </button>
        </>
      )}

      {/* 모드 전환 */}
      <hr style={{ margin: '16px 0' }} />
      <button
        type="button"
        onClick={() => {
          setMode(m => (m === 'id' ? 'pw' : 'id'));
          setForm({ email: '', userId: '', code: '', newPassword: '', confirmPassword: '' });
          setStatus({ codeSent: false, codeVerified: false, result: '', error: '' });
        }}
      >
        {mode === 'id' ? '비밀번호 재설정 모드로' : '아이디 찾기 모드로'}
      </button>
    </div>
  );
}
