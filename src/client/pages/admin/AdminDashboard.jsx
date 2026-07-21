import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { adminAPI, commentsAPI, tokenStorage } from '../../../utils/api';

function SidebarNav({ activeTab, onTabChange, pendingCount = 0, approvedCount = 0 }) {
   const menu = [
      { id: 'dashboard', label: 'Bảng điều khiển', icon: '📊' },
      { id: 'articles-pending', label: 'Bài chờ duyệt', icon: '📋', badge: pendingCount },
      { id: 'articles-approved', label: 'Bài chờ xuất bản', icon: '✅', badge: approvedCount },
      { id: 'articles-manage', label: 'Quản lý bài viết', icon: '📝' },
      { id: 'categories-manage', label: 'Quản lý chuyên mục', icon: '📂' },
      { id: 'comments-manage', label: 'Quản lý bình luận', icon: '💬' },
      { id: 'users-manage', label: 'Quản lý người dùng', icon: '👥' },
      { id: 'research-manage', label: 'Nghiên cứu khoa học', icon: '🔬' },
      { id: 'logs', label: 'Nhật ký hệ thống', icon: '📜' },
      { id: 'settings', label: 'Cài đặt hệ thống', icon: '⚙️' },
   ];
   return (
      <aside className={styles.sidebar}>
         <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLogo}>RỒNG VÀNG</span>
            <span className={styles.sidebarSub}>— QUẢN TRỊ —</span>
         </div>
         <nav className={styles.sidebarNav}>
            {menu.map((item) => (
               <button
                  key={item.id}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                  onClick={() => onTabChange(item.id)}
               >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge > 0 && <span className={styles.navBadge}>{item.badge}</span>}
               </button>
            ))}
         </nav>
      </aside>
   );
}

function DashboardOverview({ stats }) {
   return (
      <section className={styles.dashboardSection}>
         <h1>Bảng Điều Khiển Quản Trị</h1>
         <div className={styles.statsGrid}>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>📰</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Tổng bài viết</div>
                  <div className={styles.statValue}>{stats?.totalArticles || 0}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>✅</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Đã xuất bản</div>
                  <div className={styles.statValue}>{stats?.publishedArticles || 0}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>⏳</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Đang chờ duyệt</div>
                  <div className={styles.statValue}>{stats?.pendingArticles || 0}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>👥</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Tổng người dùng</div>
                  <div className={styles.statValue}>{stats?.totalUsers || 0}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>✍️</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Tác giả</div>
                  <div className={styles.statValue}>{stats?.totalAuthors || 0}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>✏️</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Biên tập viên</div>
                  <div className={styles.statValue}>{stats?.totalEditors || 0}</div>
               </div>
            </div>
         </div>
      </section>
   );
}

