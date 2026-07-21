import { MOCK_ARTICLES } from './mockData';

const API_BASE_URL = '/api';

// Token management
const tokenStorage = {
   getToken: () => localStorage.getItem('auth_token'),
   setToken: (token) => localStorage.setItem('auth_token', token),
   clearToken: () => localStorage.removeItem('auth_token'),
   getUser: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
   },
   setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
   clearUser: () => localStorage.removeItem('user'),
};

// ─── MOCK USERS MANAGER (Simulating Database) ───
const mockUsersManager = {
   getUsers: () => {
      const usersStr = localStorage.getItem('mock_users_db');
      if (usersStr) return JSON.parse(usersStr);
      
      // Seed default users if none exists
      const defaultUsers = [
         { id: 'admin-1', email: 'admin@baorong.com', fullName: 'Quản Trị Viên', role: 'admin', status: 'active', balance: 99999999, plan: 'pro', planExpiry: new Date(2100, 0, 1).toISOString() },
         { id: 'user-1', email: 'guest@baorong.com', fullName: 'Độc Giả', role: 'guest', status: 'active', balance: 250000, plan: null, planExpiry: null },
      ];
      localStorage.setItem('mock_users_db', JSON.stringify(defaultUsers));
      return defaultUsers;
   },
   saveUsers: (users) => {
      localStorage.setItem('mock_users_db', JSON.stringify(users));
   },
   getUserByEmail: (email) => {
      const users = mockUsersManager.getUsers();
      return users.find(u => u.email === email);
   },
   createUser: (userData) => {
      const users = mockUsersManager.getUsers();
      const newUser = {
         id: 'user-' + Date.now(),
         email: userData.email,
         fullName: userData.fullName || 'Người Dùng Mới',
         role: userData.role || 'guest',
         status: 'active',
         balance: 0,
         plan: null,
         planExpiry: null
      };
      users.push(newUser);
      mockUsersManager.saveUsers(users);
      return newUser;
   },
   updateWallet: (id, balanceAdd, newPlan) => {
      const users = mockUsersManager.getUsers();
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) throw new Error('User not found');
      
      const user = users[userIndex];
      user.balance = (user.balance || 0) + (Number(balanceAdd) || 0);
      
      if (newPlan && newPlan !== 'none') {
         user.plan = newPlan;
         // Set expiry to 30 days from now
         const expiry = new Date();
         expiry.setDate(expiry.getDate() + 30);
         user.planExpiry = expiry.toISOString();
      } else if (newPlan === 'none') {
         user.plan = null;
         user.planExpiry = null;
      }
      
      users[userIndex] = user;
      mockUsersManager.saveUsers(users);
      return user;
   }
};

// Default headers with token
const getHeaders = () => {
   const token = tokenStorage.getToken();
   return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
   };
};

