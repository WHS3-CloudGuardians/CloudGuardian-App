// src/api.js
/*import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173/api', // TODO: 실제 백엔드 URL
});

// 요청 시 JWT 토큰 자동 추가
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;*/
// src/api.js
// === Mock API for Front-end Testing ===

// 아주 간단히, GET /posts 요청에만 샘플 데이터를 반환합니다.
// src/api.js
// === Mock API for Front-end Testing ===

const api = {
  get: (url) => {
    console.log(`Mock GET ${url}`);

    // 1) 게시판 목록
    if (url.startsWith('/boards')) {
      return Promise.resolve({
        data: [
          { key: 'all',  name: '전체'       },
          { key: 'free', name: '자유게시판' },
          { key: 'news', name: '뉴스'       },
          // 필요하다면 더 추가…
        ]
      });
    }

    // 2) 게시글 목록
    if (url.startsWith('/posts')) {
      return Promise.resolve({
        data: {
          items: [
            { id: 1, title: '테스트 게시글 #1', imageUrl: null },
            { id: 2, title: '테스트 게시글 #2', imageUrl: null },
          ],
          totalPages: 1,
        },
      });
    }

    // 3) 나머지 GET 요청
    return Promise.resolve({ data: {} });
  },
  post: () => {
    console.log('Mock POST');
    return Promise.resolve({ data: {} });
  },
  put: () => {
    console.log('Mock PUT');
    return Promise.resolve({ data: {} });
  },
  delete: () => {
    console.log('Mock DELETE');
    return Promise.resolve({ data: {} });
  },
  interceptors: {
    request: { use: () => {} },
  },
};

export default api;


