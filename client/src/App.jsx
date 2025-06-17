// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import FindCredentials from './pages/FindCredentials';
import MyPage from './pages/MyPage';
import DeleteAccount from './pages/DeleteAccount';
import BoardList from './pages/BoardList';
import PostDetail from './pages/PostDetail';
import PostForm from './pages/PostForm';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import AdminUsers from './pages/AdminUsers';
import AdminPosts from './pages/AdminPosts';
import AdminDashboard from './pages/AdminDashboard';
import AdminComments from './pages/AdminComments';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header>
        <Link to="/">홈</Link> |{' '}
        {user ? (
          <>
            <Link to="/mypage">마이페이지</Link> |{' '}
            <Link to="/notifications">알림</Link> |{' '}
            <button onClick={logout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login">로그인</Link> |{' '}
            <Link to="/signup">회원가입</Link> |{' '}
            <Link to="/find">아이디/비번 찾기</Link>
          </>
        )}
        {user?.isAdmin && (
          <>
            {' '}
            | <Link to="/admin">대시보드</Link>
            | <Link to="/admin/users">회원 관리</Link>
            | <Link to="/admin/posts">게시글 관리</Link>
            | <Link to="/admin/comments">댓글 관리</Link>
          </>
        )}
        {' '}| <Link to="/search">검색</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/find" element={<FindCredentials />} />

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
          <Route path="/posts/new" element={<PostForm />} />
          <Route path="/posts/:postId/edit" element={<PrivateRoute><PostForm /></PrivateRoute>} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />

          {/* 관리자 전용 */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <PrivateRoute>
                <AdminPosts />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <PrivateRoute>
                <AdminComments />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </>
  );
}