// Mock fallback handler when API connection fails or database is down
const getMockFallback = (method, endpoint, data) => {
   const urlParts = endpoint.split('?');
   const path = urlParts[0];
   const queryStr = urlParts[1] || '';

   const params = {};
   if (queryStr) {
      queryStr.split('&').forEach((param) => {
         const [key, val] = param.split('=');
         if (key) {
            params[key] = decodeURIComponent(val || '');
         }
      });
   }

   const limit = parseInt(params.limit) || 20;
   const offset = parseInt(params.offset) || 0;

   if (method === 'GET') {
      // 1. All articles: /articles
      if (path === '/articles') {
         const category = params.category;
         const query = params.query;

         let filtered = [...MOCK_ARTICLES];
         if (category) {
            filtered = filtered.filter((a) => a.category === category);
         }
         if (query) {
            const lower = query.toLowerCase();
            filtered = filtered.filter(
               (a) =>
                  a.title.toLowerCase().includes(lower) ||
                  (a.excerpt && a.excerpt.toLowerCase().includes(lower)) ||
                  (a.content && a.content.toLowerCase().includes(lower))
            );
         }
         return filtered
            .map((a) => ({
               ...a,
               publishedAt:
                  a.publishedAt || (a.date instanceof Date ? a.date.toISOString() : a.date) || new Date().toISOString(),
               createdAt:
                  a.createdAt || (a.date instanceof Date ? a.date.toISOString() : a.date) || new Date().toISOString(),
               authorName: a.author || 'Tác giả',
               authorAvatar: 'https://i.pravatar.cc/150?img=1',
            }))
            .slice(offset, offset + limit);
      }

      // 2. Specific article: /articles/:id
      const articleMatch = path.match(/^\/articles\/([a-zA-Z0-9-]+)$/);
      if (articleMatch) {
         const id = articleMatch[1];
         const article = MOCK_ARTICLES.find((a) => String(a.id) === String(id));
         if (!article) {
            throw new Error('Article not found');
         }
         return {
            ...article,
            publishedAt:
               article.publishedAt ||
               (article.date instanceof Date ? article.date.toISOString() : article.date) ||
               new Date().toISOString(),
            createdAt:
               article.createdAt ||
               (article.date instanceof Date ? article.date.toISOString() : article.date) ||
               new Date().toISOString(),
            authorName: article.author || 'Tác giả',
            authorAvatar: 'https://i.pravatar.cc/150?img=1',
         };
      }

      // 3. Category articles: /articles/category/:category
      const catMatch = path.match(/^\/articles\/category\/([a-zA-Z0-9-]+)$/);
      if (catMatch) {
         const category = catMatch[1];
         const filtered = MOCK_ARTICLES.filter((a) => a.category === category);
         return filtered
            .map((a) => ({
               ...a,
               publishedAt:
                  a.publishedAt || (a.date instanceof Date ? a.date.toISOString() : a.date) || new Date().toISOString(),
               createdAt:
                  a.createdAt || (a.date instanceof Date ? a.date.toISOString() : a.date) || new Date().toISOString(),
               authorName: a.author || 'Tác giả',
               authorAvatar: 'https://i.pravatar.cc/150?img=1',
            }))
            .slice(offset, offset + limit);
      }

      // 4. Search: /articles/search/:query
      const searchMatch = path.match(/^\/articles\/search\/(.+)$/);
      if (searchMatch) {
         const query = decodeURIComponent(searchMatch[1]);
         const lower = query.toLowerCase();
         const filtered = MOCK_ARTICLES.filter(
            (a) =>
               a.title.toLowerCase().includes(lower) ||
               (a.excerpt && a.excerpt.toLowerCase().includes(lower)) ||
               (a.content && a.content.toLowerCase().includes(lower))
         );
         return filtered
            .map((a) => ({
               ...a,
               publishedAt:
                  a.publishedAt || (a.date instanceof Date ? a.date.toISOString() : a.date) || new Date().toISOString(),
               createdAt:
                  a.createdAt || (a.date instanceof Date ? a.date.toISOString() : a.date) || new Date().toISOString(),
               authorName: a.author || 'Tác giả',
               authorAvatar: 'https://i.pravatar.cc/150?img=1',
            }))
            .slice(offset, offset + limit);
      }

      // 5. Comments: /comments/:articleId
      const commentsMatch = path.match(/^\/comments\/([a-zA-Z0-9-]+)$/);
      if (commentsMatch) {
         return [
            {
               id: 'c1',
               content: 'Bài viết rất hay và bổ ích!',
               createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
               user_name: 'Minh Tuấn',
               avatar: 'https://i.pravatar.cc/150?img=11',
               likes: 5,
            },
            {
               id: 'c2',
               content: 'Thông tin rất kịp thời, cảm ơn tác giả.',
               createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
               user_name: 'Thu Hương',
               avatar: 'https://i.pravatar.cc/150?img=4',
               likes: 2,
            },
         ];
      }

      // 6. User profile /auth/me
      if (path === '/auth/me') {
         let user = tokenStorage.getUser();
         if (!user) {
            throw new Error('Unauthorized');
         }
         // Refresh user data from mock DB to get latest balance/plan
         const dbUser = mockUsersManager.getUsers().find(u => u.id === user.id);
         if (dbUser) {
            user = { ...user, ...dbUser };
            tokenStorage.setUser(user);
         }
         return user;
      }

      // 7. Bookmarks: /bookmarks
      if (path === '/bookmarks') {
         return [];
      }

      // 8. Notifications: /notifications
      if (path === '/notifications') {
         return [];
      }

      // 9. My comments
      if (path === '/comments/my-comments') {
         return [];
      }

      // 9b. All comments (admin)
      if (path === '/comments') {
         return [];
      }

      // 10. Admin users list
      if (path === '/admin/users') {
         return mockUsersManager.getUsers().slice(offset, offset + limit);
      }
   }

   if (method === 'PUT') {
      if (path === '/auth/change-password') {
         return { message: 'Đổi mật khẩu thành công' };
      }

      // Admin update user wallet
      const updateWalletMatch = path.match(/^\/admin\/users\/([a-zA-Z0-9-]+)\/wallet$/);
      if (updateWalletMatch) {
         const id = updateWalletMatch[1];
         const updatedUser = mockUsersManager.updateWallet(id, data.addedBalance, data.plan);
         return updatedUser;
      }
   }

   if (method === 'POST') {
      // Submit comment: /comments/:articleId
      const submitCommentMatch = path.match(/^\/comments\/([a-zA-Z0-9-]+)$/);
      if (submitCommentMatch) {
         return {
            id: 'new-comment-id',
            content: data?.content || '',
            createdAt: new Date().toISOString(),
            user_name: tokenStorage.getUser()?.fullName || 'Khách',
            avatar: tokenStorage.getUser()?.avatar || '',
            likes: 0,
         };
      }

      // Login: /auth/login
      if (path === '/auth/login') {
         const email = data?.email || 'guest@baorong.com';
         
         let dbUser = mockUsersManager.getUserByEmail(email);
         if (!dbUser) {
            // Auto create if not found for testing flexibility
            const role = email.includes('admin') ? 'admin' : email.includes('editor') ? 'editor' : email.includes('author') ? 'author' : 'guest';
            const fullName = role === 'admin' ? 'Quản Trị Viên' : role === 'editor' ? 'Biên Tập Viên' : role === 'author' ? 'Tác Giả' : 'Độc Giả';
            dbUser = mockUsersManager.createUser({ email, fullName, role });
         }

         // Ensure wallet is sync'd to rongvang_wallet for backward compatibility with frontend mock
         localStorage.setItem('rongvang_wallet', JSON.stringify({
            balance: dbUser.balance,
            plan: dbUser.plan,
            planExpiry: dbUser.planExpiry,
            dailyUsed: 0,
            monthlyUsed: 0
         }));

         return {
            token: 'mock-jwt-token',
            user: dbUser,
         };
      }

      // Register: /auth/register
      if (path === '/auth/register') {
         const email = data?.email || 'newuser@baorong.com';
         if (mockUsersManager.getUserByEmail(email)) {
            throw new Error('Email đã được sử dụng');
         }
         const newUser = mockUsersManager.createUser({
            email,
            fullName: data?.fullName || 'Người Dùng Mới',
            role: data?.role || 'guest'
         });
         
         // Ensure wallet is sync'd
         localStorage.setItem('rongvang_wallet', JSON.stringify({
            balance: newUser.balance,
            plan: newUser.plan,
            planExpiry: newUser.planExpiry,
            dailyUsed: 0,
            monthlyUsed: 0
         }));

         return {
            token: 'mock-jwt-token',
            user: newUser,
         };
      }
   }

   if (method === 'DELETE') {
      // Bookmarks delete
      const deleteBookmarkMatch = path.match(/^\/bookmarks\/([a-zA-Z0-9-]+)$/);
      if (deleteBookmarkMatch) {
         return { success: true };
      }
   }

   return [];
};

