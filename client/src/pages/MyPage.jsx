// src/pages/MyPage.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function MyPage() {
  const { user, logout } = useAuth();
  const [info, setInfo] = useState({
    nickname: '',
    newPassword: '',
    confirmPassword: '',
    profileFile: null,
    profilePreview: '',
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
    api.get('/users/me')  // TODO: GET /api/users/me
      .then(r => {
        setInfo(f => ({
          ...f,
          nickname: r.data.nickname,
          profilePreview: r.data.profileUrl,
          name: r.data.name,
          gender: r.data.gender,
          birth: r.data.birth,
        }));
      });
  }, [user]);

  // 내가 쓴 글/댓글 조회는 기존 Board&Comments list etc.

  // 입력 변화 핸들러
  const onChange = e => {
    const { name, value } = e.target;
    setInfo(f => ({ ...f, [name]: value }));
    setStatus(s => ({ ...s, error: '', infoMsg: '' }));
    if (name === 'nickname') setStatus(s => ({ ...s, nickChecked: false }));
  };

  // 프로필 이미지 선택
  const onFile = e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setInfo(f => ({ ...f, profileFile: file, profilePreview: url }));
    }
  };

  // 닉네임 중복 확인
  const checkNickname = async () => {
    if (!info.nickname) {
      setStatus(s => ({ ...s, error: '닉네임을 입력해 주세요.' }));
      return;
    }
    try {
      const res = await api.get(`/auth/check-nickname?nickname=${info.nickname}`); // TODO
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
    // 개인정보 동의 없음
    // 닉네임 체크 누락
    if (!status.nickChecked) {
      setStatus(s => ({ ...s, error: '닉네임 중복 확인을 해 주세요.' }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nickname', info.nickname);
      formData.append('name', info.name);
      formData.append('gender', info.gender);
      formData.append('birth', info.birth);
      if (info.newPassword) formData.append('password', info.newPassword);
      if (info.profileFile) formData.append('profile', info.profileFile);

      await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }); // TODO: PUT /api/users/me

      setStatus(s => ({ ...s, infoMsg: '저장되었습니다.', error: '' }));
    } catch {
      setStatus(s => ({ ...s, error: '저장 중 오류가 발생했습니다.' }));
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto'}}>
      <h2>마이페이지</h2>
      {status.error && <div style={{ color: 'red' }}>{status.error}</div>}
      {status.infoMsg && <div style={{ color: 'green' }}>{status.infoMsg}</div>}

      <div style={{ marginTop: 12 }}>
        <label>프로필 이미지:</label><br />
        {info.profilePreview && <img src={info.profilePreview} alt="profile" width={100} style={{ display: 'block', marginBottom: 8 }} />}
        <input type="file" accept="image/*" onChange={onFile} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>닉네임:</label><br />
        <input name="nickname" value={info.nickname} onChange={onChange} />
        <button type="button" onClick={checkNickname} disabled={status.nickChecked} style={{ marginLeft: 8 }}>
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
        <input name="name" value={info.name} onChange={onChange} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>성별:</label><br />
        <select name="gender" value={info.gender} onChange={onChange}>
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

      {/* 내 글, 댓글 조회 섹션은 기존 구현 유지 */}
    </div>
  );
}
