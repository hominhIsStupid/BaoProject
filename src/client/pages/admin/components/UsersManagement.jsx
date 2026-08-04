import React, { useState } from 'react';
import styles from '../AdminDashboard.module.css';

export default function UsersManagement({ users, onUpdateRole, onSuspend, onActivate, onUpdateWallet }) {
   const [search, setSearch] = useState('');
   const [walletModalUserId, setWalletModalUserId] = useState(null);
   const [walletForm, setWalletForm] = useState({ balanceAdd: '', newPlan: 'none' });

   const filtered = users.filter(
      (u) =>
         u.email.toLowerCase().includes(search.toLowerCase()) ||
         (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
   );

   const formatMoney = (amount) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
   };

   const openWalletModal = (user) => {
      setWalletModalUserId(user.id);
      setWalletForm({ balanceAdd: '', newPlan: user.plan || 'none' });
   };

   const handleWalletSubmit = (e) => {
      e.preventDefault();
      onUpdateWallet(walletModalUserId, Number(walletForm.balanceAdd) || 0, walletForm.newPlan);
      setWalletModalUserId(null);
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
            <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1.2fr 1fr 1.5fr' }}>
               <span>Tên thành viên</span>
               <span>Email</span>
               <span>Vai trò</span>
               <span>Số dư & Gói</span>
               <span>Trạng thái</span>
               <span>Hành động</span>
            </div>
            {filtered.map((user) => (
               <div
                  key={user.id}
                  className={styles.tableRow}
                  style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1.2fr 1fr 1.5fr', alignItems: 'center' }}
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
                  <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                     <div style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>{formatMoney(user.balance)}</div>
                     <div style={{ color: 'var(--text-muted)' }}>
                        Gói:{' '}
                        <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                           {user.plan || 'Không'}
                        </strong>
                     </div>
                  </span>
                  <span>
                     <span style={{ color: user.status === 'suspended' ? '#ff4757' : '#2ed573' }}>
                        {user.status === 'suspended' ? '🚫 Khóa' : '✅ Active'}
                     </span>
                  </span>
                  <span className={styles.actions} style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                     <button className={styles.btnSmall} onClick={() => openWalletModal(user)}>
                        💳 Ví & Gói
                     </button>
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

         {/* WALLET MODAL */}
         {walletModalUserId && (
            <div
               style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.7)',
                  zIndex: 1000,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <div
                  style={{
                     background: 'var(--bg-card)',
                     padding: '2rem',
                     borderRadius: '12px',
                     width: '90%',
                     maxWidth: '400px',
                     border: '1px solid var(--gold-primary)',
                  }}
               >
                  <h3 style={{ marginTop: 0, color: 'var(--gold-primary)' }}>Cập nhật Ví & Gói Premium</h3>
                  <form onSubmit={handleWalletSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div>
                        <label
                           style={{
                              display: 'block',
                              marginBottom: '5px',
                              fontSize: '0.9rem',
                              color: 'var(--text-secondary)',
                           }}
                        >
                           Cộng/trừ số dư (VNĐ):
                        </label>
                        <input
                           type="number"
                           value={walletForm.balanceAdd}
                           onChange={(e) => setWalletForm({ ...walletForm, balanceAdd: e.target.value })}
                           placeholder="Ví dụ: 100000 hoặc -50000"
                           style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid var(--bg-border)',
                              background: 'var(--bg-secondary)',
                              color: '#fff',
                           }}
                        />
                     </div>
                     <div>
                        <label
                           style={{
                              display: 'block',
                              marginBottom: '5px',
                              fontSize: '0.9rem',
                              color: 'var(--text-secondary)',
                           }}
                        >
                           Nâng cấp / Thay đổi gói:
                        </label>
                        <select
                           value={walletForm.newPlan}
                           onChange={(e) => setWalletForm({ ...walletForm, newPlan: e.target.value })}
                           style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid var(--bg-border)',
                              background: 'var(--bg-secondary)',
                              color: '#fff',
                           }}
                        >
                           <option value="none">Hủy gói / Không có gói</option>
                           <option value="v1">Gói V1 (2 bài/ngày, 30 bài/tháng)</option>
                           <option value="v2">Gói V2 (4 bài/ngày, 60 bài/tháng)</option>
                           <option value="pro">Gói PRO (Không giới hạn)</option>
                        </select>
                     </div>
                     <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button
                           type="button"
                           onClick={() => setWalletModalUserId(null)}
                           style={{
                              flex: 1,
                              padding: '10px',
                              background: 'transparent',
                              border: '1px solid var(--bg-border)',
                              color: 'var(--text-primary)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                           }}
                        >
                           Hủy
                        </button>
                        <button
                           type="submit"
                           style={{
                              flex: 1,
                              padding: '10px',
                              background: 'var(--gold-primary)',
                              color: '#000',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                           }}
                        >
                           Lưu thay đổi
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </section>
   );
}
