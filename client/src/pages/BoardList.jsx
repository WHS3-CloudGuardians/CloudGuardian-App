// src/pages/BoardList.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext'

export default function BoardList() {
  // 게시판 목록 및 선택 상태
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);

  // 게시판 목록 불러오기
  useEffect(() => {
    api.get('/boards') // TODO: GET /api/boards
      .then(res => setBoards(res.data))
      .catch(() => setBoards([{ key: 'all', name: '전체' }]));
  }, []);

  // 게시글 목록 불러오기 (게시판 선택, 페이지 변경 시)
  useEffect(() => {
    const params = new URLSearchParams({ page, board: selectedBoard });
    api.get(`/posts?${params.toString()}`) // TODO: GET /api/posts
      .then(res => {
        setPosts(res.data.items);
        setTotal(res.data.totalPages);
      })
      .catch(() => {
        setPosts([]);
        setTotal(1);
      });
  }, [selectedBoard, page]);

return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* 상단: 제목 + 글쓰기 버튼 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <h2 style={{ marginBottom: 24, fontSize: '1.5rem' }}>게시판</h2>
        {user ? (
          <Link to="/posts/new">
            <button>글쓰기</button>
          </Link>
        ) : (
          <button
            style={{ opacity: 0.5, cursor: 'pointer' }}
            onClick={() => alert('로그인 후 이용 가능합니다')}
          >
            글쓰기
          </button>
        )}
      </div>

      {/* 게시판 선택 */}
      <div style={{ marginBottom: 8 }}>
        <select
          value={selectedBoard}
          onChange={e => {
            setSelectedBoard(e.target.value);
            setPage(1);
          }}
        >
          {boards.map(b => (
            <option key={b.key} value={b.key}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* 구분선 */}
      <hr style={{ margin: '4px 0', borderColor: '#ccc' }} />

      {/* 컬럼 헤더 */}
      <div
        style={{
          display: 'flex',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          padding: '4px 0',
        }}
      >
        <div style={{ flex: '0 0 50px' }}>번호</div>
        <div style={{ flex: '0 0 100px' }}>게시판</div>
        <div style={{ flex: '1' }}>제목</div>
        <div style={{ flex: '0 0 100px' }}>작성자</div>
        <div style={{ flex: '0 0 80px' }}>조회</div>
      </div>
      <hr style={{ margin: '4px 0', borderColor: '#ccc' }} />

      {/* 게시글 리스트 */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {posts.map((p, idx) => (
          <li
            key={p.id}
            style={{
              display: 'flex',
              padding: '4px 0',
              alignItems: 'center',
              borderBottom: '1px solid #eee',
            }}
          >
            <div style={{ flex: '0 0 50px' }}>{p.id}</div>
            <div style={{ flex: '0 0 100px' }}>
              {boards.find(b => b.key === p.board)?.name || p.board}
            </div>
            <div style={{ flex: '1' }}>
              <Link to={`/posts/${p.id}`}>{p.title}</Link>
            </div>
            <div style={{ flex: '0 0 100px' }}>{p.author}</div>
            <div style={{ flex: '0 0 80px' }}>{p.views}</div>
          </li>
        ))}
      </ul>

      <Pagination page={page} totalPages={total} onChange={setPage} />
    </div>
  );
}
