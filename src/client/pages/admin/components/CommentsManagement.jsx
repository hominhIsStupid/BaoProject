import React, { useState } from 'react';
import styles from '../AdminDashboard.module.css';

export default function CommentsManagement({ comments, onDelete, onUpdateStatus }) {
   const [search, setSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState('reported'); // Default to reported

   const filtered = comments.filter((c) => {
      const matchSearch =
         c.content.toLowerCase().includes(search.toLowerCase()) ||
         (c.userName && c.userName.toLowerCase().includes(search.toLowerCase())) ||
         (c.articleTitle && c.articleTitle.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
         statusFilter === 'all' || (statusFilter === 'reported' ? c.status === 'reported' : c.status !== 'reported');

      return matchSearch && matchStatus;
   });

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Bình Luận</h1>
         <div className={styles.tableControls} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
               type="text"
               placeholder="Tìm theo nội dung, người gửi hoặc bài viết..."
               className={styles.searchInput}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               style={{ flex: 1, minWidth: '200px' }}
            />
            <select
               className={styles.filterSelect}
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
            >
               <option value="reported">Bị báo cáo (Cần xử lý)</option>
               <option value="approved">Đã duyệt / Bình thường</option>
               <option value="all">Tất cả bình luận</option>
            </select>
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
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  {statusFilter === 'reported'
                     ? 'Tốt quá! Không có bình luận nào bị báo cáo.'
                     : 'Không tìm thấy bình luận nào.'}
               </div>
            ) : (
               filtered.map((comment) => (
                  <div key={comment.id} className={styles.tableRow} style={{ alignItems: 'center' }}>
                     <span className={styles.title}>
                        {comment.userName || 'Ẩn danh'}
                        <br />
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{comment.userEmail}</span>
                     </span>
                     <span>{comment.articleTitle || 'Bài viết'}</span>
                     <span
                        style={{
                           fontStyle: 'italic',
                           textOverflow: 'ellipsis',
                           overflow: 'hidden',
                           whiteSpace: 'nowrap',
                           maxWidth: '300px',
                           color: comment.status === 'reported' ? '#ff4757' : 'inherit',
                        }}
                     >
                        "{comment.content}"
                     </span>
                     <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                     <span className={styles.actions} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {comment.status === 'reported' && (
                           <>
                              <button
                                 className={styles.actionBtn}
                                 style={{
                                    background: '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                 }}
                                 onClick={() => onUpdateStatus(comment.id, 'approved')}
                                 title="Bỏ qua báo cáo, giữ lại bình luận"
                              >
                                 ✅ Bỏ qua
                              </button>
                           </>
                        )}
                        <button
                           className={styles.btnSmallDanger}
                           onClick={() => onDelete(comment.id)}
                           title="Xóa vĩnh viễn bình luận này"
                        >
                           🗑️ Xóa
                        </button>
                     </span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}
