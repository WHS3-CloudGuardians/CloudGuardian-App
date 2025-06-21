import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: '',
    birth: '',
    agreePrivacy: false,
  });

  const [status, setStatus] = useState({
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
  };

  const onSubmit = async e => {
    e.preventDefault();

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
      await api.post('/auth/signup', {
        email:     form.email,
        username:  form.username,
        password:  form.password,
        name:      form.name,
        gender:    form.gender,
        birthDate: form.birth,
      });
      nav('/login');
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_DUPLICATE') {
       setStatus(s => ({ ...s, error: '이미 등록된 이메일입니다.' }));
      } else if (err.response?.data?.code === 'NICKNAME_DUPLICATE') {
        setStatus(s => ({ ...s, error: '이미 등록된 닉네임입니다.' }));
      } else {
       setStatus(s => ({ ...s, error: '회원가입 중 오류가 발생했습니다.' }));
      }
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>회원가입</h2>
      {status.error && <div style={{ color: 'red', marginBottom: 12 }}>{status.error}</div>}
      {status.info  && <div style={{ color: 'green', marginBottom: 12 }}>{status.info}</div>}

      {/* 이메일 입력 */}
      <div>
        <label>이메일:</label><br/>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
      </div>

      {/* 아이디 입력 */}
      <div style={{ marginTop: 16 }}>
        <label>닉네임:</label><br/>
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          required
        />
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
