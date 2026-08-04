import React from 'react';
import styles from '../EditorDashboard.module.css';

export default function ProfilePanel({ user, stats }) {
   if (!user) return null;
   return (
      <div className={styles.profilePanel}>
         <h2 className={styles.panelTitle}>Hồ Sơ Biên Tập Viên</h2>
         <div className={styles.profileContent}>
            <div className={styles.profileHeader}>
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
                  {user.fullName ? user.fullName.charAt(0) : 'E'}
               </div>
               <div className={styles.profileInfo}>
                  <h3>{user.fullName}</h3>
                  <p>Ban Biên Tập Rồng Vàng</p>
               </div>
            </div>

            <div className={styles.profileStats}>
               <div className={styles.statItem}>
                  <span className={styles.statLabel}>Tổng bài duyệt</span>
                  <span className={styles.statNum}>{stats?.articlesReviewed || 0}</span>
               </div>
               <div className={styles.statItem}>
                  <span className={styles.statLabel}>Đã duyệt</span>
                  <span className={styles.statNum} style={{ color: '#2ed573' }}>
                     {stats?.articlesApproved || 0}
                  </span>
               </div>
               <div className={styles.statItem}>
                  <span className={styles.statLabel}>Từ chối</span>
                  <span className={styles.statNum} style={{ color: '#ff4757' }}>
                     {stats?.articlesRejected || 0}
                  </span>
               </div>
            </div>

            <div className={styles.profileDetails}>
               <div className={styles.detailRow}>
                  <label>Email:</label>
                  <span>{user.email}</span>
               </div>
               <div className={styles.detailRow}>
                  <label>Chức vụ:</label>
                  <span>Biên Tập Viên</span>
               </div>
               <div className={styles.detailRow}>
                  <label>Ngày tham gia:</label>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ'}</span>
               </div>
            </div>

            <button className={styles.btnPrimaryFull} onClick={() => (window.location.href = '/profile')}>
               ✏️ Cài đặt tài khoản
            </button>
         </div>
      </div>
   );
}