function ArticlesPendingTable({ articles, onPublish }) {
   return (
      <section className={styles.managementSection}>
         <h1>Bài Viết Chờ Biên Tập Duyệt</h1>
         <div className={styles.articlesTable}>
            <div className={styles.tableHeader}>
               <span>ID</span>
               <span>Tiêu đề</span>
               <span>Tác giả</span>
               <span>Ngày tạo</span>
               <span>Hành động</span>
            </div>
            {articles.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không có bài viết chờ duyệt.</div>
            ) : (
               articles.map((article) => (
                  <div key={article.id} className={styles.tableRow}>
                     <span>#{article.id.substring(0, 8)}...</span>
                     <span className={styles.title}>{article.title}</span>
                     <span>{article.authorName || article.author || 'Tác giả'}</span>
                     <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                     <span className={styles.actions}>
                        <button className={styles.btnSmallApprove} onClick={() => onPublish(article.id)}>✅ Duyệt & Xuất bản</button>
                     </span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}

function ArticlesApprovedTable({ articles, onPublish }) {
   return (
      <section className={styles.managementSection}>
         <h1>Bài Viết Chờ Xuất Bản</h1>
         <div className={styles.articlesTable}>
            <div className={styles.tableHeader}>
               <span>ID</span>
               <span>Tiêu đề</span>
               <span>Tác giả</span>
               <span>Ngày duyệt</span>
               <span>Hành động</span>
            </div>
            {articles.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không có bài viết chờ xuất bản.</div>
            ) : (
               articles.map((article) => (
                  <div key={article.id} className={styles.tableRow}>
                     <span>#{article.id.substring(0, 8)}...</span>
                     <span className={styles.title}>{article.title}</span>
                     <span>{article.authorName || article.author || 'Tác giả'}</span>
                     <span>{new Date(article.updatedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                     <span className={styles.actions}>
                        <button className={styles.btnSmallApprove} onClick={() => onPublish(article.id)}>📰 Xuất bản ngay</button>
                     </span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}

function ArticlesManagementTable({ articles, onDelete }) {
   const [filter, setFilter] = useState('all');
   const [search, setSearch] = useState('');

   const filtered = articles.filter((a) => {
      const matchFilter = filter === 'all' || a.status === filter;
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
   });

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Toàn Bộ Bài Viết</h1>
         <div className={styles.tableControls}>
            <input 
               type="text" 
               placeholder="Tìm kiếm bài viết..." 
               className={styles.searchInput} 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
               <option value="all">Tất cả trạng thái</option>
               <option value="draft">Nháp</option>
               <option value="pending">Chờ duyệt</option>
               <option value="approved">Chờ đăng</option>
               <option value="published">Đã đăng</option>
            </select>
         </div>

         <div className={styles.articlesTable}>
            <div className={styles.tableHeader}>
               <span>ID</span>
               <span>Tiêu đề</span>
               <span>Chuyên mục</span>
               <span>Trạng thái</span>
               <span>Lượt xem</span>
               <span>Hành động</span>
            </div>
            {filtered.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không tìm thấy bài viết nào.</div>
            ) : (
               filtered.map((article) => (
                  <div key={article.id} className={styles.tableRow}>
                     <span>#{article.id.substring(0, 8)}</span>
                     <span className={styles.title}>{article.title}</span>
                     <span>{article.category}</span>
                     <span>
                        <span className={`${styles.statusBadge} ${article.status === 'published' ? styles.statusApproved : ''}`}>
                           {article.status.toUpperCase()}
                        </span>
                     </span>
                     <span>👁️ {article.views || 0}</span>
                     <span className={styles.actions}>
                        <button className={styles.btnSmallDanger} onClick={() => onDelete(article.id)}>🗑️ Xóa</button>
                     </span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}

function CategoriesManagement({ categories, onCreate, onDelete }) {
   const [name, setName] = useState('');
   const [slug, setSlug] = useState('');
   const [color, setColor] = useState('#D4AF37');

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!name || !slug) return;
      onCreate({ name, slug, color });
      setName('');
      setSlug('');
   };

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Chuyên Mục</h1>
         <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', background: '#141414', padding: '1rem', borderRadius: '4px', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Tên chuyên mục..." value={name} onChange={(e) => setName(e.target.value)} required className={styles.settingInput} style={{ flex: 1, minWidth: '150px' }} />
            <input type="text" placeholder="Slug (ví dụ: thoisu)..." value={slug} onChange={(e) => setSlug(e.target.value)} required className={styles.settingInput} style={{ flex: 1, minWidth: '150px' }} />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
            <button type="submit" className={styles.btnPrimary} style={{ height: '40px' }}>➕ Thêm</button>
         </form>

         <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
               <div key={cat.id} className={styles.categoryCard}>
                  <div className={styles.categoryColor} style={{ backgroundColor: cat.color || '#D4AF37' }} />
                  <h3>{cat.name}</h3>
                  <p>Slug: <code>{cat.slug}</code></p>
                  <div className={styles.categoryActions}>
                     <button className={styles.btnSmallDanger} onClick={() => onDelete(cat.id)}>Xóa</button>
                  </div>
               </div>
            ))}
         </div>
      </section>
   );
}

function CommentsManagement({ comments, onDelete }) {
   const [search, setSearch] = useState('');

   const filtered = comments.filter((c) =>
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.userName && c.userName.toLowerCase().includes(search.toLowerCase())) ||
      (c.articleTitle && c.articleTitle.toLowerCase().includes(search.toLowerCase()))
   );

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Bình Luận Độc Giả</h1>
         <div className={styles.tableControls}>
            <input 
               type="text" 
               placeholder="Tìm theo nội dung, người gửi hoặc bài viết..." 
               className={styles.searchInput} 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className={styles.articlesTable}>
            <div className={styles.tableHeader}>
               <span>Người gửi</span>
               <span>Bài viết</span>
               <span>Nội dung bình luận</span>
               <span>Ngày gửi</span>
               <span>Hành động</span>
            </div>
            {filtered.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không tìm thấy bình luận nào.</div>
            ) : (
               filtered.map((comment) => (
                  <div key={comment.id} className={styles.tableRow}>
                     <span className={styles.title}>
                        {comment.userName || 'Ẩn danh'}
                        <br/>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{comment.userEmail}</span>
                     </span>
                     <span>{comment.articleTitle || 'Bài viết'}</span>
                     <span style={{ fontStyle: 'italic', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                        "{comment.content}"
                     </span>
                     <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                     <span className={styles.actions}>
                        <button className={styles.btnSmallDanger} onClick={() => onDelete(comment.id)}>🗑️ Xóa</button>
                     </span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}

function UsersManagement({ users, onUpdateRole, onSuspend, onActivate, onUpdateWallet }) {
   const [search, setSearch] = useState('');
   const [walletModalUserId, setWalletModalUserId] = useState(null);
   const [walletForm, setWalletForm] = useState({ balanceAdd: '', newPlan: 'none' });

   const filtered = users.filter((u) => 
      u.email.toLowerCase().includes(search.toLowerCase()) || 
      (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
   );

   const formatMoney = (amount) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
   };

   const openWalletModal = (user) => {
      setWalletModalUserId(user.id);
      setWalletForm({ balanceAdd: '', newPlan: user.plan || 'none' });
   };

   const handleWalletSubmit = (e) => {
      e.preventDefault();
      onUpdateWallet(walletModalUserId, Number(walletForm.balanceAdd) || 0, walletForm.newPlan);
      setWalletModalUserId(null);
   };

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Tài Khoản Thành Viên</h1>
         <div className={styles.tableControls}>
            <input 
               type="text" 
               placeholder="Tìm kiếm theo tên hoặc email..." 
               className={styles.searchInput} 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className={styles.articlesTable} style={{ overflowX: 'auto' }}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1.2fr 1fr 1.5fr' }}>
               <span>Tên thành viên</span>
               <span>Email</span>
               <span>Vai trò</span>
               <span>Số dư & Gói</span>
               <span>Trạng thái</span>
               <span>Hành động</span>
            </div>
            {filtered.map((user) => (
               <div key={user.id} className={styles.tableRow} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1.2fr 1fr 1.5fr', alignItems: 'center' }}>
                  <span className={styles.title}>{user.fullName || 'Chưa đặt tên'}</span>
                  <span>{user.email}</span>
                  <span>
                     <select 
                        value={user.role} 
                        onChange={(e) => onUpdateRole(user.id, e.target.value)}
                        style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '3px', outline: 'none' }}
                     >
                        <option value="guest">Guest</option>
                        <option value="author">Author</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                     </select>
                  </span>
                  <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                     <div style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>{formatMoney(user.balance)}</div>
                     <div style={{ color: 'var(--text-muted)' }}>Gói: <strong style={{color: 'var(--text-primary)', textTransform: 'uppercase'}}>{user.plan || 'Không'}</strong></div>
                  </span>
                  <span>
                     <span style={{ color: user.status === 'suspended' ? '#ff4757' : '#2ed573' }}>
                        {user.status === 'suspended' ? '🚫 Khóa' : '✅ Active'}
                     </span>
                  </span>
                  <span className={styles.actions} style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                     <button className={styles.btnSmall} onClick={() => openWalletModal(user)}>💳 Ví & Gói</button>
                     {user.status === 'suspended' ? (
                        <button className={styles.btnSmall} onClick={() => onActivate(user.id)}>🔓</button>
                     ) : (
                        <button className={styles.btnSmallDanger} onClick={() => onSuspend(user.id)}>🚫</button>
                     )}
                  </span>
               </div>
            ))}
         </div>

         {/* WALLET MODAL */}
         {walletModalUserId && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid var(--gold-primary)' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--gold-primary)' }}>Cập nhật Ví & Gói Premium</h3>
                  <form onSubmit={handleWalletSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cộng/trừ số dư (VNĐ):</label>
                        <input 
                           type="number" 
                           value={walletForm.balanceAdd}
                           onChange={(e) => setWalletForm({...walletForm, balanceAdd: e.target.value})}
                           placeholder="Ví dụ: 100000 hoặc -50000"
                           style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bg-border)', background: 'var(--bg-secondary)', color: '#fff' }}
                        />
                     </div>
                     <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nâng cấp / Thay đổi gói:</label>
                        <select 
                           value={walletForm.newPlan}
                           onChange={(e) => setWalletForm({...walletForm, newPlan: e.target.value})}
                           style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bg-border)', background: 'var(--bg-secondary)', color: '#fff' }}
                        >
                           <option value="none">Hủy gói / Không có gói</option>
                           <option value="v1">Gói V1 (2 bài/ngày, 30 bài/tháng)</option>
                           <option value="v2">Gói V2 (4 bài/ngày, 60 bài/tháng)</option>
                           <option value="pro">Gói PRO (Không giới hạn)</option>
                        </select>
                     </div>
                     <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setWalletModalUserId(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--bg-border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>Hủy</button>
                        <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--gold-primary)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu thay đổi</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </section>
   );
}

function SystemLogs({ logs }) {
   return (
      <section className={styles.managementSection}>
         <h1>Nhật Ký Hoạt Động Hệ Thống</h1>
         <div className={styles.articlesTable}>
            <div className={styles.tableHeader}>
               <span>Thời gian</span>
               <span>Hành động</span>
               <span>Nội dung mô tả</span>
            </div>
            {logs.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không có log hoạt động nào.</div>
            ) : (
               logs.map((log) => (
                  <div key={log.id} className={styles.tableRow}>
                     <span>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                     <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{log.action}</span>
                     <span>{log.description}</span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}

function SystemSettings() {
   return (
      <section className={styles.settingsSection}>
         <h1>Cài Đặt Hệ Thống</h1>

         <div className={styles.settingsGroup}>
            <h2>Thông Tin Trang Tin</h2>
            <div className={styles.settingRow}>
               <label>Tên trang web:</label>
               <input type="text" defaultValue="Báo Rồng Vàng" className={styles.settingInput} readOnly />
            </div>
            <div className={styles.settingRow}>
               <label>Khẩu hiệu:</label>
               <input type="text" defaultValue="Thông tin trung thực - Kịp thời - Khách quan" className={styles.settingInput} readOnly />
            </div>
         </div>
         <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontStyle: 'italic' }}>Các thông số cấu hình hệ thống đang được quản trị tự động qua biến môi trường (.env).</p>
      </section>
   );
}

export default function AdminDashboard() {
   const [activeTab, setActiveTab] = useState('dashboard');
   const [articles, setArticles] = useState([]);
   const [categories, setCategories] = useState([]);
   const [users, setUsers] = useState([]);
   const [comments, setComments] = useState([]);
   const [logs, setLogs] = useState([]);
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);

   const fetchAdminData = async () => {
      setLoading(true);
      try {
         const [allArticles, allCategories, allUsers, allLogs, statsData, allComments] = await Promise.all([
            adminAPI.getAllArticles(200, 0),
            adminAPI.getCategories(),
            adminAPI.getUsers(200, 0),
            adminAPI.getLogs(50, 0),
            adminAPI.getStats(),
            commentsAPI.getAll()
         ]);
         setArticles(allArticles || []);
         setCategories(allCategories || []);
         setUsers(allUsers || []);
         setLogs(allLogs || []);
         setStats(statsData || null);
         setComments(allComments || []);
      } catch (err) {
         console.error('Failed to load admin dashboard data:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchAdminData();
   }, []);

   const handlePublish = async (id) => {
      if (!window.confirm('Bạn có muốn xuất bản bài viết này lên trang chủ công khai không?')) return;
      try {
         await adminAPI.publishArticle(id);
         alert('Đã xuất bản bài viết thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Xuất bản thất bại: ' + err.message);
      }
   };

   const handleDeleteArticle = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) return;
      try {
         await adminAPI.deleteArticle(id);
         alert('Đã xóa bài viết khỏi hệ thống!');
         fetchAdminData();
      } catch (err) {
         alert('Xóa bài viết thất bại: ' + err.message);
      }
   };

   const handleCreateCategory = async (catData) => {
      try {
         await adminAPI.createCategory(catData);
         alert('Đã tạo chuyên mục mới thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Tạo chuyên mục thất bại: ' + err.message);
      }
   };

   const handleDeleteCategory = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa chuyên mục này không?')) return;
      try {
         await adminAPI.deleteCategory(id);
         alert('Đã xóa chuyên mục thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Xóa chuyên mục thất bại: ' + err.message);
      }
   };

   const handleUpdateUserRole = async (userId, role) => {
      try {
         await adminAPI.updateUserRole(userId, role);
         alert('Đã cập nhật vai trò người dùng thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Cập nhật vai trò thất bại: ' + err.message);
      }
   };

   const handleSuspendUser = async (userId) => {
      try {
         await adminAPI.suspendUser(userId);
         alert('Đã khóa tài khoản thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Khóa tài khoản thất bại: ' + err.message);
      }
   };

   const handleActivateUser = async (userId) => {
      try {
         await adminAPI.activateUser(userId);
         alert('Đã mở khóa tài khoản thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Mở khóa tài khoản thất bại: ' + err.message);
      }
   };

   const handleUpdateWallet = async (userId, addedBalance, plan) => {
      try {
         await adminAPI.updateUserWallet(userId, addedBalance, plan);
         alert('Đã cập nhật Ví & Gói Premium thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Cập nhật ví thất bại: ' + err.message);
      }
   };

   const handleDeleteComment = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return;
      try {
         await commentsAPI.delete(id);
         alert('Đã xóa bình luận thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Xóa bình luận thất bại: ' + err.message);
      }
   };

   const pendingArticles = articles.filter((a) => a.status === 'pending');
   const approvedArticles = articles.filter((a) => a.status === 'approved');

   return (
      <div className={styles.adminDashboard}>
         <SidebarNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            pendingCount={pendingArticles.length}
            approvedCount={approvedArticles.length}
         />

         <main className={styles.mainContent}>
            {loading ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--gold-primary)' }}>
                  Đang tải dữ liệu hệ thống quản trị...
               </div>
            ) : (
               <>
                  {activeTab === 'dashboard' && <DashboardOverview stats={stats} />}
                  {activeTab === 'articles-pending' && <ArticlesPendingTable articles={pendingArticles} onPublish={handlePublish} />}
                  {activeTab === 'articles-approved' && <ArticlesApprovedTable articles={approvedArticles} onPublish={handlePublish} />}
                  {activeTab === 'articles-manage' && <ArticlesManagementTable articles={articles} onDelete={handleDeleteArticle} />}
                  {activeTab === 'categories-manage' && <CategoriesManagement categories={categories} onCreate={handleCreateCategory} onDelete={handleDeleteCategory} />}
                  {activeTab === 'comments-manage' && <CommentsManagement comments={comments} onDelete={handleDeleteComment} />}
                  {activeTab === 'users-manage' && <UsersManagement users={users} onUpdateRole={handleUpdateUserRole} onSuspend={handleSuspendUser} onActivate={handleActivateUser} onUpdateWallet={handleUpdateWallet} />}
                  {activeTab === 'research-manage' && <ResearchManagement />}
                  {activeTab === 'logs' && <SystemLogs logs={logs} />}
                  {activeTab === 'settings' && <SystemSettings />}
               </>
            )}
         </main>
      </div>
   );
}

// === RESEARCH MANAGEMENT COMPONENT ===
function ResearchManagement() {
   const [articles, setArticles] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);
   const [formData, setFormData] = useState({ id: null, title: '', summary: '', content: '', author: '', category: 'AI', thumbnail: '', readingTime: 5, price: 50000 });

   useEffect(() => {
      fetchArticles();
   }, []);

   const fetchArticles = async () => {
      setLoading(true);
      try {
         const res = await fetch('/api/research?limit=50');
         const data = await res.json();
         setArticles(data.articles || []);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleEditClick = async (article) => {
      try {
         const token = tokenStorage.get();
         // Pass mockRole=admin so the backend returns the full content regardless of purchase status
         const res = await fetch(`/api/research/${article.id}?mockRole=admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
            const fullArticle = await res.json();
            setFormData(fullArticle);
            setShowForm(true);
         } else {
            alert('Lỗi tải nội dung bài viết');
         }
      } catch (err) {
         alert('Lỗi kết nối');
      }
   };

   const handleSave = async (e) => {
      e.preventDefault();
      try {
         const method = formData.id ? 'PUT' : 'POST';
         const url = formData.id ? `/api/research/${formData.id}` : '/api/research';
         const token = tokenStorage.get();
         
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
         });
         
         if (res.ok) {
            alert('Lưu thành công!');
            setShowForm(false);
            fetchArticles();
         } else {
            const err = await res.json();
            alert('Lỗi: ' + err.message);
         }
      } catch (err) {
         alert('Lỗi kết nối');
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bài nghiên cứu này?')) return;
      try {
         const token = tokenStorage.get();
         const res = await fetch(`/api/research/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
            alert('Xóa thành công!');
            fetchArticles();
         }
      } catch (err) {
         alert('Lỗi kết nối');
      }
   };

   if (loading) return <div>Đang tải dữ liệu nghiên cứu...</div>;

   return (
      <section className={styles.managementSection}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1>Quản lý Nghiên cứu Khoa học</h1>
            <button 
               className={styles.actionBtn} 
               style={{ background: 'var(--gold-primary)', color: '#000' }}
               onClick={() => { setFormData({ id: null, title: '', summary: '', content: '', author: '', category: 'AI', thumbnail: '', readingTime: 5, price: 50000 }); setShowForm(true); }}
            >
               + Thêm bài mới
            </button>
         </div>

         {showForm && (
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
               <h3 style={{ marginBottom: '1rem', color: 'var(--gold-primary)' }}>{formData.id ? 'Sửa bài' : 'Thêm bài mới'}</h3>
               <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input required placeholder="Tiêu đề" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                  <input placeholder="Tác giả" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} style={{ padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }}>
                     {['AI', 'Công nghệ', 'Y học', 'Kinh tế', 'Giáo dục', 'Môi trường', 'Vật lý', 'Toán học'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="URL Thumbnail (Upload ảnh qua form ngoài hoặc dán URL)" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} style={{ padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <input type="number" placeholder="Thời gian đọc (phút)" value={formData.readingTime} onChange={e => setFormData({...formData, readingTime: e.target.value})} style={{ flex: 1, padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                     <input type="number" placeholder="Giá (VNĐ)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ flex: 1, padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                  </div>
                  <textarea required placeholder="Tóm tắt" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} rows="3" style={{ padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                  <textarea required placeholder="Nội dung chi tiết (HTML hỗ trợ)" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows="10" style={{ padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <button type="submit" style={{ padding: '0.8rem 2rem', background: 'var(--gold-primary)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Lưu</button>
                     <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.8rem 2rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
                  </div>
               </form>
            </div>
         )}

         <table className={styles.articlesTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
               <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Tiêu đề</th>
                  <th style={{ padding: '1rem' }}>Lĩnh vực</th>
                  <th style={{ padding: '1rem' }}>Tác giả</th>
                  <th style={{ padding: '1rem' }}>Thao tác</th>
               </tr>
            </thead>
            <tbody>
               {articles.map(article => (
                  <tr key={article.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <td style={{ padding: '1rem' }}>{article.title}</td>
                     <td style={{ padding: '1rem' }}>{article.category}</td>
                     <td style={{ padding: '1rem' }}>{article.author}</td>
                     <td style={{ padding: '1rem' }}>
                        <button onClick={() => handleEditClick(article)} style={{ background: 'transparent', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', padding: '0.3rem 0.8rem', borderRadius: '4px', marginRight: '0.5rem', cursor: 'pointer' }}>Sửa</button>
                        <button onClick={() => handleDelete(article.id)} style={{ background: 'transparent', border: '1px solid #ff4757', color: '#ff4757', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                     </td>
                  </tr>
               ))}
               {articles.length === 0 && <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>Chưa có bài nghiên cứu nào</td></tr>}
            </tbody>
         </table>
      </section>
   );
}
