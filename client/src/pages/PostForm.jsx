// src/pages/PostForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function PostForm() {
  const { postId } = useParams();
  const editMode = !!postId;
  const nav = useNavigate();
  const [boards, setBoards] = useState([]);
  const [form, setForm] = useState({ title:'', content:'', media:null /* File */, board:'free' });
  
  useEffect(() => {
    api.get('/boards').then(res => setBoards(res.data));
  }, []);

  useEffect(()=>{
    if (!editMode) return;
    api.get(`/posts/${postId}`)
      .then(res => {
        const { title, content, board } = res.data.data.post;
        setForm(f => ({
          ...f,
          title,
          content,
          board
        }));
      })
      .catch(err => {
        console.error('글 수정용 데이터 로드 실패', err);
      });
  }, [editMode, postId]);

  const onFile = e => setForm(f=>({...f, media:e.target.files[0]}));
  const onChange = e => setForm(f=>({...f, [e.target.name]:e.target.value}));

  const onSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('content', form.content);
    data.append('board', form.board);
    if(form.media) data.append('media', form.media);
    if(editMode) {
      await api.put(`/posts/${postId}`, data);
    } else {
      await api.post('/posts', data);
    }
    nav('/');
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>{editMode? '글 수정':'글쓰기'}</h2>
      <div>
        <label>게시판: 
          <select name="board" value={form.board} onChange={onChange}>
            <option value="free">자유</option>
            <option value="inform">정보</option>
          </select>
        </label>
      </div>
      <div>
        <label>제목: 
          <input name="title" value={form.title} onChange={onChange} required/>
        </label>
      </div>
      <div>
        <label>내용: 
          <textarea name="content" value={form.content} rows={10} onChange={onChange} required/>
        </label>
      </div>
      <div>
        <label>이미지/동영상 첨부: 
          <input type="file" onChange={onFile}/>
        </label>
      </div>
      <button>저장</button>
    </form>
  );
}
