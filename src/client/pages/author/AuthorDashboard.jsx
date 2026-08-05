import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthorDashboard.module.css';
import { authorAPI, tokenStorage } from '../../utils/api';

import SidebarNav from './components/SidebarNav';
import ArticleCard from './components/ArticleCard';
import EditorPanel from './components/EditorPanel';
import ProfilePanel from './components/ProfilePanel';
import AuthorDashboardOverview from './components/AuthorDashboardOverview';

export default function AuthorDashboard() {
   const [activeTab, setActiveTab] = useState('dashboard');
   const [editingArticle, setEditingArticle] = useState(null);
   const [articles, setArticles] = useState([]);
   const [loading, setLoading] = useState(true);
   const [user] = useState(() => tokenStorage.getUser());

   const fetchArticles = async () => {
      setLoading(true);
      try {
         const data = await authorAPI.getMyArticles(100, 0);
         setArticles(data || []);
      } catch (err) {
         console.error('Failed to fetch articles:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchArticles();
   }, []);

   const handleDeleteArticle = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bài nháp này không?')) return;
      try {
         await authorAPI.deleteArticle(id);
         alert('Xóa bài viết thành công!');
         fetchArticles();
      } catch (err) {
         alert('Xóa thất bại: ' + err.message);
      }
   };

   const handleEditArticle = async (article) => {
      try {
         const fullArticle = await authorAPI.getArticle(article.id);
         setEditingArticle(fullArticle);
         setActiveTab('write');
      } catch (err) {
         console.error('Failed to fetch full article:', err);
         setEditingArticle(article);
         setActiveTab('write');
      }
   };

   const handleSubmitArticle = async (id) => {
      if (!window.confirm('Bạn muốn gửi duyệt bài viết này? Sau khi gửi sẽ không thể chỉnh sửa.')) return;
      try {
         await authorAPI.submitArticle(id);
         alert('Gửi duyệt bài viết thành công!');
         fetchArticles();
      } catch (err) {
         alert('Gửi duyệt thất bại: ' + err.message);
      }
   };

   const draftArticles = articles.filter((a) => a.status === 'draft' || a.status === 'rejected');
   const pendingArticles = articles.filter((a) => a.status === 'pending');
   const publishedArticles = articles.filter((a) => a.status === 'published' || a.status === 'approved');

   return (
      <div className={styles.authorDashboard}>
         <SidebarNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            draftCount={draftArticles.length}
            pendingCount={pendingArticles.length}
            publishedCount={publishedArticles.length}
         />

         <main className={styles.mainContent}>
            {loading ? (
               <div
                  style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--gold-primary)' }}
               >
                  Đang tải dữ liệu tác giả...
               </div>
            ) : (
               <>
                  {activeTab === 'dashboard' && (
                     <AuthorDashboardOverview articles={articles} onTabChange={setActiveTab} />
                  )}

                  {activeTab === 'write' && (
                     <EditorPanel
                        initialData={editingArticle}
                        onCancelEdit={() => {
                           setEditingArticle(null);
                           setActiveTab('drafts');
                        }}
                        onArticleCreated={(isDraft) => {
                           fetchArticles();
                           if (!isDraft) {
                              setEditingArticle(null);
                              setActiveTab('dashboard');
                           }
                        }}
                     />
                  )}

                  {activeTab === 'drafts' && (
                     <section className={styles.listSection}>
                        <h1>Bài viết nháp & cần chỉnh sửa</h1>
                        {draftArticles.length === 0 ? (
                           <p style={{ color: 'rgba(255,255,255,0.4)' }}>Không có bài viết nháp nào.</p>
                        ) : (
                           <div className={styles.articlesGrid}>
                              {draftArticles.map((article) => (
                                 <ArticleCard
                                    key={article.id}
                                    article={article}
                                    status={article.status}
                                    onDelete={handleDeleteArticle}
                                    onSubmit={handleSubmitArticle}
                                    onEdit={handleEditArticle}
                                 />
                              ))}
                           </div>
                        )}
                     </section>
                  )}

                  {activeTab === 'pending' && (
                     <section className={styles.listSection}>
                        <h1>Bài viết chờ duyệt</h1>
                        {pendingArticles.length === 0 ? (
                           <p style={{ color: 'rgba(255,255,255,0.4)' }}>Không có bài viết đang chờ duyệt.</p>
                        ) : (
                           <div className={styles.articlesGrid}>
                              {pendingArticles.map((article) => (
                                 <ArticleCard key={article.id} article={article} status={article.status} />
                              ))}
                           </div>
                        )}
                     </section>
                  )}

                  {activeTab === 'published' && (
                     <section className={styles.listSection}>
                        <h1>Bài viết đã đăng</h1>
                        {publishedArticles.length === 0 ? (
                           <p style={{ color: 'rgba(255,255,255,0.4)' }}>Không có bài viết đã đăng.</p>
                        ) : (
                           <div className={styles.articlesGrid}>
                              {publishedArticles.map((article) => (
                                 <ArticleCard key={article.id} article={article} status="published" />
                              ))}
                           </div>
                        )}
                     </section>
                  )}


                  {activeTab === 'profile' && (
                     <ProfilePanel
                        user={user}
                        articlesCount={publishedArticles.length}
                        viewsCount={publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0)}
                     />
                  )}
               </>
            )}
         </main>
      </div>
   );
}
