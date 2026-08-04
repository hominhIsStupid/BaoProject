import React from 'react';
import styles from '../AuthorDashboard.module.css';

// Công thức quy đổi thu nhập (đơn vị: USD)
// - Mỗi 1,000 lượt xem   = $0.50  (CPM kiểu quảng cáo)
// - Mỗi lượt thích       = $0.005 (engagement bonus)
// - Bonus viral: +20% nếu lượt thích > 2x lượt xem (bài viết phổ biến cao)
const RATE_PER_1K_VIEWS = 0.5;
const RATE_PER_LIKE = 0.005;
const ENGAGEMENT_MULTIPLIER = 1.2;

function calcEarnings(article) {
   const views = article.views || 0;
   const likes = article.likes || 0;
   const viewEarnings = (views / 1000) * RATE_PER_1K_VIEWS;
   const likeEarnings = likes * RATE_PER_LIKE;
   const engagementRate = views > 0 ? likes / views : 0;
   const engagementBonus = engagementRate > 2.0 ? (viewEarnings + likeEarnings) * (ENGAGEMENT_MULTIPLIER - 1) : 0;
   const total = viewEarnings + likeEarnings + engagementBonus;
   return { viewEarnings, likeEarnings, engagementBonus, total, engagementRate };
}

export default function EarningsPanel({ publishedArticles }) {
   const totalViews = publishedArticles.reduce((s, a) => s + (a.views || 0), 0);
   const totalLikes = publishedArticles.reduce((s, a) => s + (a.likes || 0), 0);
   const totalEarnings = publishedArticles.reduce((s, a) => s + calcEarnings(a).total, 0);
   const avgEngagement = totalViews > 0 ? (totalLikes / totalViews).toFixed(1) : '0.0';

   return (
      <div className={styles.earningsPanel}>
         <h1>Thu nhập của tôi 💰</h1>

         <div className={styles.earningsSummary}>
            <div className={styles.earningsCard}>
               <div className={styles.earningsCardIcon}>💵</div>
               <div className={styles.earningsCardBody}>
                  <span className={styles.earningsCardLabel}>Tổng thu nhập ước tính</span>
                  <span className={styles.earningsCardValue} style={{ color: '#4caf50' }}>
                     ${totalEarnings.toFixed(2)}
                  </span>
               </div>
            </div>
            <div className={styles.earningsCard}>
               <div className={styles.earningsCardIcon}>👁️</div>
               <div className={styles.earningsCardBody}>
                  <span className={styles.earningsCardLabel}>Tổng lượt xem</span>
                  <span className={styles.earningsCardValue}>{totalViews.toLocaleString()}</span>
               </div>
            </div>
            <div className={styles.earningsCard}>
               <div className={styles.earningsCardIcon}>❤️</div>
               <div className={styles.earningsCardBody}>
                  <span className={styles.earningsCardLabel}>Tổng lượt thích</span>
                  <span className={styles.earningsCardValue}>{totalLikes.toLocaleString()}</span>
               </div>
            </div>
            <div className={styles.earningsCard}>
               <div className={styles.earningsCardIcon}>📈</div>
               <div className={styles.earningsCardBody}>
                  <span className={styles.earningsCardLabel}>Tỉ lệ tương tác trung bình</span>
                  <span className={styles.earningsCardValue}>{avgEngagement}x</span>
               </div>
            </div>
         </div>

         <div className={styles.rateBox}>
            <h3 className={styles.rateTitle}>📋 Công thức quy đổi thu nhập</h3>
            <div className={styles.rateGrid}>
               <div className={styles.rateItem}>
                  <span className={styles.rateIcon}>👁️</span>
                  <div>
                     <strong>Lượt xem</strong>
                     <p>$0.50 / 1,000 lượt xem</p>
                  </div>
               </div>
               <div className={styles.rateItem}>
                  <span className={styles.rateIcon}>❤️</span>
                  <div>
                     <strong>Lượt thích</strong>
                     <p>$0.005 / lượt thích</p>
                  </div>
               </div>
               <div className={styles.rateItem}>
                  <span className={styles.rateIcon}>🚀</span>
                  <div>
                     <strong>Bonus Viral</strong>
                     <p>+20% nếu lượt thích &gt; 2x lượt xem</p>
                  </div>
               </div>
            </div>
         </div>

         <div className={styles.earningsTableWrap}>
            <h2>Chi tiết từng bài viết (sắp xếp theo thu nhập)</h2>
            {publishedArticles.length === 0 ? (
               <p style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem 0' }}>Chưa có bài viết đã đăng nào.</p>
            ) : (
               <table className={styles.earningsTable}>
                  <thead>
                     <tr>
                        <th>Bài viết</th>
                        <th>Lượt xem</th>
                        <th>Lượt thích</th>
                        <th>Tỉ lệ (like/view)</th>
                        <th>Thu nhập xem</th>
                        <th>Thu nhập like</th>
                        <th>Bonus tương tác</th>
                        <th className={styles.totalCol}>Tổng (USD)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {publishedArticles
                        .slice()
                        .sort((a, b) => calcEarnings(b).total - calcEarnings(a).total)
                        .map((article) => {
                           const { viewEarnings, likeEarnings, engagementBonus, total, engagementRate } =
                              calcEarnings(article);
                           const isHighEngagement = engagementRate > 0.05;
                           return (
                              <tr key={article.id}>
                                 <td className={styles.articleTitleCell}>
                                    <span className={styles.articleTitleText} title={article.title}>
                                       {article.title}
                                    </span>
                                 </td>
                                 <td className={styles.numCell}>{(article.views || 0).toLocaleString()}</td>
                                 <td className={styles.numCell}>{(article.likes || 0).toLocaleString()}</td>
                                 <td className={styles.numCell}>
                                    <span
                                       className={isHighEngagement ? styles.engagementHigh : styles.engagementNormal}
                                    >
                                       {engagementRate.toFixed(1)}x{isHighEngagement && ' 🔥 Viral'}
                                    </span>
                                 </td>
                                 <td className={styles.numCell}>${viewEarnings.toFixed(3)}</td>
                                 <td className={styles.numCell}>${likeEarnings.toFixed(3)}</td>
                                 <td className={styles.numCell}>
                                    {engagementBonus > 0 ? (
                                       <span className={styles.bonusPositive}>+${engagementBonus.toFixed(3)}</span>
                                    ) : (
                                       <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                                    )}
                                 </td>
                                 <td className={styles.totalCol}>
                                    <span className={styles.totalEarnings}>${total.toFixed(3)}</span>
                                 </td>
                              </tr>
                           );
                        })}
                  </tbody>
                  <tfoot>
                     <tr>
                        <td
                           colSpan={7}
                           style={{
                              textAlign: 'right',
                              fontWeight: 700,
                              padding: '0.8rem 0.6rem',
                              color: 'var(--text-secondary)',
                           }}
                        >
                           TỔNG CỘNG
                        </td>
                        <td className={styles.totalCol}>
                           <span className={styles.grandTotal}>${totalEarnings.toFixed(2)}</span>
                        </td>
                     </tr>
                  </tfoot>
               </table>
            )}
         </div>

         <p className={styles.earningsDisclaimer}>
            ⚠️ Đây là thu nhập <strong>ước tính</strong> dựa trên công thức quy đổi nội bộ của toà soạn. Số tiền thực tế
            sẽ được thanh toán vào cuối tháng sau khi ban biên tập xác nhận.
         </p>
      </div>
   );
}