// API helper function with mock fallback on connection failure or server errors
const apiCall = async (method, endpoint, data = null) => {
   const cacheKey = `${method}:${endpoint}`;

   // Try to get from cache for GET requests
   if (method === 'GET') {
      const { apiCache } = await import('./cache.js');
      if (apiCache.has(cacheKey)) {
         return apiCache.get(cacheKey);
      }
   }

   const options = {
      method,
      headers: getHeaders(),
   };

   if (data) {
      options.body = JSON.stringify(data);
   }

   try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      if (response.status === 401) {
         tokenStorage.clearToken();
         tokenStorage.clearUser();
         window.location.href = '/login';
         throw new Error('Session expired');
      }

      const responseData = await response.json();

      if (!response.ok) {
         const err = new Error(responseData.message || 'API error');
         err.status = response.status;
         throw err;
      }

      // Save to cache for GET requests
      if (method === 'GET') {
         const { apiCache } = await import('./cache.js');
         apiCache.set(cacheKey, responseData);
      }

      return responseData;
   } catch (error) {
      // Do not use mock fallback for auth or validation errors from server
      if (error.status === 400 || error.status === 401 || error.status === 403) {
         throw error;
      }
      console.warn(`API call failed for ${method} ${endpoint}, falling back to mock data:`, error.message);
      try {
         return getMockFallback(method, endpoint, data);
      } catch (fallbackError) {
         console.error('Fallback failed:', fallbackError);
         throw error;
      }
   }
};

