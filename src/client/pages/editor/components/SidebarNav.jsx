import React from 'react';
import styles from '../EditorDashboard.module.css';

export default function SidebarNav({ activeTab, onTabChange, pendingCount = 0, approvedCount = 0, rejectedCount = 0 }) {
   const menu = [
      { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
      { id: 'pending', label: 'Bài chờ duyệt', icon: '📋', badge: pendingCount },
      { id: 'approved', label: 'Bài đã duyệt', icon: '✅', badge: approvedCount },
      { id: 'rejected', label: 'Bài từ chối', icon: '❌', badge: rejectedCount },
      { id: 'guidelines', label: 'Hướng dẫn biên tập', icon: '📝' },
      { id: 'profile', label: 'Hồ sơ cá nhân', icon: '👤' },
   ];
   return (
      <aside className={styles.sidebar}>
         <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLogo}>RỒNG VÀNG</span>
            <span className={styles.sidebarSub}>— BIÊN TẬP —</span>
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
                  {item.badge > 0 && <span className={styles.navBadge}>{item.badge}</span>}
               </button>
            ))}
         </nav>
      </aside>
   );
}
