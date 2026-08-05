import React, { useState } from 'react';
import styles from '../EditorDashboard.module.css';

export default function EditorPendingTable({ articles, onApprove, onReject, onSuggest }) {
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);

   const totalPages = Math.ceil(articles.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const currentArticles = articles.slice(startIndex, startIndex + itemsPerPage);

   // Tương tự gridCols của Admin
   const gridCols = '80px 2fr 150px 120px 100px 250px';

   return (
      <section className={styles.listSection}>
         <h1>Bài Viết Chờ Duyệt ({articles.length})</h1>
         <div className={styles.articlesTable}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: gridCols }}>
               <span>ID</span>
               <span>Tiêu đề</span>
               <span>Tác giả</span>
               <span>Chuyên mục</span>
               <span>Ngày gửi</span>
               <span>Hành động</span>
            </div>
            {currentArticles.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Không có bài viết chờ duyệt.</div>
            ) : (
               currentArticles.map((article) => {
                  const authorName = article.authorName || article.author || 'Tác giả';
                  return (
                     <div
                        key={article.id}
                        className={styles.tableRow}
                        style={{ gridTemplateColumns: gridCols, alignItems: 'center' }}
                     >
                        <span>#{article.id.substring(0, 8)}</span>
                        <a
                           href={`/article/${article.id}`}
                           target="_blank"
                           rel="noreferrer"
                           className={styles.title}
                           style={{ color: 'var(--gold-primary)', textDecoration: 'none' }}
                        >
                           {article.title}
                        </a>
                        <span>{authorName}</span>
                        <span>{article.category || 'Chung'}</span>
                        <span style={{ fontSize: '0.85rem' }}>
                           {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : '---'}
                        </span>
                        <span className={styles.actions} style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                           <button
                              style={{
                                 background: '#10b981',
                                 color: '#fff',
                                 border: 'none',
                                 padding: '0.3rem 0.6rem',
                                 borderRadius: '4px',
                                 cursor: 'pointer',
                                 fontSize: '0.8rem',
                              }}
                              onClick={() => onApprove(article.id)}
                           >
                              ✅ Duyệt
                           </button>

                           <button
                              style={{
                                 background: '#ef4444',
                                 color: '#fff',
                                 border: 'none',
                                 padding: '0.3rem 0.6rem',
                                 borderRadius: '4px',
                                 cursor: 'pointer',
                                 fontSize: '0.8rem',
                              }}
                              onClick={() => onReject(article.id)}
                           >
                              ❌ Từ chối
                           </button>
                        </span>
                     </div>
                  );
               })
            )}
         </div>

         {articles.length > 0 && (
            <div
               style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#1c1c1c',
                  borderRadius: '8px',
               }}
            >
               <div>
                  <span style={{ color: '#aaa', marginRight: '0.5rem' }}>Hiển thị:</span>
                  <select
                     value={itemsPerPage}
                     onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                     }}
                     style={{
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '0.3rem',
                        borderRadius: '4px',
                     }}
                  >
                     <option value={10}>10</option>
                     <option value={15}>15</option>
                     <option value={20}>20</option>
                  </select>
               </div>

               <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                     disabled={currentPage === 1}
                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                     style={{
                        background: currentPage === 1 ? '#333' : 'var(--gold-primary)',
                        color: currentPage === 1 ? '#666' : '#000',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                     }}
                  >
                     Trước
                  </button>
                  <span style={{ color: '#fff' }}>
                     Trang {currentPage} / {totalPages || 1}
                  </span>
                  <button
                     disabled={currentPage >= totalPages}
                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                     style={{
                        background: currentPage >= totalPages ? '#333' : 'var(--gold-primary)',
                        color: currentPage >= totalPages ? '#666' : '#000',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                     }}
                  >
                     Sau
                  </button>
               </div>
            </div>
         )}
      </section>
   );
}
