import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import styles from '../AuthorDashboard.module.css';
import { authorAPI } from '../../../utils/api';
import { CATEGORIES } from '../../../constant/global';
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

   const [currentArticleId, setCurrentArticleId] = useState(initialData?.id || null);

   useEffect(() => {
      if (initialData) {
         setTitle(initialData.title || '');
         setCategory(initialData.category || 'thoisu');
         setExcerpt(initialData.excerpt || '');
         setImage(initialData.image || '');
         setContent(initialData.content || '');
         setCurrentArticleId(initialData.id);
      } else {
         setTitle('');
         setCategory('thoisu');
         setExcerpt('');
         setImage('');
         setContent('');
         setCurrentArticleId(null);
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

   const compressImage = (file) => {
      return new Promise((resolve, reject) => {
         const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
         if (!validTypes.includes(file.type)) {
            reject(new Error('Chỉ hỗ trợ định dạng JPG, PNG, WEBP'));
            return;
         }
         
         if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Kích thước ảnh tải lên tối đa là 5MB/ảnh'));
            return;
         }

         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
               const canvas = document.createElement('canvas');
               let width = img.width;
               let height = img.height;
               const MAX_WIDTH = 1000;
               
               if (width > MAX_WIDTH) {
                  height = Math.round(height * (MAX_WIDTH / width));
                  width = MAX_WIDTH;
               }

               canvas.width = width;
               canvas.height = height;
               const ctx = canvas.getContext('2d');
               ctx.drawImage(img, 0, 0, width, height);

               // Compress and convert to webp format
               const compressedBase64 = canvas.toDataURL('image/webp', 0.8);
               resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error('Lỗi khi xử lý hình ảnh'));
         };
         reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh'));
      });
   };

   const processAndInsertImage = async (file) => {
      try {
         const compressedBase64 = await compressImage(file);
         const caption = prompt('Nhập chú thích cho ảnh (để trống nếu không có):', '');
         
         const captionHtml = caption !== null && caption.trim() !== '' 
            ? `\n  <figcaption style="font-size: 0.9rem; color: #888; margin-top: 0.5rem; font-style: italic;">${caption}</figcaption>`
            : '';

         setContent(
            (c) =>
               c +
               `\n<figure style="margin: 1.5rem 0; text-align: center;">\n  <img src="${compressedBase64}" alt="${caption || 'Ảnh nội dung'}" style="max-width: 100%; border-radius: 8px;" />${captionHtml}\n</figure>\n`
         );
      } catch (err) {
         alert(err.message);
      }
   };

   const handleInlineImageUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
         processAndInsertImage(file);
         e.target.value = null;
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

         if (currentArticleId) {
            await authorAPI.updateArticle(currentArticleId, articleData);
            if (shouldSubmit) {
               await authorAPI.submitArticle(currentArticleId);
               alert('Bài viết đã được cập nhật và gửi duyệt thành công!');
               onArticleCreated(false);
            } else {
               alert('Đã cập nhật bài viết nháp thành công!');
               onArticleCreated(true);
            }
         } else {
            const res = await authorAPI.createArticle(articleData);
            setCurrentArticleId(res.article.id);
            if (shouldSubmit) {
               await authorAPI.submitArticle(res.article.id);
               alert('Bài viết đã được tạo và gửi duyệt thành công!');
               onArticleCreated(false);
            } else {
               alert('Đã lưu bài viết nháp thành công!');
               onArticleCreated(true);
            }
         }
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
                     {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                           {cat.name}
                        </option>
                     ))}
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
                        accept=".jpg,.jpeg,.png,.webp"
                        ref={inlineImageInputRef}
                        onChange={handleInlineImageUpload}
                     />
                  </div>
                  <textarea
                     className={styles.editorInput}
                     placeholder="Nhập nội dung bài viết bằng HTML (hoặc sử dụng thanh công cụ để chèn thẻ). Kéo thả ảnh vào đây để chèn nhanh..."
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     required
                     onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                           processAndInsertImage(file);
                        }
                     }}
                     onDragOver={(e) => e.preventDefault()}
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
                     dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || '<p>Chưa có nội dung</p>') }}
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
