import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Link, useParams } from 'react-router-dom';
import { articlesAPI, commentsAPI, bookmarksAPI, recommendationAPI, tokenStorage } from '../utils/api';
import { apiCache } from '../utils/cache';
import { CATEGORY_MAP } from '../constant/global';
import styles from './ArticleDetailPage.module.css';

import { getTimeAgo } from '../utils/formatTime';
import { useArticleData } from '../hooks/useArticleData';

// Reusable Share Component to be placed at top and bottom
const ShareButtonsGroup = ({ shareUrl, handleCopyLink, copied }) => {
   const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
   const zaloShareUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`;

   return (
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
         <a
            href={fbShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.toolBtn} ${styles.shareFb}`}
            aria-label="Chia sẻ qua Facebook"
            title="Chia sẻ qua Facebook"
         >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
               <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
         </a>
         <a
            href={zaloShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.toolBtn} ${styles.shareZalo}`}
            aria-label="Chia sẻ qua Zalo"
            title="Chia sẻ qua Zalo"
         >
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Zalo</span>
         </a>
         <button
            className={`${styles.toolBtn} ${styles.shareCopy}`}
            onClick={handleCopyLink}
            aria-label="Copy liên kết bài viết"
            title="Copy liên kết"
            style={{ position: 'relative' }}
         >
            <svg
               width="16"
               height="16"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               viewBox="0 0 24 24"
            >
               <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
               <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {copied && <span className={styles.copyToast}>Đã sao chép</span>}
         </button>
      </div>
   );
};

function ArticleDetailPage() {
   const { id } = useParams();

   const {
      article,
      relatedArticles,
      mostReadArticles,
      loading,
      error,
      recommendations,
      comments,
      setComments,
      isBookmarked,
      bookmarkLoading,
      isLiked,
      likeCount,
      likeLoading,
      loggedInUser,
      handleToggleBookmark,
      handleToggleLike,
   } = useArticleData(id);

   const EMOJI_LIST = ['😀', '😂', '😍', '😭', '🥺', '😡', '👍', '🙏', '❤️', '🔥', '🤔', '🙌', '👏', '🎉', '😢', '💯'];

   const [newCommentText, setNewCommentText] = useState('');
   const [copied, setCopied] = useState(false);
   const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
   const [activeTab, setActiveTab] = useState('newest');
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

   const [showSaveModal, setShowSaveModal] = useState(false);
   const [saveFolderName, setSaveFolderName] = useState('Mặc định');
   const [newFolderInput, setNewFolderInput] = useState('');
   const [existingFolders, setExistingFolders] = useState([]);
   const [savedToast, setSavedToast] = useState(false);

   const onClickSave = async () => {
      if (!loggedInUser) {
         alert('Vui lòng đăng nhập để lưu bài viết!');
         return;
      }
      if (isBookmarked) {
         handleToggleBookmark();
         return;
      }
      try {
         const bookmarks = await bookmarksAPI.getAll();
         const folders = [...new Set(bookmarks.map((b) => b.folderName || 'Mặc định'))];
         setExistingFolders(folders.length > 0 ? folders : ['Mặc định']);
         setSaveFolderName(folders.includes('Mặc định') ? 'Mặc định' : folders[0]);
      } catch (err) {
         console.error(err);
         setExistingFolders(['Mặc định']);
      }
      setShowSaveModal(true);
      setNewFolderInput('');
   };

   const confirmSave = async () => {
      const finalFolder = saveFolderName === 'NEW' ? newFolderInput.trim() || existingFolders[0] || 'Mặc định' : saveFolderName;
      setShowSaveModal(false);
      await handleToggleBookmark(finalFolder);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
   };

   const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!newCommentText.trim() || !loggedInUser) return;

      try {
         await commentsAPI.create(id, newCommentText.trim());
         // Refresh comments
         const commentsData = await commentsAPI.getByArticle(id);
         setComments(commentsData);
         setNewCommentText('');
      } catch (err) {
         alert('Lỗi: ' + err.message);
      }
   };

   const handleLikeComment = async (commentId) => {
      if (!loggedInUser) {
         alert('Vui lòng đăng nhập để thích bình luận!');
         return;
      }

      // Optimistic update
      setComments((prevComments) =>
         prevComments.map((c) => {
            if (c.id === commentId) {
               return { ...c, likes: (c.likes || 0) + (c.liked ? -1 : 1), liked: !c.liked };
            }
            return c;
         })
      );

      try {
         const comment = comments.find((c) => c.id === commentId);
         if (comment.liked) {
            await commentsAPI.unlike(commentId);
         } else {
            await commentsAPI.like(commentId);
         }
      } catch (err) {
         // Revert on error
         setComments((prevComments) =>
            prevComments.map((c) => {
               if (c.id === commentId) {
                  return { ...c, likes: (c.likes || 0) + (c.liked ? -1 : 1), liked: !c.liked };
               }
               return c;
            })
         );
         console.error('Lỗi khi thích bình luận:', err);
      }
   };

   const handleReportComment = async (commentId) => {
      if (!loggedInUser) {
         alert('Vui lòng đăng nhập để báo cáo bình luận!');
         return;
      }
      if (!window.confirm('Bạn có chắc chắn muốn báo cáo bình luận này?')) return;

      try {
         await commentsAPI.report(commentId);
         alert('Đã báo cáo bình luận thành công. Cảm ơn bạn!');
      } catch (err) {
         console.error('Lỗi khi báo cáo:', err);
         alert('Báo cáo thất bại: ' + err.message);
      }
   };

   const toggleReplies = (commentId) => {
      setComments((prevComments) =>
         prevComments.map((c) => {
            if (c.id === commentId) {
               return { ...c, showReplies: !c.showReplies };
            }
            return c;
         })
      );
   };

   // Inject meta tags for Open Graph (Facebook/Zalo)
   useEffect(() => {
      if (article) {
         document.title = article.title;
         
         const setMeta = (propName, propValue, content) => {
            let meta = document.querySelector(`meta[${propName}="${propValue}"]`);
            if (!meta) {
               meta = document.createElement('meta');
               meta.setAttribute(propName, propValue);
               document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
         };

         // Use excerpt or summary or strip HTML from content
         let description = article.excerpt || article.summary || '';
         if (!description && article.content) {
            description = article.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...';
         }

         setMeta('property', 'og:title', article.title);
         setMeta('property', 'og:description', description);
         if (article.image) {
            setMeta('property', 'og:image', article.image);
         }
         setMeta('property', 'og:url', window.location.href);
         setMeta('property', 'og:type', 'article');
      }
   }, [article]);

   if (loading) {
      return (
         <div
            className={styles.articlePage}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
         >
            <div className="loading-spinner" style={{ fontSize: '1.5rem', color: 'var(--gold-primary)' }}>
               Đang tải bài viết...
            </div>
         </div>
      );
   }

   if (error || !article) {
      return (
         <div className={styles.notFound}>
            <h1>Không tìm thấy bài viết</h1>
            <p>{error || 'Rất tiếc, chúng tôi không thể tìm thấy bài viết bạn đang yêu cầu.'}</p>
            <Link to="/" className={styles.link}>
               Quay lại Trang chủ
            </Link>
         </div>
      );
   }

   // Default tags if article doesn't have custom ones or if tags is an empty array
   const tags =
      article.tags?.length > 0
         ? article.tags
         : ['Kinh tế Việt Nam', 'GDP', 'Tăng trưởng', 'Chính sách', 'Doanh nghiệp'];

   const categoryInfo = CATEGORY_MAP[article.category] || { name: 'Tin tức', slug: 'news', color: '#D4AF37' };

   const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const decreaseFontSize = () => {
      if (fontSizeMultiplier > 0.8) {
         setFontSizeMultiplier((prev) => Math.round((prev - 0.1) * 10) / 10);
      }
   };

   const increaseFontSize = () => {
      if (fontSizeMultiplier < 1.5) {
         setFontSizeMultiplier((prev) => Math.round((prev + 0.1) * 10) / 10);
      }
   };

   const renderContent = () => {
      if (!article.content) return null;
      let finalContent = article.content;
      if (typeof window !== 'undefined' && window.DOMParser) {
         try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(finalContent, 'text/html');
            const imgs = doc.querySelectorAll('img');
            const seen = new Set();
            imgs.forEach((img) => {
               // Normalise src by removing query params for comparison to catch resized variants
               const rawSrc = img.src.split('?')[0];
               if (seen.has(rawSrc)) {
                  img.remove();
               } else {
                  seen.add(rawSrc);
               }
            });
            finalContent = doc.body.innerHTML;
         } catch (e) {}
      }
      return <div className={styles.htmlContent} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(finalContent) }} />;
   };

   return (
      <div className={styles.articlePage}>
         {/* Toast Notification for copying link */}
         {copied && <div className={styles.toast}>Đã sao chép liên kết thành công!</div>}
         {savedToast && <div className={styles.toast}>Đã lưu thành công!</div>}

         {/* Save Modal */}
         {showSaveModal && (
            <div className={styles.modalOverlay} onClick={() => setShowSaveModal(false)}>
               <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <h3>Lưu bài viết</h3>
                  <div className={styles.modalBody}>
                     <label>Chọn thư mục:</label>
                     <select
                        value={saveFolderName}
                        onChange={(e) => setSaveFolderName(e.target.value)}
                        className={styles.folderSelect}
                     >
                        {existingFolders.map((f) => (
                           <option key={f} value={f}>
                              {f}
                           </option>
                        ))}
                        <option value="NEW">-- Tạo thư mục mới --</option>
                     </select>

                     {saveFolderName === 'NEW' && (
                        <input
                           type="text"
                           placeholder="Nhập tên thư mục mới..."
                           className={styles.folderInput}
                           value={newFolderInput}
                           onChange={(e) => setNewFolderInput(e.target.value)}
                           autoFocus
                        />
                     )}
                  </div>
                  <div className={styles.modalActions}>
                     <button className={styles.btnCancel} onClick={() => setShowSaveModal(false)}>
                        Hủy
                     </button>
                     <button className={styles.btnConfirm} onClick={confirmSave}>
                        Lưu
                     </button>
                  </div>
               </div>
            </div>
         )}

         <div className={styles.container}>
            {/* Breadcrumb Navigation */}
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
               <Link to="/">Trang chủ</Link>
               <span className={styles.breadcrumbSeparator}>›</span>
               <Link to={`/category/${article.category}`}>{categoryInfo.name}</Link>
               {article.subCategory && (
                  <>
                     <span className={styles.breadcrumbSeparator}>›</span>
                     <span className={styles.breadcrumbCurrent}>{article.subCategory}</span>
                  </>
               )}
            </nav>

            <div className={styles.pageLayout}>
               {/* MAIN COLUMN (LEFT) */}
               <article className={styles.mainColumn}>
                  {/* Category Badge */}
                  <div className={styles.badgeWrapper}>
                     <Link
                        to={`/category/${article.category}`}
                        className={styles.categoryBadge}
                        style={{ '--category-color': categoryInfo.color }}
                     >
                        {categoryInfo.name.toUpperCase()}
                     </Link>
                  </div>

                  {/* Title */}
                  <h1 className={styles.title}>{article.title}</h1>

                  {/* Metadata & Author Details */}
                  <div className={styles.metaRow}>
                     <div className={styles.authorMeta}>
                        <svg
                           className={styles.metaIcon}
                           width="14"
                           height="14"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                        >
                           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                           <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className={styles.authorName}>{article.author_name || article.author || 'Tác giả'}</span>
                     </div>
                     <div className={styles.dateMeta}>
                        <svg
                           className={styles.metaIcon}
                           width="14"
                           height="14"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                        >
                           <circle cx="12" cy="12" r="10" />
                           <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <time dateTime={article.publishedAt || article.createdAt}>
                           {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}{' '}
                           {new Date(article.publishedAt || article.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                           })}
                        </time>
                     </div>
                     <div className={styles.readMeta}>
                        <svg
                           className={styles.metaIcon}
                           width="14"
                           height="14"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                        >
                           <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                           <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>{article.readTime || 5} phút đọc</span>
                     </div>
                  </div>

                  {/* Sapo (Excerpt) */}
                  {article.excerpt && <div className={styles.sapo}>{article.excerpt}</div>}

                  {/* Toolbar: Font Sizing & Share Actions */}
                  <div className={styles.toolbar}>
                     <div className={styles.shareActions}>
                        <span className={styles.toolbarLabel}>Chia sẻ:</span>
                        <ShareButtonsGroup 
                           shareUrl={typeof window !== 'undefined' ? window.location.href : ''} 
                           handleCopyLink={handleCopyLink} 
                           copied={copied} 
                        />
                        {/* Bookmark button */}
                        {loggedInUser && (
                           <button
                              className={`${styles.toolBtn} ${isBookmarked ? styles.bookmarked : ''}`}
                              onClick={onClickSave}
                              disabled={bookmarkLoading}
                              aria-label={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                              title={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                           >
                              <svg
                                 width="16"
                                 height="16"
                                 fill={isBookmarked ? 'currentColor' : 'none'}
                                 stroke="currentColor"
                                 strokeWidth="2"
                                 viewBox="0 0 24 24"
                              >
                                 <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                              </svg>
                           </button>
                        )}
                        <button
                           className={`${styles.toolBtnWithCount} ${isLiked ? styles.liked : ''}`}
                           onClick={handleToggleLike}
                           disabled={likeLoading}
                           aria-label={isLiked ? 'Bỏ thích' : 'Thích bài viết'}
                           title={isLiked ? 'Bỏ thích' : 'Thích bài viết'}
                        >
                           <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill={isLiked ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2"
                           >
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                           </svg>
                           {likeCount > 0 && <span className={styles.likeCountInline}>{likeCount}</span>}
                        </button>
                     </div>

                     <div className={styles.textAdjust}>
                        <span className={styles.aaLabel}>Aa</span>
                        <button
                           className={styles.adjustBtn}
                           onClick={decreaseFontSize}
                           disabled={fontSizeMultiplier <= 0.8}
                           aria-label="Giảm cỡ chữ"
                        >
                           <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                           >
                              <line x1="5" y1="12" x2="19" y2="12" />
                           </svg>
                        </button>
                        <span className={styles.fontSizePercent}>{Math.round(fontSizeMultiplier * 100)}%</span>
                        <button
                           className={styles.adjustBtn}
                           onClick={increaseFontSize}
                           disabled={fontSizeMultiplier >= 1.5}
                           aria-label="Tăng cỡ chữ"
                        >
                           <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                           >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                           </svg>
                        </button>
                        <div className={styles.toolbarDivider}></div>
                        <button className={styles.toolBtn} onClick={() => window.print()} aria-label="In bài viết">
                           <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                           >
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                           </svg>
                        </button>
                     </div>
                  </div>

                  {/* Hero Image */}
                  {!(article.content && /<img/i.test(article.content)) && (
                     <div className={styles.heroWrapper}>
                        <img
                           src={article.image || 'https://via.placeholder.com/800x600?text=No+Image'}
                           alt={article.title}
                           className={styles.heroImage}
                        />
                        {article.caption && <div className={styles.heroCaption}>{article.caption}</div>}
                     </div>
                  )}

                  {/* Article content (Adjustable text size) */}
                  <div className={styles.articleContent} style={{ fontSize: `${fontSizeMultiplier * 1.05}rem` }}>
                     {renderContent()}
                  </div>

                  {/* Share actions at the bottom of the article */}
                  <div className={styles.bottomShareToolbar} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bg-border)' }}>
                     <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Chia sẻ bài viết này:</span>
                     <ShareButtonsGroup 
                        shareUrl={typeof window !== 'undefined' ? window.location.href : ''} 
                        handleCopyLink={handleCopyLink} 
                        copied={copied} 
                     />
                  </div>

                  {/* ========== COMMENT SECTION ========== */}
                  <section className={styles.commentsSection} id="comments-section">
                     <div className={styles.commentsHead}>
                        <svg
                           className={styles.commentIcon}
                           width="20"
                           height="20"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                        >
                           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <h3 className={styles.commentsTitle}>BÌNH LUẬN ({comments.length})</h3>
                     </div>

                     {/* Comment Input Box */}
                     <div className={styles.commentInputBox}>
                        <div className={styles.commentAvatar}>
                           {loggedInUser ? (
                              loggedInUser.avatar ? (
                                 <img
                                    src={loggedInUser.avatar}
                                    alt={loggedInUser.fullName || 'User'}
                                    className={styles.avatarImg}
                                 />
                              ) : (
                                 <div className={styles.avatarEmpty}>
                                    {(loggedInUser.fullName || 'U').charAt(0).toUpperCase()}
                                 </div>
                              )
                           ) : (
                              <div className={styles.avatarEmpty}>?</div>
                           )}
                        </div>
                        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                           <textarea
                              className={styles.commentTextarea}
                              placeholder={
                                 loggedInUser ? 'Viết bình luận của bạn...' : 'Vui lòng đăng nhập để bình luận'
                              }
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value.slice(0, 1000))}
                              maxLength={1000}
                              disabled={!loggedInUser}
                           />
                           <div className={styles.commentFormBottom}>
                              <div className={styles.commentFormTools} style={{ position: 'relative' }}>
                                 <button
                                    type="button"
                                    className={styles.toolIconBtn}
                                    aria-label="Thêm emoji"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                 >
                                    😊
                                 </button>
                                 {showEmojiPicker && (
                                    <div className={styles.emojiPicker}>
                                       {EMOJI_LIST.map((emoji) => (
                                          <button
                                             key={emoji}
                                             type="button"
                                             className={styles.emojiBtn}
                                             onClick={() => {
                                                setNewCommentText((prev) => prev + emoji);
                                                setShowEmojiPicker(false);
                                             }}
                                          >
                                             {emoji}
                                          </button>
                                       ))}
                                    </div>
                                 )}
                              </div>
                              <div className={styles.commentFormSubmitRow}>
                                 <span className={styles.charCounter}>{newCommentText.length}/1000</span>
                                 <button
                                    type="submit"
                                    className={styles.btnSubmitComment}
                                    disabled={!newCommentText.trim() || !loggedInUser}
                                 >
                                    Gửi bình luận
                                 </button>
                              </div>
                           </div>
                        </form>
                     </div>

                     {/* Tabs Header */}
                     <div className={styles.commentTabs}>
                        <button
                           className={`${styles.tabBtn} ${activeTab === 'newest' ? styles.tabBtnActive : ''}`}
                           onClick={() => setActiveTab('newest')}
                        >
                           MỚI NHẤT
                        </button>
                        <button
                           className={`${styles.tabBtn} ${activeTab === 'popular' ? styles.tabBtnActive : ''}`}
                           onClick={() => setActiveTab('popular')}
                        >
                           ĐƯỢC QUAN TÂM NHẤT
                        </button>
                     </div>

                     {/* Comments List */}
                     <div className={styles.commentsList}>
                        {comments.length === 0 ? (
                           <p style={{ color: '#888', marginTop: '1rem' }}>Chưa có bình luận nào.</p>
                        ) : (
                           comments.map((comment) => (
                              <div key={comment.id} className={styles.commentItem}>
                                 <div className={styles.commentMain}>
                                    <div className={styles.commentHeader}>
                                       <div className={styles.commentUserAvatar}>
                                          {comment.avatar || comment.userAvatar ? (
                                             <img
                                                src={comment.avatar || comment.userAvatar}
                                                alt={comment.user_name || comment.userName || 'User'}
                                                className={styles.avatarImg}
                                             />
                                          ) : (
                                             <div className={styles.avatarEmpty}>
                                                {(comment.user_name || comment.userName || 'U').charAt(0).toUpperCase()}
                                             </div>
                                          )}
                                       </div>
                                       <div className={styles.commentMeta}>
                                          <span className={styles.commentAuthorName}>
                                             {comment.user_name || comment.userName || 'Người dùng'}
                                          </span>
                                          <span className={styles.commentTime}>{getTimeAgo(comment.createdAt)}</span>
                                       </div>
                                    </div>
                                    <p className={styles.commentTextContent}>{comment.content}</p>
                                    <div className={styles.commentActions}>
                                       <button
                                          className={`${styles.actionBtn} ${comment.liked ? styles.actionBtnLiked : ''}`}
                                          onClick={() => handleLikeComment(comment.id)}
                                       >
                                          <svg
                                             width="12"
                                             height="12"
                                             viewBox="0 0 24 24"
                                             fill={comment.liked ? 'currentColor' : 'none'}
                                             stroke="currentColor"
                                             strokeWidth="2"
                                          >
                                             <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                          </svg>
                                          <span>{comment.likes || 0}</span>
                                       </button>
                                       <button
                                          className={styles.actionTextBtn}
                                          onClick={() =>
                                             setNewCommentText(`@${comment.user_name || comment.userName || 'User'} `)
                                          }
                                       >
                                          Trả lời
                                       </button>
                                       <button
                                          className={`${styles.actionTextBtn} ${styles.btnReportComment}`}
                                          onClick={() => handleReportComment(comment.id)}
                                       >
                                          <svg
                                             width="12"
                                             height="12"
                                             viewBox="0 0 24 24"
                                             fill="none"
                                             stroke="currentColor"
                                             strokeWidth="2"
                                             style={{ marginRight: '3px', verticalAlign: 'middle' }}
                                          >
                                             <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                             <line x1="4" y1="22" x2="4" y2="15" />
                                          </svg>
                                          Báo cáo
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>

                     {comments.length > 0 && (
                        <button className={styles.btnLoadMoreComments}>
                           Xem thêm bình luận
                           <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ marginLeft: '6px' }}
                           >
                              <polyline points="6 9 12 15 18 9" />
                           </svg>
                        </button>
                     )}
                  </section>
               </article>

               {/* SIDEBAR (RIGHT) */}
               <aside className={styles.sidebar}>
                  {/* Tin liên quan */}
                  {relatedArticles.length > 0 && (
                     <div className={styles.sidebarBlock}>
                        <div className={styles.sidebarHead}>
                           <svg
                              className={styles.goldIcon}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="var(--gold-primary)"
                           >
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                           </svg>
                           <h3 className={styles.sidebarTitle}>TIN LIÊN QUAN</h3>
                        </div>
                        <div className={styles.relatedList}>
                           {relatedArticles.map((relArticle) => (
                              <Link key={relArticle.id} to={`/article/${relArticle.id}`} className={styles.relatedItem}>
                                 <div className={styles.relatedImgWrapper}>
                                    <img
                                       src={relArticle.image || 'https://via.placeholder.com/150x150?text=No+Image'}
                                       alt={relArticle.title}
                                       className={styles.relatedImg}
                                    />
                                 </div>
                                 <div className={styles.relatedText}>
                                    <h4 className={styles.relatedTitleText}>{relArticle.title}</h4>
                                    <span className={styles.relatedTime}>
                                       <svg
                                          width="10"
                                          height="10"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2.5"
                                       >
                                          <circle cx="12" cy="12" r="10" />
                                          <polyline points="12 6 12 12 16 14" />
                                       </svg>
                                       {getTimeAgo(relArticle.publishedAt || relArticle.createdAt)}
                                    </span>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Chủ đề nổi bật */}
                  <div className={styles.sidebarBlock}>
                     <div className={styles.sidebarHead}>
                        <svg
                           className={styles.goldIcon}
                           width="16"
                           height="16"
                           viewBox="0 0 24 24"
                           fill="var(--gold-primary)"
                        >
                           <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                        </svg>
                        <h3 className={styles.sidebarTitle}>CHỦ ĐỀ NỔI BẬT</h3>
                     </div>
                     <div className={styles.tagCloud}>
                        {tags.map((tag, i) => (
                           <Link key={i} to={`/search?q=${encodeURIComponent(tag)}`} className={styles.tagItem}>
                              # {tag}
                           </Link>
                        ))}
                     </div>
                  </div>

                  {/* Đọc nhiều */}
                  {mostReadArticles.length > 0 && (
                     <div className={styles.sidebarBlock}>
                        <div className={styles.sidebarHead}>
                           <svg
                              className={styles.goldIcon}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="var(--gold-primary)"
                           >
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                           </svg>
                           <h3 className={styles.sidebarTitle}>ĐỌC NHIỀU</h3>
                        </div>
                        <div className={styles.mostReadList}>
                           {mostReadArticles.map((mrArticle, index) => (
                              <Link key={mrArticle.id} to={`/article/${mrArticle.id}`} className={styles.mostReadItem}>
                                 <span className={styles.rankNumber}>{index + 1}</span>
                                 <div className={styles.mostReadText}>
                                    <h4 className={styles.mostReadTitleText}>{mrArticle.title}</h4>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}
               </aside>
            </div>
         </div>
      </div>
   );
}

export default ArticleDetailPage;
