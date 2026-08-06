import React, { useState } from 'react';
import styles from '../AdminDashboard.module.css';
import { adminAPI, articlesAPI } from '../../../utils/api';

export default function ArticlesManagementTable({ articles, onDelete, onRefresh }) {
   const [filter, setFilter] = useState('all');
   const [search, setSearch] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('all');
   const [dateFilter, setDateFilter] = useState('');
   const [sortBy, setSortBy] = useState('newest');

   const [editingArticle, setEditingArticle] = useState(null);
   const [loadingEdit, setLoadingEdit] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);

   const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));

   const handleEditClick = async (article) => {
      setLoadingEdit(true);
      try {
         const fullArticle = await articlesAPI.getById(article.id);
         setEditingArticle(fullArticle);
      } catch (err) {
         console.error('Failed to load full article:', err);
         setEditingArticle(article); // fallback
      } finally {
         setLoadingEdit(false);
      }
   };

   const handleSave = async (e) => {
      e.preventDefault();
      try {
         await adminAPI.updateArticle(editingArticle.id, editingArticle);
         alert('Cập nhật bài viết thành công!');
         setEditingArticle(null);
         if (onRefresh) onRefresh();
      } catch (err) {
         alert('Lỗi: ' + err.message);
      }
   };

   let filtered = articles.filter((a) => {
      const matchFilter = filter === 'all' || a.status === filter;
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || a.category === categoryFilter;
      const matchDate =
         !dateFilter || (a.createdAt && new Date(a.createdAt).toISOString().split('T')[0] === dateFilter);
      return matchFilter && matchSearch && matchCategory && matchDate;
   });

   if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
   } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
   } else if (sortBy === 'most_views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
   } else if (sortBy === 'least_views') {
      filtered.sort((a, b) => (a.views || 0) - (b.views || 0));
   }

   const totalPages = Math.ceil(filtered.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const currentArticles = filtered.slice(startIndex, startIndex + itemsPerPage);

   const gridCols = '80px 2fr 120px 100px 90px 150px 180px';

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Toàn Bộ Bài Viết</h1>
         <div className={styles.tableControls} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <input
               type="text"
               placeholder="Tìm kiếm bài viết..."
               className={styles.searchInput}
               value={search}
               onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
               }}
               style={{ flex: 1, minWidth: '200px' }}
            />
            <select
               className={styles.filterSelect}
               value={filter}
               onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
               }}
            >
               <option value="all">Trạng thái (Tất cả)</option>
               <option value="draft">Nháp</option>
               <option value="pending">Chờ duyệt</option>
               <option value="approved">Chờ đăng</option>
               <option value="published">Đã đăng</option>
            </select>
            <select
               className={styles.filterSelect}
               value={categoryFilter}
               onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
               }}
            >
               <option value="all">Chuyên mục (Tất cả)</option>
               {categories.map((c) => (
                  <option key={c} value={c}>
                     {c}
                  </option>
               ))}
            </select>
            <input
               type="date"
               className={styles.filterSelect}
               value={dateFilter}
               onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
               }}
               style={{
                  background: '#1c1c1c',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
               }}
            />
            <select
               className={styles.filterSelect}
               value={sortBy}
               onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
               }}
            >
               <option value="newest">Mới nhất</option>
               <option value="oldest">Cũ nhất</option>
               <option value="most_views">Xem nhiều nhất</option>
               <option value="least_views">Xem ít nhất</option>
            </select>
         </div>

         <div className={styles.articlesTable}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: gridCols }}>
               <span>ID</span>
               <span>Tiêu đề</span>
               <span>Chuyên mục</span>
               <span>Trạng thái</span>
               <span>Lượt xem</span>
               <span>Ngày giờ đăng</span>
               <span>Hành động</span>
            </div>
            {currentArticles.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không tìm thấy bài viết nào.</div>
            ) : (
               currentArticles.map((article) => (
                  <div
                     key={article.id}
                     className={styles.tableRow}
                     style={{ gridTemplateColumns: gridCols, alignItems: 'center' }}
                  >
                     <span>#{article.id.substring(0, 8)}</span>
                     <span className={styles.title}>{article.title}</span>
                     <span>{article.category}</span>
                     <span>
                        <span
                           className={`${styles.statusBadge} ${(article.status === 'published' || article.status === 'approved') ? styles.statusApproved : ''}`}
                        >
                           {article.status.toUpperCase()}
                        </span>
                     </span>
                     <span>👁️ {article.views || 0}</span>
                     <span style={{ fontSize: '0.85rem' }}>
                        {article.createdAt ? new Date(article.createdAt).toLocaleString('vi-VN') : '---'}
                     </span>
                     <span className={styles.actions} style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <button
                           className={styles.actionBtn}
                           style={{
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                           }}
                           onClick={() => window.open(`/article/${article.id}`, '_blank')}
                        >
                           👁️ Xem
                        </button>
                        <button
                           className={styles.actionBtn}
                           style={{
                              background: 'var(--gold-primary)',
                              color: '#000',
                              border: 'none',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                           }}
                           onClick={() => handleEditClick(article)}
                        >
                           {loadingEdit ? '⏳...' : '✏️ Sửa'}
                        </button>
                        <button className={styles.btnSmallDanger} onClick={() => onDelete(article.id)}>
                           🗑️ Xóa
                        </button>
                     </span>
                  </div>
               ))
            )}
         </div>

         <div
            style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginTop: '1rem',
               padding: '1rem',
               background: '#1c1c1c',
               borderRadius: '8px',
            }}
         >
            <div>
               <span style={{ color: '#aaa', marginRight: '0.5rem' }}>Hiển thị:</span>
               <select
                  value={itemsPerPage}
                  onChange={(e) => {
                     setItemsPerPage(Number(e.target.value));
                     setCurrentPage(1);
                  }}
                  style={{
                     background: '#333',
                     color: '#fff',
                     border: '1px solid #444',
                     padding: '0.3rem',
                     borderRadius: '4px',
                  }}
               >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
               </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
               <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  style={{
                     background: currentPage === 1 ? '#333' : 'var(--gold-primary)',
                     color: currentPage === 1 ? '#666' : '#000',
                     border: 'none',
                     padding: '0.4rem 0.8rem',
                     borderRadius: '4px',
                     cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
               >
                  Trước
               </button>
               <span style={{ color: '#fff' }}>
                  Trang {currentPage} / {totalPages || 1}
               </span>
               <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  style={{
                     background: currentPage >= totalPages ? '#333' : 'var(--gold-primary)',
                     color: currentPage >= totalPages ? '#666' : '#000',
                     border: 'none',
                     padding: '0.4rem 0.8rem',
                     borderRadius: '4px',
                     cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  }}
               >
                  Sau
               </button>
            </div>
         </div>

         {editingArticle && (
            <div
               style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.8)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
               }}
            >
               <div
                  style={{
                     background: 'var(--bg-secondary)',
                     padding: '2rem',
                     borderRadius: '8px',
                     width: '90%',
                     maxWidth: '800px',
                     maxHeight: '90vh',
                     overflowY: 'auto',
                  }}
               >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                     <h3 style={{ color: 'var(--gold-primary)' }}>Sửa bài viết</h3>
                     <button
                        onClick={() => setEditingArticle(null)}
                        style={{
                           background: 'transparent',
                           border: 'none',
                           color: '#fff',
                           fontSize: '1.5rem',
                           cursor: 'pointer',
                        }}
                     >
                        &times;
                     </button>
                  </div>
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                           Tiêu đề
                        </label>
                        <input
                           required
                           placeholder="Tiêu đề"
                           value={editingArticle.title}
                           onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                           style={{
                              width: '100%',
                              padding: '0.8rem',
                              background: 'var(--bg-primary)',
                              color: '#fff',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '4px',
                           }}
                        />
                     </div>

                     <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                           Tóm tắt
                        </label>
                        <textarea
                           required
                           placeholder="Tóm tắt"
                           value={editingArticle.excerpt || ''}
                           onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                           style={{
                              width: '100%',
                              padding: '0.8rem',
                              background: 'var(--bg-primary)',
                              color: '#fff',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '4px',
                              minHeight: '80px',
                           }}
                        />
                     </div>

                     <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                           Nội dung HTML
                        </label>
                        <textarea
                           required
                           placeholder="Nội dung HTML"
                           value={editingArticle.content || ''}
                           onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                           style={{
                              width: '100%',
                              padding: '0.8rem',
                              background: 'var(--bg-primary)',
                              color: '#fff',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '4px',
                              minHeight: '200px',
                           }}
                        />
                     </div>

                     <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                           Trạng thái
                        </label>
                        <select
                           value={editingArticle.status || 'draft'}
                           onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value })}
                           style={{
                              width: '100%',
                              padding: '0.8rem',
                              background: 'var(--bg-primary)',
                              color: '#fff',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '4px',
                           }}
                        >
                           <option value="draft">Bản nháp (draft)</option>
                           <option value="pending">Chờ duyệt (pending)</option>
                           <option value="approved">Đã duyệt (approved)</option>
                           <option value="rejected">Từ chối (rejected)</option>
                           <option value="published">Xuất bản (published)</option>
                        </select>
                     </div>

                     <button
                        type="submit"
                        style={{
                           marginTop: '1rem',
                           padding: '1rem',
                           background: '#10b981',
                           color: '#fff',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '1.2rem',
                           fontWeight: 'bold',
                           cursor: 'pointer',
                           boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                           transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseOver={(e) => {
                           e.currentTarget.style.transform = 'translateY(-2px)';
                           e.currentTarget.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseOut={(e) => {
                           e.currentTarget.style.transform = 'none';
                           e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
                        }}
                     >
                        💾 Lưu Thay Đổi
                     </button>
                  </form>
               </div>
            </div>
         )}
      </section>
   );
}
