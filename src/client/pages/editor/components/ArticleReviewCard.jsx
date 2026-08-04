import React from 'react';
import styles from '../EditorDashboard.module.css';

export default function ArticleReviewCard({ article, onApprove, onReject, onSuggest }) {
   const imageUrl = article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600';
   const authorName = article.authorName || article.author || 'Tác giả';
   return (
      <div className={styles.reviewCard}>
         <div className={styles.reviewHeader}>
            <div className={styles.authorInfo}>
               <span className={styles.authorAvatar}>{authorName.charAt(0)}</span>
               <div>
                  <div className={styles.authorName}>{authorName}</div>
                  <div className={styles.submitDate}>
                     Ngày gửi: {new Date(article.createdAt || article.date).toLocaleDateString('vi-VN')}
                  </div>
               </div>
            </div>
            <span className={styles.categoryBadge}>{article.category}</span>
         </div>

         <h3 className={styles.reviewTitle}>{article.title}</h3>
         <p className={styles.reviewExcerpt}>{article.excerpt}</p>

         <div className={styles.reviewMeta}>
            <span>📖 {article.readTime || 5} phút đọc</span>
            <span>•</span>
            <span>
               Trạng thái: <strong style={{ color: 'var(--gold-primary)' }}>{article.status.toUpperCase()}</strong>
            </span>
         </div>

         <div className={styles.reviewContent} style={{ margin: '1rem 0' }}>
            {article.image && (
               <img
                  src={imageUrl}
                  alt={article.title}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
               />
            )}
            <div
               style={{
                  background: '#1c1c1c',
                  padding: '1rem',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#ccc',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  marginTop: '1rem',
                  whiteSpace: 'pre-wrap',
               }}
            >
               {article.content}
            </div>
         </div>

         <div className={styles.reviewActions}>
            <button className={styles.btnReject} onClick={() => onReject(article.id)}>
               ❌ Từ chối
            </button>
            <button className={styles.btnEdit} onClick={() => onSuggest(article.id)}>
               💬 Đề xuất sửa
            </button>
            <button className={styles.btnApprove} onClick={() => onApprove(article.id)}>
               ✅ Duyệt bài
            </button>
         </div>
      </div>
   );
}
