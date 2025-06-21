// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import DeleteAccount from './pages/DeleteAccount';
import BoardList from './pages/BoardList';
import PostDetail from './pages/PostDetail';
import PostForm from './pages/PostForm';
import PrivateRoute from './components/PrivateRoute';
import './index.css';      

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header>
        <Link to="/">홈</Link>
        {user ? (
          <>
            <Link to="/mypage">마이페이지</Link>
            <button onClick={logout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/mypage"
            element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/delete"
            element={
              <PrivateRoute>
                <DeleteAccount />
              </PrivateRoute>
            }
          />
          <Route path="/posts/new" element={<PrivateRoute><PostForm /></PrivateRoute>} />
          <Route path="/posts/:postId/edit" element={<PrivateRoute><PostForm /></PrivateRoute>} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </>
  );
}
