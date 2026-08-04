import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboard.module.css';
import { tokenStorage } from '../../../utils/api';

export default function ResearchManagement() {
   const [articles, setArticles] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);
   const [formData, setFormData] = useState({
      id: null,
      title: '',
      summary: '',
      content: '',
      author: '',
      category: 'AI',
      thumbnail: '',
      readingTime: 5,
      price: 50000,
   });

   useEffect(() => {
      fetchArticles();
   }, []);

   const fetchArticles = async () => {
      setLoading(true);
      try {
         const res = await fetch('/api/research?limit=50');
         const data = await res.json();
         setArticles(data.articles || []);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleEditClick = async (article) => {
      try {
         const token = tokenStorage.get();
         // Pass mockRole=admin so the backend returns the full content regardless of purchase status
         const res = await fetch(`/api/research/${article.id}?mockRole=admin`, {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (res.ok) {
            const fullArticle = await res.json();
            setFormData(fullArticle);
            setShowForm(true);
         } else {
            alert('Lỗi tải nội dung bài viết');
         }
      } catch (err) {
         alert('Lỗi kết nối');
      }
   };

   const handleSave = async (e) => {
      e.preventDefault();
      try {
         const method = formData.id ? 'PUT' : 'POST';
         const url = formData.id ? `/api/research/${formData.id}` : '/api/research';
         const token = tokenStorage.get();

         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData),
         });

         if (res.ok) {
            alert('Lưu thành công!');
            setShowForm(false);
            fetchArticles();
         } else {
            const err = await res.json();
            alert('Lỗi: ' + err.message);
         }
      } catch (err) {
         alert('Lỗi kết nối');
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bài nghiên cứu này?')) return;
      try {
         const token = tokenStorage.get();
         const res = await fetch(`/api/research/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
         });
         if (res.ok) {
            alert('Xóa thành công!');
            fetchArticles();
         }
      } catch (err) {
         alert('Lỗi kết nối');
      }
   };

   if (loading) return <div>Đang tải dữ liệu nghiên cứu...</div>;

   return (
      <section className={styles.managementSection}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1>Quản lý Nghiên cứu Khoa học</h1>
            <button
               className={styles.actionBtn}
               style={{ background: 'var(--gold-primary)', color: '#000' }}
               onClick={() => {
                  setFormData({
                     id: null,
                     title: '',
                     summary: '',
                     content: '',
                     author: '',
                     category: 'AI',
                     thumbnail: '',
                     readingTime: 5,
                     price: 50000,
                  });
                  setShowForm(true);
               }}
            >
               + Thêm bài mới
            </button>
         </div>

         {showForm && (
            <div
               style={{
                  background: 'var(--bg-secondary)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
               }}
            >
               <h3 style={{ marginBottom: '1rem', color: 'var(--gold-primary)' }}>
                  {formData.id ? 'Sửa bài' : 'Thêm bài mới'}
               </h3>
               <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                     required
                     placeholder="Tiêu đề"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     style={{
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                     }}
                  />
                  <input
                     placeholder="Tác giả"
                     value={formData.author}
                     onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                     style={{
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                     }}
                  />
                  <select
                     value={formData.category}
                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                     style={{
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                     }}
                  >
                     {['AI', 'Công nghệ', 'Y học', 'Kinh tế', 'Giáo dục', 'Môi trường', 'Vật lý', 'Toán học'].map(
                        (c) => (
                           <option key={c} value={c}>
                              {c}
                           </option>
                        )
                     )}
                  </select>
                  <input
                     placeholder="URL Thumbnail (Upload ảnh qua form ngoài hoặc dán URL)"
                     value={formData.thumbnail}
                     onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                     style={{
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                     }}
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <input
                        type="number"
                        placeholder="Thời gian đọc (phút)"
                        value={formData.readingTime}
                        onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                        style={{
                           flex: 1,
                           padding: '0.8rem',
                           background: 'var(--bg-primary)',
                           color: 'var(--text-primary)',
                           border: '1px solid var(--glass-border)',
                           borderRadius: '4px',
                        }}
                     />
                     <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        style={{
                           flex: 1,
                           padding: '0.8rem',
                           background: 'var(--bg-primary)',
                           color: 'var(--text-primary)',
                           border: '1px solid var(--glass-border)',
                           borderRadius: '4px',
                        }}
                     />
                  </div>
                  <textarea
                     required
                     placeholder="Tóm tắt"
                     value={formData.summary}
                     onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                     rows="3"
                     style={{
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                     }}
                  />
                  <textarea
                     required
                     placeholder="Nội dung chi tiết (HTML hỗ trợ)"
                     value={formData.content}
                     onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                     rows="10"
                     style={{
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                     }}
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <button
                        type="submit"
                        style={{
                           padding: '0.8rem 2rem',
                           background: 'var(--gold-primary)',
                           color: '#000',
                           fontWeight: 'bold',
                           border: 'none',
                           borderRadius: '4px',
                           cursor: 'pointer',
                        }}
                     >
                        Lưu
                     </button>
                     <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        style={{
                           padding: '0.8rem 2rem',
                           background: 'transparent',
                           color: 'var(--text-primary)',
                           border: '1px solid var(--glass-border)',
                           borderRadius: '4px',
                           cursor: 'pointer',
                        }}
                     >
                        Hủy
                     </button>
                  </div>
               </form>
            </div>
         )}

         <table className={styles.articlesTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
               <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Tiêu đề</th>
                  <th style={{ padding: '1rem' }}>Lĩnh vực</th>
                  <th style={{ padding: '1rem' }}>Tác giả</th>
                  <th style={{ padding: '1rem' }}>Thao tác</th>
               </tr>
            </thead>
            <tbody>
               {articles.map((article) => (
                  <tr key={article.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <td style={{ padding: '1rem' }}>{article.title}</td>
                     <td style={{ padding: '1rem' }}>{article.category}</td>
                     <td style={{ padding: '1rem' }}>{article.author}</td>
                     <td style={{ padding: '1rem' }}>
                        <button
                           onClick={() => handleEditClick(article)}
                           style={{
                              background: 'transparent',
                              border: '1px solid var(--gold-primary)',
                              color: 'var(--gold-primary)',
                              padding: '0.3rem 0.8rem',
                              borderRadius: '4px',
                              marginRight: '0.5rem',
                              cursor: 'pointer',
                           }}
                        >
                           Sửa
                        </button>
                        <button
                           onClick={() => handleDelete(article.id)}
                           style={{
                              background: 'transparent',
                              border: '1px solid #ff4757',
                              color: '#ff4757',
                              padding: '0.3rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                           }}
                        >
                           Xóa
                        </button>
                     </td>
                  </tr>
               ))}
               {articles.length === 0 && (
                  <tr>
                     <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>
                        Chưa có bài nghiên cứu nào
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </section>
   );
}
