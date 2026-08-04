import React from 'react';
import styles from '../AdminDashboard.module.css';

export default function SystemLogs({ logs }) {
   return (
      <section className={styles.managementSection}>
         <h1>Nhật Ký Hoạt Động Hệ Thống</h1>
         <div className={styles.articlesTable}>
            <div className={styles.tableHeader}>
               <span>Thời gian</span>
               <span>Hành động</span>
               <span>Nội dung mô tả</span>
            </div>
            {logs.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không có log hoạt động nào.</div>
            ) : (
               logs.map((log) => (
                  <div key={log.id} className={styles.tableRow}>
                     <span>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                     <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{log.action}</span>
                     <span>{log.description}</span>
                  </div>
               ))
            )}
         </div>
      </section>
   );
}
