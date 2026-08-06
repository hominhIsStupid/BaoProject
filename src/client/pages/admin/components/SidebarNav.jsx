import React from 'react';
import styles from '../AdminDashboard.module.css';

export default function SidebarNav({ activeTab, onTabChange, pendingCount = 0, approvedCount = 0 }) {
   const menu = [
      { id: 'dashboard', label: 'Bảng điều khiển', icon: '📊' },
      { id: 'articles-pending', label: 'Bài chờ duyệt', icon: '📋', badge: pendingCount },
      { id: 'articles-approved', label: 'Bài chờ xuất bản', icon: '✅', badge: approvedCount },
      { id: 'articles-manage', label: 'Quản lý bài viết', icon: '📝' },
      { id: 'categories-manage', label: 'Quản lý chuyên mục', icon: '📂' },
      { id: 'comments-manage', label: 'Quản lý bình luận', icon: '💬' },
      { id: 'users-manage', label: 'Quản lý người dùng', icon: '👥' },
      { id: 'logs', label: 'Nhật ký hệ thống', icon: '📜' },
      { id: 'settings', label: 'Cài đặt hệ thống', icon: '⚙️' },
   ];
   return (
      <aside className={styles.sidebar}>
         <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLogo}>RỒNG VÀNG</span>
            <span className={styles.sidebarSub}>— QUẢN TRỊ —</span>
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
