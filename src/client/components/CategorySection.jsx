import React from 'react';
import { Link } from 'react-router-dom';
import { TimeAgo } from './TimeAgo';
import styles from '../pages/HomePage.module.css';

export function CategorySection({ title, icon, slug, articles, accentColor }) {
   if (!articles || articles.length === 0) return null;
   const featured = articles[0];
   const list = articles.slice(1, 4);

   return (
      <div className={styles.categorySection} style={{ '--section-accent': accentColor }}>
         <div className={styles.sectionHead}>
            <div className={styles.sectionHeadLeft}>
               <span className={styles.sectionIcon}>{icon}</span>
               <h2 className={styles.sectionName}>{title}</h2>
            </div>
            <Link to={`/category/${slug}`} className={styles.viewAll} id={`btn-view-all-${slug}`}>
               Xem tất cả →
            </Link>
         </div>
         <div className={styles.catSectionBody}>
            {/* Featured big card */}
            <Link to={`/article/${featured.id}`} className={styles.catFeatured} id={`${slug}-featured`}>
               <img
                  src={featured.image || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt={featured.title}
                  className={styles.catFeaturedImg}
                  loading="lazy"
               />
               <div className={styles.catFeaturedOverlay}>
                  <h3 className={styles.catFeaturedTitle}>{featured.title}</h3>
                  <p className={styles.catFeaturedExcerpt}>{featured.excerpt}</p>
                  <TimeAgo date={featured.publishedAt || featured.createdAt} />
               </div>
            </Link>
            {/* List of small articles */}
            {list.length > 0 && (
               <div className={styles.catList}>
                  {list.map((article) => (
                     <Link key={article.id} to={`/article/${article.id}`} className={styles.catListItem}>
                        <img
                           src={article.image || 'https://via.placeholder.com/150x100?text=No+Image'}
                           alt={article.title}
                           className={styles.catListImg}
                           loading="lazy"
                        />
                        <div className={styles.catListContent}>
                           <h4 className={styles.catListTitle}>{article.title}</h4>
                           <TimeAgo date={article.publishedAt || article.createdAt} />
                        </div>
                     </Link>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
