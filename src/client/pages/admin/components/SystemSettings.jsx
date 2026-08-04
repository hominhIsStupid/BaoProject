import React from 'react';
import styles from '../AdminDashboard.module.css';

export default function SystemSettings() {
   return (
      <section className={styles.settingsSection}>
         <h1>Cài Đặt Hệ Thống</h1>

         <div className={styles.settingsGroup}>
            <h2>Thông Tin Trang Tin</h2>
            <div className={styles.settingRow}>
               <label>Tên trang web:</label>
               <input type="text" defaultValue="Báo Rồng Vàng" className={styles.settingInput} readOnly />
            </div>
            <div className={styles.settingRow}>
               <label>Khẩu hiệu:</label>
               <input
                  type="text"
                  defaultValue="Thông tin trung thực - Kịp thời - Khách quan"
                  className={styles.settingInput}
                  readOnly
               />
            </div>
         </div>
         <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Các thông số cấu hình hệ thống đang được quản trị tự động qua biến môi trường (.env).
         </p>
      </section>
   );
}
