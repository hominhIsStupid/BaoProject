import React from 'react';
import styles from '../AdminDashboard.module.css';

export default function ArticlesApprovedTable({ articles, onPublish }) {
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
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  Không có bài viết chờ xuất bản.
               </div>
            ) : (
               articles.map((article) => (
                  <div key={article.id} className={styles.tableRow}>
                     <span>#{article.id.substring(0, 8)}...</span>
                     <span className={styles.title}>{article.title}</span>
                     <span>{article.authorName || article.author || 'Tác giả'}</span>
                     <span>{new Date(article.updatedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                     <span className={styles.actions}>
                        <button className={styles.btnSmallApprove} onClick={() => onPublish(article.id)}>
                           📰 Xuất bản ngay
                        </button>
                     </span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}
