import React from 'react';
import styles from '../EditorDashboard.module.css';

export default function EditorDashboardOverview({
   stats,
   pendingArticles = [],
   approvedArticles = [],
   rejectedArticles = [],
   onTabChange,
}) {
   return (
      <section className={styles.dashboardSection}>
         <h1>Bảng Điều Khiển Biên Tập</h1>
         <div className={styles.statsGrid}>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>📋</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Chờ duyệt</div>
                  <div className={styles.statValue}>{pendingArticles.length}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>✅</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Bài đã duyệt</div>
                  <div className={styles.statValue}>{approvedArticles.length}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>❌</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Bị từ chối</div>
                  <div className={styles.statValue}>{rejectedArticles.length}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon}>📰</div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Bài đã duyệt (Lịch sử)</div>
                  <div className={styles.statValue}>{stats?.articlesReviewed || 0}</div>
               </div>
            </div>
         </div>

         <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
               <h2>Bài viết chờ duyệt mới nhất</h2>
               <button className={styles.btnViewAll} onClick={() => onTabChange && onTabChange('pending')}>
                  Xem tất cả
               </button>
            </div>
            <table className={styles.recentTable}>
               <thead>
                  <tr>
                     <th>MÃ BÀI</th>
                     <th>TIÊU ĐỀ</th>
                     <th>TÁC GIẢ</th>
                     <th>CHUYÊN MỤC</th>
                     <th>THỜI GIAN</th>
                     <th>TRẠNG THÁI</th>
                     <th>THAO TÁC</th>
                  </tr>
               </thead>
               <tbody>
                  {pendingArticles.slice(0, 5).map((article) => {
                     const authorName = article.authorName || article.author || 'Tác giả';
                     return (
                        <tr key={article.id}>
                           <td style={{ color: '#fff' }}>#{article.id.substring(0, 6)}</td>
                           <td style={{ color: '#fff', fontWeight: '500' }}>{article.title}</td>
                           <td>{authorName}</td>
                           <td>{article.category || 'Chung'}</td>
                           <td>{new Date(article.createdAt || article.date).toLocaleDateString('vi-VN')}</td>
                           <td>
                              <span
                                 style={{
                                    background: 'rgba(255, 152, 0, 0.2)',
                                    color: '#ff9800',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                 }}
                              >
                                 CHỜ DUYỆT
                              </span>
                           </td>
                           <td>
                              <button
                                 style={{
                                    background: 'transparent',
                                    border: '1px solid #444',
                                    color: '#ccc',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                 }}
                                 onClick={() => onTabChange && onTabChange('pending')}
                              >
                                 Xem xét
                              </button>
                           </td>
                        </tr>
                     );
                  })}
                  {pendingArticles.length === 0 && (
                     <tr>
                        <td colSpan="7" className={styles.recentEmpty}>
                           Không có bài viết nào đang chờ duyệt.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </section>
   );
}
