import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { adminAPI, commentsAPI } from '../../utils/api';

import SidebarNav from './components/SidebarNav';
import DashboardOverview from './components/DashboardOverview';
import ArticlesPendingTable from './components/ArticlesPendingTable';
import ArticlesApprovedTable from './components/ArticlesApprovedTable';
import ArticlesManagementTable from './components/ArticlesManagementTable';
import CategoriesManagement from './components/CategoriesManagement';
import CommentsManagement from './components/CommentsManagement';
import UsersManagement from './components/UsersManagement';
import SystemLogs from './components/SystemLogs';
import SystemSettings from './components/SystemSettings';
import ResearchManagement from './components/ResearchManagement';

export default function AdminDashboard() {
   const [activeTab, setActiveTab] = useState('dashboard');
   const [articles, setArticles] = useState([]);
   const [categories, setCategories] = useState([]);
   const [users, setUsers] = useState([]);
   const [comments, setComments] = useState([]);
   const [logs, setLogs] = useState([]);
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);

   const fetchAdminData = async () => {
      setLoading(true);
      try {
         const [allArticles, allCategories, allUsers, allLogs, statsData, allComments] = await Promise.all([
            adminAPI.getAllArticles(200, 0),
            adminAPI.getCategories(),
            adminAPI.getUsers(200, 0),
            adminAPI.getLogs(50, 0),
            adminAPI.getStats(),
            commentsAPI.getAll(),
         ]);
         setArticles(allArticles || []);
         setCategories(allCategories || []);
         setUsers(allUsers || []);
         setLogs(allLogs || []);
         setStats(statsData || null);
         setComments(allComments || []);
      } catch (err) {
         console.error('Failed to load admin dashboard data:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchAdminData();
   }, []);

   const handlePublish = async (id) => {
      if (!window.confirm('Bạn có muốn xuất bản bài viết này lên trang chủ công khai không?')) return;
      try {
         await adminAPI.publishArticle(id);
         alert('Đã xuất bản bài viết thành công!');
         fetchAdminData();
      } catch (err) {
         alert('Xuất bản thất bại: ' + err.message);
      }
   };

   const handleDeleteArticle = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) return;
      try {
         // Cập nhật ngay lập tức
         setArticles((prev) => prev.filter((a) => a.id !== id));
         await adminAPI.deleteArticle(id);
         // alert('Đã xóa bài viết khỏi hệ thống!');
      } catch (err) {
         alert('Xóa bài viết thất bại: ' + err.message);
         fetchAdminData(); // Phục hồi lại dữ liệu nếu lỗi
      }
   };

   const handleCreateCategory = async (catData) => {
      try {
         const newCat = await adminAPI.createCategory(catData);
         // Cập nhật ngay lập tức
         if (newCat && newCat.category) {
            setCategories((prev) => [...prev, newCat.category]);
         } else {
            fetchAdminData(); // fallback
         }
      } catch (err) {
         alert('Tạo chuyên mục thất bại: ' + err.message);
      }
   };

   const handleUpdateCategory = async (id, data) => {
      // Cập nhật ngay lập tức
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      try {
         await adminAPI.updateCategory(id, data);
      } catch (err) {
         alert('Cập nhật chuyên mục thất bại: ' + err.message);
         fetchAdminData(); // Phục hồi dữ liệu
      }
   };

   const handleDeleteCategory = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa chuyên mục này không?')) return;
      // Cập nhật ngay lập tức
      setCategories((prev) => prev.filter((c) => c.id !== id));
      try {
         await adminAPI.deleteCategory(id);
      } catch (err) {
         alert('Xóa chuyên mục thất bại: ' + err.message);
         fetchAdminData(); // Phục hồi dữ liệu
      }
   };

   const handleUpdateUserRole = async (userId, role) => {
      // Cập nhật ngay lập tức
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      try {
         await adminAPI.updateUserRole(userId, role);
      } catch (err) {
         alert('Cập nhật vai trò thất bại: ' + err.message);
         fetchAdminData();
      }
   };

   const handleSuspendUser = async (userId) => {
      // Cập nhật ngay lập tức
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u)));
      try {
         await adminAPI.suspendUser(userId);
      } catch (err) {
         alert('Khóa tài khoản thất bại: ' + err.message);
         fetchAdminData();
      }
   };

   const handleActivateUser = async (userId) => {
      // Cập nhật ngay lập tức
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u)));
      try {
         await adminAPI.activateUser(userId);
      } catch (err) {
         alert('Mở khóa tài khoản thất bại: ' + err.message);
         fetchAdminData();
      }
   };

   const handleUpdateWallet = async (userId, addedBalance, plan) => {
      // Cập nhật ngay lập tức
      setUsers((prev) =>
         prev.map((u) => {
            if (u.id === userId) {
               return {
                  ...u,
                  balance: u.balance + Number(addedBalance),
                  plan: plan,
               };
            }
            return u;
         })
      );
      try {
         await adminAPI.updateUserWallet(userId, addedBalance, plan);
      } catch (err) {
         alert('Cập nhật ví thất bại: ' + err.message);
         fetchAdminData();
      }
   };

   const handleDeleteComment = async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return;
      // Cập nhật ngay lập tức
      setComments((prev) => prev.filter((c) => c.id !== id));
      try {
         await commentsAPI.delete(id);
         // Không cần fetchAdminData lại trừ khi lỗi
      } catch (err) {
         alert('Xóa bình luận thất bại: ' + err.message);
         fetchAdminData();
      }
   };

   const handleUpdateCommentStatus = async (id, status) => {
      // Cập nhật ngay lập tức
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      try {
         await commentsAPI.updateStatus(id, status);
      } catch (err) {
         alert('Cập nhật thất bại: ' + err.message);
         fetchAdminData();
      }
   };

   const pendingArticles = articles.filter((a) => a.status === 'pending');
   const approvedArticles = articles.filter((a) => a.status === 'approved');

   return (
      <div className={styles.adminDashboard}>
         <SidebarNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingCount={pendingArticles.length}
            approvedCount={approvedArticles.length}
         />

         <main className={styles.mainContent}>
            {loading ? (
               <div
                  style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--gold-primary)' }}
               >
                  Đang tải dữ liệu hệ thống quản trị...
               </div>
            ) : (
               <>
                  {activeTab === 'dashboard' && (
                     <DashboardOverview stats={stats} articles={articles} users={users} onTabChange={setActiveTab} />
                  )}
                  {activeTab === 'articles-pending' && (
                     <ArticlesPendingTable articles={pendingArticles} onPublish={handlePublish} />
                  )}
                  {activeTab === 'articles-approved' && (
                     <ArticlesApprovedTable articles={approvedArticles} onPublish={handlePublish} />
                  )}
                  {activeTab === 'articles-manage' && (
                     <ArticlesManagementTable
                        articles={articles}
                        onDelete={handleDeleteArticle}
                        onRefresh={fetchAdminData}
                     />
                  )}
                  {activeTab === 'categories-manage' && (
                     <CategoriesManagement
                        categories={categories}
                        onCreate={handleCreateCategory}
                        onDelete={handleDeleteCategory}
                        onUpdate={handleUpdateCategory}
                     />
                  )}
                  {activeTab === 'comments-manage' && (
                     <CommentsManagement
                        comments={comments}
                        onDelete={handleDeleteComment}
                        onUpdateStatus={handleUpdateCommentStatus}
                     />
                  )}
                  {activeTab === 'users-manage' && (
                     <UsersManagement
                        users={users}
                        onUpdateRole={handleUpdateUserRole}
                        onSuspend={handleSuspendUser}
                        onActivate={handleActivateUser}
                        onUpdateWallet={handleUpdateWallet}
                     />
                  )}
                  {activeTab === 'research-manage' && <ResearchManagement />}
                  {activeTab === 'logs' && <SystemLogs logs={logs} />}
                  {activeTab === 'settings' && <SystemSettings />}
               </>
            )}
         </main>
      </div>
   );
}
