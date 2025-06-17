// src/pages/Signup.jsx
import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: '',
    code: '',
    userId: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: '',
    birth: '',
    agreePrivacy: false,
  });

  const [status, setStatus] = useState({
    emailSent: false,
    emailVerified: false,
    userIdChecked: false,
    error: '',
    info: '',
  });

  // 비밀번호 복잡도 체크: 최소8자, 영문/숫자/특수 중 2종류 이상
  const isValidPassword = pwd => {
    const checks = [
      /[A-Za-z]/.test(pwd),
      /\d/.test(pwd),
      /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    ].filter(Boolean).length;
    return pwd.length >= 8 && checks >= 2;
  };

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
    setStatus(s => ({ ...s, error: '', info: '' }));
    if (name === 'userId') setStatus(s => ({ ...s, userIdChecked: false }));
    if (name === 'email') {
      setStatus(s => ({ ...s, emailSent: false, emailVerified: false }));
    }
  };

  // 이메일로 인증번호 발송
  const sendEmailCode = async () => {
    if (!form.email) {
      setStatus(s => ({ ...s, error: '이메일을 입력해 주세요.' }));
      return;
    }
    try {
      await api.post('/auth/send-email-code', { email: form.email }); // TODO: 백엔드 라우트 확인
      setStatus(s => ({ ...s, emailSent: true, info: '인증번호를 발송했습니다.' }));
    } catch {
      setStatus(s => ({ ...s, error: '이메일 발송에 실패했습니다.' }));
    }
  };

  // 인증번호 확인
  const verifyEmailCode = async () => {
    if (!form.code) {
      setStatus(s => ({ ...s, error: '인증번호를 입력해 주세요.' }));
      return;
    }
    try {
      await api.post('/auth/verify-email-code', {
        email: form.email,
        code: form.code
      }); // TODO
      setStatus(s => ({ ...s, emailVerified: true, info: '이메일 인증 완료.' }));
    } catch {
      setStatus(s => ({ ...s, error: '인증번호가 올바르지 않습니다.' }));
    }
  };

  // 아이디 중복 확인
  const checkUserId = async () => {
    if (!form.userId) {
      setStatus(s => ({ ...s, error: '아이디를 입력해 주세요.' }));
      return;
    }
    try {
      const res = await api.get(`/auth/check-userid?userId=${form.userId}`); // TODO
      if (res.data.available) {
        setStatus(s => ({ ...s, userIdChecked: true, info: '사용 가능한 아이디입니다.' }));
      } else {
        setStatus(s => ({ ...s, error: '이미 사용 중인 아이디입니다.' }));
      }
    } catch {
      setStatus(s => ({ ...s, error: '아이디 확인에 실패했습니다.' }));
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!status.emailVerified) {
      setStatus(s => ({ ...s, error: '이메일 인증을 완료해 주세요.' }));
      return;
    }
    if (!status.userIdChecked) {
      setStatus(s => ({ ...s, error: '아이디 중복 확인을 해 주세요.' }));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus(s => ({ ...s, error: '비밀번호가 일치하지 않습니다.' }));
      return;
    }
    if (!isValidPassword(form.password)) {
      setStatus(s => ({ ...s, error: '비밀번호는 최소 8자, 영문·숫자·특수문자 중 2종류 이상이어야 합니다.' }));
      return;
    }
    if (!form.agreePrivacy) {
      setStatus(s => ({ ...s, error: '개인정보 수집·이용에 동의해 주세요.' }));
      return;
    }

    try {
      await api.post('/auth/register', {
        email: form.email,
        userId: form.userId,
        password: form.password,
        name: form.name,
        gender: form.gender,
        birth: form.birth,
      }); // TODO
      nav('/login');
    } catch {
      setStatus(s => ({ ...s, error: '회원가입 중 오류가 발생했습니다.' }));
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>회원가입</h2>
      {status.error && <div style={{ color: 'red', marginBottom: 12 }}>{status.error}</div>}
      {status.info && <div style={{ color: 'green', marginBottom: 12 }}>{status.info}</div>}

      {/* 이메일 + 인증 */}
      <div>
        <label>이메일:</label><br/>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          disabled={status.emailVerified}
          required
        />
        <button
          type="button"
          onClick={sendEmailCode}
          disabled={status.emailSent || status.emailVerified}
          style={{ marginLeft: 8 }}
        >
          {status.emailSent ? '재전송' : '인증번호 받기'}
        </button>
      </div>
      {status.emailSent && !status.emailVerified && (
        <div style={{ marginTop: 8 }}>
          <input
            name="code"
            placeholder="인증번호"
            value={form.code}
            onChange={onChange}
          />
          <button type="button" onClick={verifyEmailCode} style={{ marginLeft: 8 }}>
            인증 확인
          </button>
        </div>
      )}

      {/* 아이디 + 중복 확인 */}
      <div style={{ marginTop: 16 }}>
        <label>아이디:</label><br/>
        <input
          name="userId"
          value={form.userId}
          onChange={onChange}
          disabled={status.userIdChecked}
          required
        />
        <button
          type="button"
          onClick={checkUserId}
          disabled={status.userIdChecked}
          style={{ marginLeft: 8 }}
        >
          중복 확인
        </button>
      </div>

      {/* 비밀번호 및 확인 */}
      <div style={{ marginTop: 16 }}>
        <label>비밀번호:</label><br/>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>비밀번호 확인:</label><br/>
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

      {/* 이름·성별·생년월일 */}
      <div style={{ marginTop: 16 }}>
        <label>이름:</label><br/>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          required
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>성별:</label><br/>
        <select name="gender" value={form.gender} onChange={onChange} required>
          <option value="">선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="other">기타</option>
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>생년월일:</label><br/>
        <input
          name="birth"
          type="date"
          value={form.birth}
          onChange={onChange}
          required
        />
      </div>

      {/* 개인정보 수집 동의 */}
      <div style={{ marginTop: 16 }}>
        <label>
          <input
            type="checkbox"
            name="agreePrivacy"
            checked={form.agreePrivacy}
            onChange={onChange}
          />{' '}
          개인정보 수집·이용에 동의합니다.
        </label>
      </div>

      <button type="submit" style={{ marginTop: 20, width: '100%' }}>
        가입하기
      </button>
    </form>
  );
}
