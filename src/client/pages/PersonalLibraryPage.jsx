import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarksAPI } from '../utils/api';
import styles from './PersonalLibraryPage.module.css';
import { getTimeAgo } from '../utils/formatTime';

function PersonalLibraryPage() {
   const [bookmarks, setBookmarks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeFolder, setActiveFolder] = useState('Tất cả');
   
   // For moving a bookmark
   const [movingBookmarkId, setMovingBookmarkId] = useState(null);
   const [moveTargetFolder, setMoveTargetFolder] = useState('');
   const [newFolderName, setNewFolderName] = useState('');

   const fetchBookmarks = async () => {
      setLoading(true);
      try {
         const data = await bookmarksAPI.getAll();
         // Normalize folderName
         const normalizedData = data.map((b) => ({ ...b, folderName: b.folderName || 'Mặc định' }));
         setBookmarks(normalizedData);
      } catch (err) {
         setError('Không thể tải thư viện. Vui lòng thử lại.');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBookmarks();
   }, []);

   const folders = [...new Set(bookmarks.map((b) => b.folderName))];
   
   // Get filtered bookmarks
   const displayedBookmarks = activeFolder === 'Tất cả' 
      ? bookmarks 
      : bookmarks.filter(b => b.folderName === activeFolder);

   const handleRemove = async (articleId) => {
      if (!window.confirm('Bạn có chắc muốn xóa bài viết này khỏi thư viện?')) return;
      try {
         await bookmarksAPI.delete(articleId);
         setBookmarks((prev) => prev.filter((b) => b.id !== articleId));
      } catch (err) {
         alert('Xóa thất bại: ' + err.message);
      }
   };

   const openMoveModal = (articleId, currentFolder) => {
      setMovingBookmarkId(articleId);
      setMoveTargetFolder(currentFolder);
      setNewFolderName('');
   };

   const handleMove = async () => {
      let target = moveTargetFolder === 'NEW' ? newFolderName.trim() : moveTargetFolder;
      if (!target) return;
      
      try {
         await bookmarksAPI.updateFolder(movingBookmarkId, target);
         setBookmarks((prev) => 
            prev.map((b) => b.id === movingBookmarkId ? { ...b, folderName: target } : b)
         );
         setMovingBookmarkId(null);
      } catch (err) {
         alert('Chuyển thư mục thất bại: ' + err.message);
      }
   };

   if (loading) {
      return (
         <div className={styles.container} style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <div className="loading-spinner">Đang tải thư viện...</div>
         </div>
      );
   }

   return (
      <div className={styles.libraryPage}>
         <div className={styles.container}>
            <h1 className={styles.pageTitle}>Thư viện cá nhân</h1>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.layout}>
               <aside className={styles.sidebar}>
                  <h3 className={styles.sidebarTitle}>Thư mục</h3>
                  <ul className={styles.folderList}>
                     <li 
                        className={`${styles.folderItem} ${activeFolder === 'Tất cả' ? styles.active : ''}`}
                        onClick={() => setActiveFolder('Tất cả')}
                     >
                        Tất cả bài viết ({bookmarks.length})
                     </li>
                     {folders.map(folder => (
                        <li 
                           key={folder}
                           className={`${styles.folderItem} ${activeFolder === folder ? styles.active : ''}`}
                           onClick={() => setActiveFolder(folder)}
                        >
                           {folder} ({bookmarks.filter(b => b.folderName === folder).length})
                        </li>
                     ))}
                  </ul>
               </aside>

               <main className={styles.mainContent}>
                  <h2 className={styles.sectionTitle}>
                     {activeFolder === 'Tất cả' ? 'Tất cả bài viết đã lưu' : `Thư mục: ${activeFolder}`}
                  </h2>

                  {displayedBookmarks.length === 0 ? (
                     <div className={styles.emptyState}>Chưa có bài viết nào trong thư mục này.</div>
                  ) : (
                     <div className={styles.articleList}>
                        {displayedBookmarks.map(article => (
                           <div key={article.id} className={styles.articleCard}>
                              <img src={article.image || 'https://via.placeholder.com/150'} alt={article.title} className={styles.articleImg} />
                              <div className={styles.articleInfo}>
                                 <Link to={`/article/${article.id}`} className={styles.articleTitle}>
                                    {article.title}
                                 </Link>
                                 <div className={styles.articleMeta}>
                                    <span>{article.authorName}</span>
                                    <span>•</span>
                                    <span>{getTimeAgo(article.publishedAt)}</span>
                                 </div>
                                 <div className={styles.articleActions}>
                                    <button 
                                       className={styles.actionBtn}
                                       onClick={() => openMoveModal(article.id, article.folderName)}
                                    >
                                       Chuyển thư mục
                                    </button>
                                    <button 
                                       className={`${styles.actionBtn} ${styles.danger}`}
                                       onClick={() => handleRemove(article.id)}
                                    >
                                       Xóa
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </main>
            </div>
         </div>

         {/* Move Modal */}
         {movingBookmarkId && (
            <div className={styles.modalOverlay} onClick={() => setMovingBookmarkId(null)}>
               <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <h3>Chuyển thư mục</h3>
                  <div className={styles.modalBody}>
                     <label>Chọn thư mục đích:</label>
                     <select 
                        value={moveTargetFolder}
                        onChange={e => setMoveTargetFolder(e.target.value)}
                        className={styles.folderSelect}
                     >
                        {folders.map(f => (
                           <option key={f} value={f}>{f}</option>
                        ))}
                        <option value="NEW">-- Tạo thư mục mới --</option>
                     </select>
                     
                     {moveTargetFolder === 'NEW' && (
                        <input 
                           type="text"
                           placeholder="Nhập tên thư mục mới..."
                           value={newFolderName}
                           onChange={e => setNewFolderName(e.target.value)}
                           className={styles.folderInput}
                           autoFocus
                        />
                     )}
                  </div>
                  <div className={styles.modalActions}>
                     <button className={styles.btnCancel} onClick={() => setMovingBookmarkId(null)}>Hủy</button>
                     <button className={styles.btnConfirm} onClick={handleMove}>Lưu</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default PersonalLibraryPage;
