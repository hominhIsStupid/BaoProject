import React from 'react';
import { getTimeAgo } from '../utils/formatTime';
import styles from '../pages/HomePage.module.css'; // Or a separate module

export function TimeAgo({ date }) {
   return (
      <span className={styles.timeAgo}>
         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
         </svg>
         {getTimeAgo(date)}
      </span>
   );
}
