// src/pages/MyPage.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const { user, logout } = useAuth();
  const [info, setInfo] = useState({
    email:'',
    username: '',
    newPassword: '',
    confirmPassword: '',
    name: '',
    gender: '',
    birth: '',
  });
  const [status, setStatus] = useState({
    nickChecked: false,
    error: '',
    infoMsg: ''
  });

  // 초기 정보 불러오기
  useEffect(() => {
    if (!user) return;
    api.get('/auth/me')  // TODO: GET /api/auth/me
      .then(r => {
        const me = r.data.data.user
        setInfo(f => ({
          ...f,
          email: me.email,
          username: me.username,
          name: me.name,
          gender: me.gender,
          birthDate: me.birth,
        }));
      });
  }, [user]);

  // 내가 쓴 글/댓글 조회는 기존 Board&Comments list etc.

  // 입력 변화 핸들러
  const onChange = e => {
    const { name, value } = e.target;
    setInfo(f => ({ ...f, [name]: value }));
    setStatus(s => ({ ...s, error: '', infoMsg: '' }));
    if (name === 'username') setStatus(s => ({ ...s, nickChecked: false }));
  };

  // 닉네임 중복 확인
  const checkNickname = async () => {
    if (!info.username) {
      setStatus(s => ({ ...s, error: '닉네임을 입력해 주세요.' }));
      return;
    }
    try {
      const res = await api.get(`/auth/check-nickname?username=${info.username}`); // TODO
      if (res.data.available) {
        setStatus(s => ({ ...s, nickChecked: true, infoMsg: '사용 가능한 닉네임입니다.' }));
      } else {
        setStatus(s => ({ ...s, error: '이미 사용 중인 닉네임입니다.' }));
      }
    } catch {
      setStatus(s => ({ ...s, error: '닉네임 확인 중 오류가 발생했습니다.' }));
    }
  };

  // 저장
  const onSave = async () => {
    // 비밀번호 일치 및 복잡도
    if (info.newPassword || info.confirmPassword) {
      if (info.newPassword !== info.confirmPassword) {
        setStatus(s => ({ ...s, error: '비밀번호가 일치하지 않습니다.' }));
        return;
      }
      const checks = [/[A-Za-z]/.test(info.newPassword), /\d/.test(info.newPassword), /[!@#$%^&*(),.?":{}|<>]/.test(info.newPassword)].filter(Boolean).length;
      if (info.newPassword.length < 8 || checks < 2) {
        setStatus(s => ({ ...s, error: '비밀번호는 최소 8자, 영문·숫자·특수 중 2종 이상이어야 합니다.' }));
        return;
      }
    }
 
    // 닉네임 체크 누락
    if (!status.nickChecked) {
      setStatus(s => ({ ...s, error: '닉네임 중복 확인을 해 주세요.' }));
      return;
    }

    try {
      const data = {};
      if (info.username) data.username = info.username;
      if (info.newPassword) data.password = info.newPassword;
      if (info.gender) data.gender = info.gender;
      if (info.birth) data.birth = info.birth.slice(0, 10);

      await api.put('/auth/me', data);

      setStatus(s => ({ ...s, infoMsg: '저장되었습니다.', error: '' }));
    } catch (error) {
      console.error("저장 중 오류:", error); // ✅ 에러 정보 출력
      setStatus(s => ({ ...s, error: '저장 중 오류가 발생했습니다.' }));
    }
  };

  const navigate = useNavigate();
  const onDelete = () => {
    navigate("/delete");
  };  

  return (
    <div style={{ maxWidth: 500, margin: '0 auto'}}>
      <h2>마이페이지</h2>
      {status.error && <div style={{ color: 'red' }}>{status.error}</div>}
      {status.infoMsg && <div style={{ color: 'green' }}>{status.infoMsg}</div>}

      <div style={{ marginTop: 12 }}>
        <label>이메일:</label><br />
        <input name="email" value={info.email} onChange={onChange} readOnly />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>닉네임:</label><br />
        <input name="username" value={info.username} onChange={onChange} />
        <button type="button" onClick={checkNickname} disabled={status.nickChecked} style={{ marginLeft: 0 }}>
          중복 확인
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>새 비밀번호 (변경 시 입력):</label><br />
        <input name="newPassword" type="password" value={info.newPassword} onChange={onChange} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>비밀번호 확인:</label><br />
        <input name="confirmPassword" type="password" value={info.confirmPassword} onChange={onChange} />
        <small style={{ color: '#666', display: 'block' }}>영문·숫자·특수 중 2종 이상, 최소 8자</small>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>이름:</label><br />
        <input name="name" value={info.name} onChange={onChange} readOnly />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>성별:</label><br />
        <select name="gender" value={info.gender} onChange={onChange} >
          <option value="">선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="other">기타</option>
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>생년월일:</label><br />
        <input name="birth" type="date" value={info.birth} onChange={onChange} />
      </div>

      <button type="button" onClick={onSave} style={{ marginTop: 16, width: '100%' }}>
        저장
      </button>
      <button type="button" onClick={onDelete} style={{  backgroundColor: 'red', marginTop: 16, width: '100%' }}>
        회원탈퇴
      </button>
    </div>
  );
}