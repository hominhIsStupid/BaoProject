import React from 'react';
import { CATEGORY_MAP } from '../constant/global';
import styles from '../pages/HomePage.module.css';

export function CatBadge({ categoryId, small = false }) {
   const cat = CATEGORY_MAP[categoryId] || { name: categoryId, color: '#888' };
   return (
      <span className={`${styles.catBadge} ${small ? styles.catBadgeSmall : ''}`} style={{ background: cat.color }}>
         {cat.name}
      </span>
   );
}
