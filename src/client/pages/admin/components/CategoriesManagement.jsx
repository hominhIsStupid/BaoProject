import React, { useState } from 'react';
import styles from '../AdminDashboard.module.css';

export default function CategoriesManagement({ categories, onCreate, onDelete, onUpdate }) {
   const [name, setName] = useState('');
   const [slug, setSlug] = useState('');
   const [color, setColor] = useState('#D4AF37');
   const [editingId, setEditingId] = useState(null);

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!name || !slug) return;
      if (editingId) {
         onUpdate(editingId, { name, slug, color });
         setEditingId(null);
      } else {
         onCreate({ name, slug, color });
      }
      setName('');
      setSlug('');
      setColor('#D4AF37');
   };

   const handleEditClick = (cat) => {
      setEditingId(cat.id);
      setName(cat.name);
      setSlug(cat.slug);
      setColor(cat.color || '#D4AF37');
   };

   const handleCancelEdit = () => {
      setEditingId(null);
      setName('');
      setSlug('');
      setColor('#D4AF37');
   };

   return (
      <section className={styles.managementSection}>
         <h1>Quản Lý Chuyên Mục</h1>
         <form
            onSubmit={handleSubmit}
            style={{
               display: 'flex',
               gap: '1rem',
               background: '#141414',
               padding: '1rem',
               borderRadius: '4px',
               marginBottom: '2rem',
               alignItems: 'center',
               flexWrap: 'wrap',
            }}
         >
            <input
               type="text"
               placeholder="Tên chuyên mục..."
               value={name}
               onChange={(e) => setName(e.target.value)}
               required
               className={styles.settingInput}
               style={{ flex: 1, minWidth: '150px' }}
            />
            <input
               type="text"
               placeholder="Slug (ví dụ: thoisu)..."
               value={slug}
               onChange={(e) => setSlug(e.target.value)}
               required
               disabled={!!editingId}
               className={styles.settingInput}
               style={{
                  flex: 1,
                  minWidth: '150px',
                  opacity: editingId ? 0.6 : 1,
                  cursor: editingId ? 'not-allowed' : 'text',
               }}
            />
            <input
               type="color"
               value={color}
               onChange={(e) => setColor(e.target.value)}
               style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
            <button type="submit" className={styles.btnPrimary} style={{ height: '40px' }}>
               {editingId ? '💾 Cập nhật' : '➕ Thêm'}
            </button>
            {editingId && (
               <button
                  type="button"
                  className={styles.actionBtn}
                  style={{ height: '40px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
                  onClick={handleCancelEdit}
               >
                  Hủy
               </button>
            )}
         </form>

         <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
               <div key={cat.id} className={styles.categoryCard}>
                  <div className={styles.categoryColor} style={{ backgroundColor: cat.color || '#D4AF37' }} />
                  <h3>{cat.name}</h3>
                  <p>
                     Slug: <code>{cat.slug}</code>
                  </p>
                  <div className={styles.categoryActions}>
                     <button
                        className={styles.actionBtn}
                        style={{
                           marginRight: '0.5rem',
                           background: 'var(--gold-primary)',
                           color: '#000',
                           border: 'none',
                           padding: '0.3rem 0.6rem',
                           borderRadius: '4px',
                           cursor: 'pointer',
                        }}
                        onClick={() => handleEditClick(cat)}
                     >
                        ✏️ Sửa
                     </button>
                     <button className={styles.btnSmallDanger} onClick={() => onDelete(cat.id)}>
                        🗑️ Xóa
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </section>
   );
}
