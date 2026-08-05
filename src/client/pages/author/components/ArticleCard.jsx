import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../AuthorDashboard.module.css';

export default function ArticleCard({ article, status = 'draft', onDelete, onSubmit, onEdit }) {
   const imageUrl = article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600';
   return (
      <div className={styles.articleCard}>
         <div className={styles.cardThumb}>
            <img src={imageUrl} alt={article.title} />
            <span className={`${styles.cardBadge} ${styles[`badge${status}`]}`}>
               {status === 'draft'
                  ? 'Nháp'
                  : status === 'pending'
                    ? 'Chờ duyệt'
                    : status === 'rejected'
                      ? 'Bị từ chối'
                      : 'Đã đăng'}
            </span>
         </div>
         <div className={styles.cardBody}>
            <Link to={`/article/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
               <h3 className={styles.cardTitle}>{article.title}</h3>
            </Link>
            <p className={styles.cardExcerpt}>{article.excerpt}</p>
            <div className={styles.cardMeta}>
               <span>Chuyên mục: {article.category}</span>
               <span>•</span>
               <span>👁️ {article.views || 0} lượt xem</span>
            </div>
            {status === 'rejected' && article.rejectionReason && (
               <div
                  style={{
                     fontSize: '0.75rem',
                     color: '#ff6b6b',
                     marginTop: '0.5rem',
                     background: 'rgba(255,107,107,0.1)',
                     padding: '0.4rem',
                     borderRadius: '3px',
                  }}
               >
                  <strong>Lý do từ chối:</strong> {article.rejectionReason}
               </div>
            )}
            <div className={styles.cardActions} style={{ marginTop: '1rem' }}>
               {(status === 'draft' || status === 'rejected') && onEdit && (
                  <button className={styles.btnSmallGhost} onClick={() => onEdit(article)}>
                     ✏️ Sửa
                  </button>
               )}
               {(status === 'draft' || status === 'rejected') && onSubmit && (
                  <button className={styles.btnSmall} onClick={() => onSubmit(article.id)}>
                     🚀 {status === 'rejected' ? 'Gửi duyệt lại' : 'Gửi duyệt'}
                  </button>
               )}
               {(status === 'draft' || status === 'rejected') && onDelete && (
                  <button className={styles.btnSmallGhost} onClick={() => onDelete(article.id)}>
                     🗑️ Xóa
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
