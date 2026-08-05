import React, { useState, useEffect } from 'react';
import styles from './EditorDashboard.module.css';
import { editorAPI, tokenStorage } from '../../utils/api';

import SidebarNav from './components/SidebarNav';
import ArticleReviewCard from './components/ArticleReviewCard';
import GuidelinesPanel from './components/GuidelinesPanel';
import ProfilePanel from './components/ProfilePanel';
import EditorDashboardOverview from './components/EditorDashboardOverview';
import EditorPendingTable from './components/EditorPendingTable';

export default function EditorDashboard() {
   const [activeTab, setActiveTab] = useState('dashboard');
   const [pendingArticles, setPendingArticles] = useState([]);
   const [approvedArticles, setApprovedArticles] = useState([]);
   const [rejectedArticles, setRejectedArticles] = useState([]);
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [user] = useState(() => tokenStorage.getUser());

   const fetchDashboardData = async () => {
      setLoading(true);
      try {
         const [pending, approved, rejected, statsData] = await Promise.all([
            editorAPI.getPendingArticles(100, 0),
            editorAPI.getApprovedArticles(100, 0),
            editorAPI.getRejectedArticles(100, 0),
            editorAPI.getStats(),
         ]);
         setPendingArticles(pending || []);
         setApprovedArticles(approved || []);
         setRejectedArticles(rejected || []);
         setStats(statsData || { articlesReviewed: 0, articlesApproved: 0, articlesRejected: 0 });
      } catch (err) {
         console.error('Failed to load editor dashboard data:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDashboardData();
   }, []);

   const handleApprove = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn phê duyệt bài viết này không?')) return;
      try {
         await editorAPI.approveArticle(id);
         alert('Phê duyệt bài viết thành công!');
         fetchDashboardData();
      } catch (err) {
         alert('Duyệt bài thất bại: ' + err.message);
      }
   };

   const handleReject = async (id) => {
      const reason = window.prompt('Vui lòng nhập lý do từ chối bài viết:');
      if (reason === null) return;
      try {
         await editorAPI.rejectArticle(id, reason || 'Nội dung không phù hợp tiêu chuẩn.');
         alert('Đã từ chối bài viết thành công.');
         fetchDashboardData();
      } catch (err) {
         alert('Từ chối bài thất bại: ' + err.message);
      }
   };

   const handleSuggestEdit = async (id) => {
      const suggestion = window.prompt('Nhập ý kiến đề xuất sửa đổi gửi tới tác giả:');
      if (!suggestion) return;
      try {
         await editorAPI.suggestEdit(id, suggestion);
         alert('Đã gửi ý kiến đề xuất chỉnh sửa!');
         fetchDashboardData();
      } catch (err) {
         alert('Gửi đề xuất thất bại: ' + err.message);
      }
   };

   return (
      <div className={styles.editorDashboard}>
         <SidebarNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingCount={pendingArticles.length}
            approvedCount={approvedArticles.length}
            rejectedCount={rejectedArticles.length}
         />

         <main className={styles.mainContent}>
            {loading ? (
               <div
                  style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--gold-primary)' }}
               >
                  Đang tải dữ liệu biên tập...
               </div>
            ) : (
               <>
                  {activeTab === 'dashboard' && (
                     <EditorDashboardOverview
                        stats={stats}
                        pendingArticles={pendingArticles}
                        approvedArticles={approvedArticles}
                        rejectedArticles={rejectedArticles}
                        onTabChange={setActiveTab}
                     />
                  )}

                  {activeTab === 'pending' && (
                     <EditorPendingTable
                        articles={pendingArticles}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onSuggest={handleSuggestEdit}
                     />
                  )}

                  {activeTab === 'approved' && (
                     <section className={styles.listSection}>
                        <h1>Bài Viết Đã Duyệt ({approvedArticles.length})</h1>
                        {approvedArticles.length === 0 ? (
                           <p style={{ color: 'rgba(255,255,255,0.4)' }}>Danh sách trống.</p>
                        ) : (
                           <div className={styles.articlesTable}>
                              <div className={styles.tableHeader}>
                                 <span>Tiêu đề</span>
                                 <span>Tác giả</span>
                                 <span>Ngày gửi</span>
                                 <span>Trạng thái</span>
                              </div>
                              {approvedArticles.map((article) => {
                                 const authorName = article.authorName || article.author || 'Tác giả';
                                 return (
                                    <div key={article.id} className={styles.tableRow}>
                                       <span className={styles.title}>{article.title}</span>
                                       <span>{authorName}</span>
                                       <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                                       <span style={{ color: '#2ed573' }}>✅ Đã duyệt</span>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </section>
                  )}

                  {activeTab === 'rejected' && (
                     <section className={styles.listSection}>
                        <h1>Bài Viết Bị Từ Chối ({rejectedArticles.length})</h1>
                        {rejectedArticles.length === 0 ? (
                           <p style={{ color: 'rgba(255,255,255,0.4)' }}>Danh sách trống.</p>
                        ) : (
                           <div className={styles.articlesTable}>
                              <div className={styles.tableHeader}>
                                 <span>Tiêu đề</span>
                                 <span>Tác giả</span>
                                 <span>Lý do từ chối</span>
                                 <span>Trạng thái</span>
                              </div>
                              {rejectedArticles.map((article) => {
                                 const authorName = article.authorName || article.author || 'Tác giả';
                                 return (
                                    <div key={article.id} className={styles.tableRow}>
                                       <span className={styles.title}>{article.title}</span>
                                       <span>{authorName}</span>
                                       <span style={{ color: '#ff4757', fontSize: '0.8rem' }}>
                                          {article.rejectionReason || 'Không phù hợp.'}
                                       </span>
                                       <span style={{ color: '#ff4757' }}>❌ Từ chối</span>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </section>
                  )}

                  {activeTab === 'guidelines' && <GuidelinesPanel />}

                  {activeTab === 'profile' && <ProfilePanel user={user} stats={stats} />}
               </>
            )}
         </main>
      </div>
   );
}
