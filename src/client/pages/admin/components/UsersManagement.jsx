import React, { useState } from 'react';
import styles from '../AdminDashboard.module.css';

export default function UsersManagement({ users, onUpdateRole, onSuspend, onActivate }) {
   const [search, setSearch] = useState('');

   const filtered = users.filter(
      (u) =>
         u.email.toLowerCase().includes(search.toLowerCase()) ||
         (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
   );

   const formatMoney = (amount) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
   };

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Tài Khoản Thành Viên</h1>
         <div className={styles.tableControls}>
            <input
               type="text"
               placeholder="Tìm kiếm theo tên hoặc email..."
               className={styles.searchInput}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className={styles.articlesTable} style={{ overflowX: 'auto' }}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1.5fr' }}>
               <span>Tên thành viên</span>
               <span>Email</span>
               <span>Vai trò</span>
               <span>Trạng thái</span>
               <span>Hành động</span>
            </div>
            {filtered.map((user) => (
               <div
                  key={user.id}
                  className={styles.tableRow}
                  style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1.5fr', alignItems: 'center' }}
               >
                  <span className={styles.title}>{user.fullName || 'Chưa đặt tên'}</span>
                  <span>{user.email}</span>
                  <span>
                     <select
                        value={user.role}
                        onChange={(e) => onUpdateRole(user.id, e.target.value)}
                        style={{
                           background: '#1c1c1c',
                           border: '1px solid rgba(255,255,255,0.1)',
                           color: '#FFF',
                           padding: '0.2rem 0.5rem',
                           borderRadius: '3px',
                           outline: 'none',
                        }}
                     >
                        <option value="guest">Guest</option>
                        <option value="author">Author</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                     </select>
                  </span>
                  <span>
                     <span style={{ color: user.status === 'suspended' ? '#ff4757' : '#2ed573' }}>
                        {user.status === 'suspended' ? '🚫 Khóa' : '✅ Active'}
                     </span>
                  </span>
                  <span className={styles.actions} style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                     {user.status === 'suspended' ? (
                        <button className={styles.btnSmall} onClick={() => onActivate(user.id)}>
                           🔓
                        </button>
                     ) : (
                        <button className={styles.btnSmallDanger} onClick={() => onSuspend(user.id)}>
                           🚫
                        </button>
                     )}
                  </span>
               </div>
            ))}
         </div>
      </section>
   );
}