// AUTH API
const authAPI = {
   register: (email, password, fullName, role = 'guest') =>
      apiCall('POST', '/auth/register', { email, password, fullName, role }),

   login: (email, password) => apiCall('POST', '/auth/login', { email, password }),

   getMe: () => apiCall('GET', '/auth/me'),

   getProfile: () => apiCall('GET', '/auth/me'),

   updateProfile: (data) => apiCall('PUT', '/auth/me', data),

   changePassword: (currentPassword, newPassword) =>
      apiCall('PUT', '/auth/change-password', { currentPassword, newPassword }),
};

// ARTICLES PUBLIC API
const articlesAPI = {
   getAll: (limit = 20, offset = 0, category = null, query = null) => {
      if (query) {
         return articlesAPI.search(query, limit, offset);
      }
      if (category) {
         return articlesAPI.getByCategory(category, limit, offset);
      }
      return apiCall('GET', `/articles?limit=${limit}&offset=${offset}`);
   },

   getById: (id) => apiCall('GET', `/articles/${id}`),

   getByCategory: (category, limit = 20, offset = 0) =>
      apiCall('GET', `/articles/category/${category}?limit=${limit}&offset=${offset}`),

   search: (query, limit = 20, offset = 0) =>
      apiCall('GET', `/articles/search/${query}?limit=${limit}&offset=${offset}`),
};

// AUTHOR API
const authorAPI = {
   createArticle: (data) => apiCall('POST', '/author/articles', data),

   getMyArticles: (limit = 20, offset = 0) =>
      apiCall('GET', `/author/articles/my-articles?limit=${limit}&offset=${offset}`),

   getArticle: (id) => apiCall('GET', `/author/articles/${id}`),

   updateArticle: (id, data) => apiCall('PUT', `/author/articles/${id}`, data),

   submitArticle: (id) => apiCall('POST', `/author/articles/${id}/submit`),

   deleteArticle: (id) => apiCall('DELETE', `/author/articles/${id}`),
};

// EDITOR API
const editorAPI = {
   getPendingArticles: (limit = 20, offset = 0) =>
      apiCall('GET', `/editor/articles/pending?limit=${limit}&offset=${offset}`),

   getApprovedArticles: (limit = 20, offset = 0) =>
      apiCall('GET', `/editor/articles/approved?limit=${limit}&offset=${offset}`),

   getRejectedArticles: (limit = 20, offset = 0) =>
      apiCall('GET', `/editor/articles/rejected?limit=${limit}&offset=${offset}`),

   approveArticle: (id) => apiCall('POST', `/editor/articles/${id}/approve`),

   rejectArticle: (id, reason) => apiCall('POST', `/editor/articles/${id}/reject`, { reason }),

   suggestEdit: (id, suggestion) => apiCall('POST', `/editor/articles/${id}/suggest-edit`, { suggestion }),

   getStats: () => apiCall('GET', '/editor/articles/stats/me'),
};

