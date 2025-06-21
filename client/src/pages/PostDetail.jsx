// src/pages/PostDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);

  useEffect(() => {
   api.get('/boards')
     .then(res => setBoards(res.data))
     .catch(()=>{/* 실패해도 무시 */});
 }, []);

  useEffect(() => {
    api.get(`/posts/${postId}`)
      .then(res => {
        const detail = res.data.data.post;
        setPost(detail);
      })
      .catch(err => {
        console.error('게시글 상세조회 실패', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [postId]);

  if (loading) return <p>로딩 중…</p>;
  if(!post) return <p>게시글을 찾을 수 없습니다.</p>;

   const onDelete = async () => {
    if(!window.confirm('삭제할까요?')) return;
    await api.delete(`/posts/${postId}`);
    nav('/');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>{post.title}</h2>
      <p>
        <strong>게시판:</strong> {boards.find(b => b.key === post.board)?.name || post.board} &nbsp;|&nbsp;
        <strong>작성자:</strong> {post.author} &nbsp;|&nbsp;
        <strong>작성일:</strong> {new Date(post.createdAt).toLocaleString()} &nbsp;|&nbsp;
        <strong>조회수:</strong> {post.views}
      </p>
      <hr style={{ margin: '4px 0', borderColor: '#ccc' }} />
      <div style={{ whiteSpace: 'pre-wrap', margin: '1em 0' }}>
        {post.content}
      </div>
      {post.mediaUrl && (
        <div style={{ margin: '1em 0' }}>
          {/* 이미지/동영상 구분해서 렌더링 */}
          {/\.(jpe?g|png|gif)$/i.test(post.mediaUrl) ? (
            <img src={post.mediaUrl} alt="" style={{ maxWidth: '100%' }} />
          ) : (
            <video controls style={{ maxWidth: '100%' }}>
              <source src={post.mediaUrl} />
            </video>
          )}
        </div>
      )}
      {user?.id === post.userId && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5em', margin: '1em 0' }}>
          <button onClick={() => nav(`/posts/${postId}/edit`)}>수정</button>
          <button onClick={onDelete}>삭제</button>
        </div>
      )}
      <Link to="/">← 목록으로 돌아가기</Link>
    </div>
  );
}