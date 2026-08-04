import React from 'react';
import styles from '../AuthorDashboard.module.css';

export default function ProfilePanel({ user, articlesCount = 0, viewsCount = 0 }) {
   if (!user) return null;
   return (
      <div className={styles.profilePanel}>
         <h2 className={styles.panelTitle}>Hồ sơ cá nhân</h2>
         <div className={styles.profileContent}>
            <div className={styles.profileHeader}>
               {user.avatar ? (
                  <img
                     src={user.avatar}
                     className={styles.profileAvatar}
                     alt="Avatar"
                     style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                  />
               ) : (
                  <div
                     className={styles.profileAvatar}
                     style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        background: '#333',
                        color: '#FFF',
                     }}
                  >
                     {user.fullName ? user.fullName.charAt(0) : 'U'}
                  </div>
               )}
               <div className={styles.profileInfo}>
                  <h3>{user.fullName}</h3>
                  <p>Nhà báo / Tác giả</p>
               </div>
            </div>

            <div className={styles.profileStats}>
               <div className={styles.statItem}>
                  <span className={styles.statLabel}>Bài viết đã đăng</span>
                  <span className={styles.statNum}>{articlesCount}</span>
               </div>
               <div className={styles.statItem}>
                  <span className={styles.statLabel}>Tổng lượt xem</span>
                  <span className={styles.statNum}>{viewsCount}</span>
               </div>
               <div className={styles.statItem}>
                  <span className={styles.statLabel}>Vai trò</span>
                  <span className={styles.statNum} style={{ fontSize: '0.9rem', color: 'var(--gold-primary)' }}>
                     Tác Giả
                  </span>
               </div>
            </div>

            <div className={styles.profileDetails}>
               <div className={styles.detailRow}>
                  <label>Email:</label>
                  <span>{user.email}</span>
               </div>
               <div className={styles.detailRow}>
                  <label>Tiểu sử:</label>
                  <span>{user.bio || 'Chưa cập nhật tiểu sử.'}</span>
               </div>
               <div className={styles.detailRow}>
                  <label>Số điện thoại:</label>
                  <span>{user.phone || 'Chưa cập nhật'}</span>
               </div>
               <div className={styles.detailRow}>
                  <label>Ngày tham gia:</label>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}</span>
               </div>
            </div>

            <button className={styles.btnPrimaryFull} onClick={() => (window.location.href = '/profile')}>
               ✏️ Cập nhật thông tin hồ sơ
            </button>
         </div>
      </div>
   );
}