// ADMIN API
const adminAPI = {
   // Article management
   getAllArticles: (limit = 50, offset = 0) => apiCall('GET', `/admin/articles/all?limit=${limit}&offset=${offset}`),

   publishArticle: (id) => apiCall('POST', `/admin/articles/${id}/publish`),

   deleteArticle: (id) => apiCall('DELETE', `/admin/articles/${id}`),

   // Category management
   createCategory: (data) => apiCall('POST', '/admin/categories', data),

   getCategories: () => apiCall('GET', '/admin/categories'),

   updateCategory: (id, data) => apiCall('PUT', `/admin/categories/${id}`, data),

   deleteCategory: (id) => apiCall('DELETE', `/admin/categories/${id}`),

   // User management
   getUsers: (limit = 50, offset = 0) => apiCall('GET', `/admin/users?limit=${limit}&offset=${offset}`),

   getUsersByRole: (role) => apiCall('GET', `/admin/users/role/${role}`),

   updateUserRole: (id, role) => apiCall('PUT', `/admin/users/${id}/role`, { role }),

   suspendUser: (id) => apiCall('PUT', `/admin/users/${id}/suspend`),

   activateUser: (id) => apiCall('PUT', `/admin/users/${id}/activate`),

   updateUserWallet: (id, addedBalance, plan) => apiCall('PUT', `/admin/users/${id}/wallet`, { addedBalance, plan }),

   // Statistics
   getStats: () => apiCall('GET', '/admin/stats'),

   getLogs: (limit = 50, offset = 0) => apiCall('GET', `/admin/logs?limit=${limit}&offset=${offset}`),
};

// COMMENTS API
const commentsAPI = {
   create: (articleId, content) => apiCall('POST', `/comments/${articleId}`, { content }),

   getByArticle: (articleId) => apiCall('GET', `/comments/${articleId}`),

   delete: (commentId) => apiCall('DELETE', `/comments/${commentId}`),

   updateStatus: (commentId, status) => apiCall('PUT', `/comments/${commentId}/status`, { status }),

   getMyComments: () => apiCall('GET', '/comments/my-comments'),

   getAll: () => apiCall('GET', '/comments'),
};

// BOOKMARKS API
const bookmarksAPI = {
   add: (articleId) => apiCall('POST', `/bookmarks/${articleId}`),

   getAll: () => apiCall('GET', '/bookmarks'),

   delete: (articleId) => apiCall('DELETE', `/bookmarks/${articleId}`),
};

// NOTIFICATIONS API
const notificationsAPI = {
   getAll: () => apiCall('GET', '/notifications'),

   readAll: () => apiCall('PUT', '/notifications/read-all'),

   markAsRead: (id) => apiCall('PUT', `/notifications/${id}/read`),
};

// RECOMMENDATION API
const recommendationAPI = {
   trackRead: (articleId, category) =>
      apiCall('POST', '/recommendations/track-read', { articleId, category }),

   like: (articleId, category) =>
      apiCall('POST', `/recommendations/${articleId}/like`, { category }),

   unlike: (articleId) =>
      apiCall('DELETE', `/recommendations/${articleId}/like`),

   getLikeStatus: (articleId) =>
      apiCall('GET', `/recommendations/${articleId}/like-status`),

   getRecommendations: (limit = 12) => apiCall('GET', `/recommendations/recommendations?limit=${limit}`),
   getPopular: (limit = 12) => apiCall('GET', `/recommendations/popular?limit=${limit}`),
   getDaily: (limit = 6) => apiCall('GET', `/recommendations/daily?limit=${limit}`),
   trackRead: (articleId, category) => apiCall('POST', '/recommendations/track-read', { articleId, category }),

   getPreferences: () =>
      apiCall('GET', '/recommendations/preferences'),
};

export {
   tokenStorage,
   authAPI,
   articlesAPI,
   authorAPI,
   editorAPI,
   adminAPI,
   commentsAPI,
   bookmarksAPI,
   notificationsAPI,
   recommendationAPI,
   apiCall,
};

