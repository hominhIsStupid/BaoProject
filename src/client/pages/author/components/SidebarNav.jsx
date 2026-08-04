import React from 'react';
import styles from '../AuthorDashboard.module.css';

const getAuthorMenu = (draftCount, pendingCount, publishedCount) => [
   { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
   { id: 'write', label: 'Tạo bài viết', icon: '✍️' },
   { id: 'drafts', label: `Nháp (${draftCount})`, icon: '📝' },
   { id: 'pending', label: `Đang chờ duyệt (${pendingCount})`, icon: '⏳' },
   { id: 'published', label: `Đã đăng (${publishedCount})`, icon: '✅' },
   { id: 'earnings', label: 'Thu nhập', icon: '💰' },
   { id: 'profile', label: 'Hồ sơ cá nhân', icon: '👤' },
];

export default function SidebarNav({ activeTab, onTabChange, draftCount = 0, pendingCount = 0, publishedCount = 0 }) {
   const menu = getAuthorMenu(draftCount, pendingCount, publishedCount);
   return (
      <aside className={styles.sidebar}>
         <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLogo}>RỒNG VÀNG</span>
            <span className={styles.sidebarSub}>— TÁC GIẢ —</span>
         </div>
         <nav className={styles.sidebarNav}>
            {menu.map((item) => (
               <button
                  key={item.id}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                  onClick={() => onTabChange(item.id)}
               >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
               </button>
            ))}
         </nav>
      </aside>
   );
}
