import React from 'react';
import { Link } from 'react-router-dom';
import { CatBadge } from './CatBadge';
import { TimeAgo } from './TimeAgo';
import styles from '../pages/HomePage.module.css';

export function HorizontalSection({ title, icon, slug, articles, accentColor }) {
   if (!articles || articles.length === 0) return null;

   return (
      <div className={styles.horizSection}>
         <div className={styles.sectionHead}>
            <div className={styles.sectionHeadLeft}>
               <span className={styles.sectionIcon}>{icon}</span>
               <h2 className={styles.sectionName}>{title}</h2>
            </div>
            <Link to={`/category/${slug}`} className={styles.viewAll} id={`btn-view-all-${slug}`}>
               Xem tất cả →
            </Link>
         </div>
         <div className={styles.horizGrid}>
            {articles.slice(0, 4).map((article) => (
               <Link key={article.id} to={`/article/${article.id}`} className={styles.horizCard}>
                  <div className={styles.horizImgWrap}>
                     <img
                        src={article.image || 'https://via.placeholder.com/400x250?text=No+Image'}
                        alt={article.title}
                        className={styles.horizImg}
                        loading="lazy"
                     />
                     <CatBadge categoryId={article.category} small />
                  </div>
                  <div className={styles.horizContent}>
                     <h3 className={styles.horizTitle}>{article.title}</h3>
                     <p className={styles.horizExcerpt}>{article.excerpt}</p>
                     <TimeAgo date={article.publishedAt || article.createdAt} />
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
}
