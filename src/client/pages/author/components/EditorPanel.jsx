import React, { useState, useEffect, useRef } from 'react';
import styles from '../AuthorDashboard.module.css';
import { authorAPI } from '../../../utils/api';

export default function EditorPanel({ onArticleCreated, initialData, onCancelEdit }) {
   const [title, setTitle] = useState(initialData?.title || '');
   const [category, setCategory] = useState(initialData?.category || 'thoisu');
   const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
   const [image, setImage] = useState(initialData?.image || '');
   const [content, setContent] = useState(initialData?.content || '');
   const [submitting, setSubmitting] = useState(false);
   const [previewMode, setPreviewMode] = useState(false);

   const coverImageInputRef = useRef(null);
   const inlineImageInputRef = useRef(null);

   useEffect(() => {
      if (initialData) {
         setTitle(initialData.title || '');
         setCategory(initialData.category || 'thoisu');
         setExcerpt(initialData.excerpt || '');
         setImage(initialData.image || '');
         setContent(initialData.content || '');
      } else {
         setTitle('');
         setCategory('thoisu');
         setExcerpt('');
         setImage('');
         setContent('');
      }
   }, [initialData]);

   const handleCoverImageUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => setImage(reader.result);
         reader.readAsDataURL(file);
      }
   };

   const handleInlineImageUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setContent(
               (c) =>
                  c +
                  `<figure style="margin: 1.5rem 0; text-align: center;">\n  <img src="${reader.result}" alt="Ảnh nội dung" style="max-width: 100%; border-radius: 8px;" />\n  <figcaption style="font-size: 0.9rem; color: #888; margin-top: 0.5rem;">Mô tả ảnh</figcaption>\n</figure>\n`
            );
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSubmit = async (e, shouldSubmit = false) => {
      e.preventDefault();
      if (!title || !content) {
         alert('Vui lòng điền tiêu đề và nội dung bài viết!');
         return;
      }
      setSubmitting(true);
      try {
         const articleData = {
            title,
            category,
            excerpt: excerpt || content.substring(0, 150).replace(/<[^>]+>/g, ''),
            content,
            image: image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600',
            readTime: Math.max(1, Math.round(content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200)),
         };

         if (initialData) {
            await authorAPI.updateArticle(initialData.id, articleData);
            if (shouldSubmit) {
               await authorAPI.submitArticle(initialData.id);
               alert('Bài viết đã được cập nhật và gửi duyệt thành công!');
            } else {
               alert('Đã cập nhật bài viết nháp thành công!');
            }
         } else {
            const res = await authorAPI.createArticle(articleData);
            if (shouldSubmit) {
               await authorAPI.submitArticle(res.article.id);
               alert('Bài viết đã được tạo và gửi duyệt thành công!');
            } else {
               alert('Đã lưu bài viết nháp thành công!');
            }
            setTitle('');
            setContent('');
            setExcerpt('');
            setImage('');
         }

         onArticleCreated();
      } catch (err) {
         alert('Lỗi khi lưu bài viết: ' + err.message);
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className={styles.editorPanel}>
         <h2 className={styles.panelTitle}>{initialData ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h2>
         <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className={styles.formRow}>
               <div className={styles.formGroup}>
                  <label className={styles.label}>Tiêu đề bài viết</label>
                  <input
                     type="text"
                     className={styles.inputField}
                     placeholder="Nhập tiêu đề bài viết..."
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     required
                  />
               </div>
               <div className={styles.formGroup} style={{ maxWidth: '200px' }}>
                  <label className={styles.label}>Chuyên mục</label>
                  <select className={styles.inputField} value={category} onChange={(e) => setCategory(e.target.value)}>
                     <option value="thoisu">Thời sự</option>
                     <option value="thegioi">Thế giới</option>
                     <option value="business">Kinh doanh</option>
                     <option value="technology">Công nghệ</option>
                     <option value="sports">Thể thao</option>
                     <option value="entertainment">Giải trí</option>
                     <option value="health">Sức khỏe</option>
                     <option value="education">Giáo dục</option>
                     <option value="lifestyle">Đời sống</option>
                  </select>
               </div>
            </div>

            <div className={styles.formRow}>
               <div className={styles.formGroup}>
                  <label className={styles.label}>Tóm tắt ngắn</label>
                  <input
                     type="text"
                     className={styles.inputField}
                     placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                     value={excerpt}
                     onChange={(e) => setExcerpt(e.target.value)}
                  />
               </div>
               <div className={styles.formGroup}>
                  <label className={styles.label}>Ảnh minh họa</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <input
                        type="text"
                        className={styles.inputField}
                        placeholder="URL hình ảnh (https://...)"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                     />
                     <button
                        type="button"
                        className={styles.btnOutline}
                        style={{ padding: '0 1rem', whiteSpace: 'nowrap' }}
                        onClick={() => coverImageInputRef.current?.click()}
                     >
                        Tải ảnh lên
                     </button>
                  </div>
                  <input
                     type="file"
                     hidden
                     accept="image/*"
                     ref={coverImageInputRef}
                     onChange={handleCoverImageUpload}
                  />
               </div>
            </div>

            <div className={styles.formGroup}>
               <label className={styles.label}>Nội dung bài viết</label>
               <div className={styles.richEditor}>
                  <div className={styles.toolbar}>
                     <button
                        type="button"
                        title="Đoạn văn"
                        onClick={() => setContent((c) => c + '<p>Nội dung đoạn văn...</p>\n')}
                     >
                        ¶
                     </button>
                     <button
                        type="button"
                        title="In đậm"
                        onClick={() => setContent((c) => c + '<strong>Chữ đậm</strong>')}
                     >
                        <b>B</b>
                     </button>
                     <button
                        type="button"
                        title="In nghiêng"
                        onClick={() => setContent((c) => c + '<em>Chữ nghiêng</em>')}
                     >
                        <i>I</i>
                     </button>
                     <button
                        type="button"
                        title="Tiêu đề phụ"
                        onClick={() => setContent((c) => c + '<h3>Tiêu đề phụ</h3>\n')}
                     >
                        H3
                     </button>
                     <span className={styles.toolbarDivider} />
                     <button
                        type="button"
                        title="Trích dẫn"
                        onClick={() => setContent((c) => c + '<blockquote>Trích dẫn — Tác giả</blockquote>\n')}
                     >
                        "
                     </button>
                     <button
                        type="button"
                        title="Tải ảnh minh họa lên"
                        onClick={() => inlineImageInputRef.current?.click()}
                     >
                        🖼️
                     </button>
                     <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={inlineImageInputRef}
                        onChange={handleInlineImageUpload}
                     />
                  </div>
                  <textarea
                     className={styles.editorInput}
                     placeholder="Nhập nội dung bài viết bằng HTML (hoặc sử dụng thanh công cụ để chèn thẻ)..."
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     required
                  />
               </div>
            </div>

            <div className={styles.formActions}>
               {onCancelEdit && (
                  <button type="button" className={styles.btnSmallGhost} onClick={onCancelEdit} disabled={submitting}>
                     ❌ Hủy
                  </button>
               )}
               <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={() => setPreviewMode(true)}
                  disabled={submitting}
               >
                  👁️ Xem trước
               </button>
               <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={submitting}
               >
                  💾 Lưu nháp
               </button>
               <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={submitting}
               >
                  🚀 Gửi duyệt ngay
               </button>
            </div>
         </form>

         {previewMode && (
            <div
               style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0,0,0,0.85)',
                  zIndex: 9999,
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '2rem',
                  overflowY: 'auto',
               }}
            >
               <div
                  style={{
                     background: 'var(--bg-default)',
                     width: '100%',
                     maxWidth: '800px',
                     borderRadius: '8px',
                     padding: '3rem 2rem',
                     position: 'relative',
                     color: 'var(--text-primary)',
                     minHeight: '100%',
                     boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
               >
                  <button
                     onClick={() => setPreviewMode(false)}
                     style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                     }}
                     title="Đóng xem trước"
                  >
                     ✖
                  </button>

                  <div style={{ marginBottom: '2rem' }}>
                     <span
                        style={{
                           color: 'var(--gold)',
                           fontWeight: 600,
                           textTransform: 'uppercase',
                           fontSize: '0.9rem',
                        }}
                     >
                        {category}
                     </span>
                  </div>
                  <h1
                     style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        fontFamily: '"Merriweather", serif',
                        lineHeight: 1.3,
                     }}
                  >
                     {title || 'Chưa có tiêu đề bài viết'}
                  </h1>
                  <div style={{ color: 'var(--text-muted-custom)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                     <span>Tác giả: Tên Tác Giả</span> • <span>Vừa xong</span>
                  </div>

                  {excerpt && (
                     <p
                        style={{
                           fontSize: '1.2rem',
                           fontStyle: 'italic',
                           marginBottom: '2rem',
                           borderLeft: '4px solid var(--gold)',
                           paddingLeft: '1rem',
                           color: 'var(--text-secondary)',
                        }}
                     >
                        {excerpt}
                     </p>
                  )}

                  {image && (
                     <figure style={{ margin: '0 0 2.5rem 0' }}>
                        <img
                           src={image}
                           alt="Cover"
                           style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                     </figure>
                  )}

                  <div
                     className="article-content"
                     dangerouslySetInnerHTML={{ __html: content || '<p>Chưa có nội dung</p>' }}
                     style={{
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        fontFamily: '"Merriweather", serif',
                        color: '#e0e0e0',
                     }}
                  />

                  <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                     <button
                        onClick={() => setPreviewMode(false)}
                        className={styles.btnOutline}
                        style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                     >
                        Đóng xem trước
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
