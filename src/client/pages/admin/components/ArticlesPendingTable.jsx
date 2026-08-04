import React from 'react';
import styles from '../AdminDashboard.module.css';

export default function ArticlesPendingTable({ articles, onPublish }) {
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
                        <button className={styles.btnSmallApprove} onClick={() => onPublish(article.id)}>
                           ✅ Duyệt & Xuất bản
                        </button>
                     </span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}
