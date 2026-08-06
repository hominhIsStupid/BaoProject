import React, { useState, useMemo } from 'react';
import styles from '../AuthorDashboard.module.css';

export default function AuthorDashboardOverview({ articles = [], onTabChange }) {
   const [timeRange, setTimeRange] = useState('7');

   const chartData = useMemo(() => {
      const days = parseInt(timeRange);
      const now = new Date();

      const buckets = {};
      const labels = [];

      for (let i = days - 1; i >= 0; i--) {
         const d = new Date(now);
         d.setDate(now.getDate() - i);
         const dateStr = d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
         labels.push(dateStr);
         buckets[dateStr] = 0;
      }

      articles.forEach((item) => {
         if (!item.createdAt) return;
         const d = new Date(item.createdAt);
         const dateStr = d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
         if (buckets[dateStr] !== undefined) {
            buckets[dateStr]++;
         }
      });

      const values = labels.map((l) => buckets[l]);
      let maxVal = Math.max(...values);
      if (maxVal < 5) maxVal = 5; // minimum y-axis scale

      return { labels, values, maxVal };
   }, [timeRange, articles]);

   const statusData = useMemo(() => {
      let pending = 0,
         draft = 0,
         published = 0,
         rejected = 0;
      articles.forEach((a) => {
         if (a.status === 'pending') pending++;
         else if (a.status === 'draft') draft++;
         else if (a.status === 'published' || a.status === 'approved') published++;
         else if (a.status === 'rejected') rejected++;
         else draft++;
      });
      const total = pending + draft + published + rejected || 1;

      const p1 = (pending / total) * 100;
      const p2 = p1 + (draft / total) * 100;
      const p3 = p2 + (published / total) * 100;

      const gradient =
         total === 1 && pending === 0 && draft === 0 && published === 0 && rejected === 0
            ? 'conic-gradient(#333 0% 100%)' // empty state
            : `conic-gradient(#ffb300 0% ${p1}%, #1976d2 ${p1}% ${p2}%, #4caf50 ${p2}% ${p3}%, #f44336 ${p3}% 100%)`;

      return { pending, draft, published, rejected, gradient, total: total === 1 && pending === 0 ? 0 : total };
   }, [articles]);

   // Chart dimensions
   const w = 600;
   const h = 200;
   const pX = 40;
   const pY = 20;
   const uW = w - pX * 2;
   const uH = h - pY * 2;

   const stepX = chartData.labels.length > 1 ? uW / (chartData.labels.length - 1) : uW;

   const points = chartData.values
      .map((v, i) => {
         const x = pX + i * stepX;
         const y = h - pY - (v / chartData.maxVal) * uH;
         return `${x},${y}`;
      })
      .join(' ');

   const draftArticles = articles.filter((a) => a.status === 'draft' || a.status === 'rejected');
   const pendingArticles = articles.filter((a) => a.status === 'pending');
   const publishedArticles = articles.filter((a) => a.status === 'published' || a.status === 'approved');
   const totalViews = publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0);

   return (
      <section className={styles.dashboardSection}>
         <h1>Quản lý bài viết</h1>

         <div className={styles.statsGrid}>
            <div className={styles.statBox}>
               <div className={styles.statIcon} style={{ color: '#1976d2' }}>
                  📝
               </div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Nháp / Từ chối</div>
                  <div className={styles.statValue}>{draftArticles.length}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon} style={{ color: '#ffb300' }}>
                  ⏳
               </div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Chờ duyệt</div>
                  <div className={styles.statValue}>{pendingArticles.length}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon} style={{ color: '#4caf50' }}>
                  ✅
               </div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Đã đăng</div>
                  <div className={styles.statValue}>{publishedArticles.length}</div>
               </div>
            </div>
            <div className={styles.statBox}>
               <div className={styles.statIcon} style={{ color: '#ffc107' }}>
                  👁️
               </div>
               <div className={styles.statText}>
                  <div className={styles.statLabel}>Tổng lượt xem</div>
                  <div className={styles.statValue}>{totalViews}</div>
               </div>
            </div>
         </div>

         <div className={styles.chartsSection}>
            <div className={styles.chartBox}>
               <div className={styles.chartHeader} style={{ flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                     <h2>Số bài viết của bạn</h2>
                     <span>(số lượng bài viết)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={{
                           background: '#333',
                           color: '#fff',
                           border: '1px solid #444',
                           padding: '0.3rem 0.5rem',
                           borderRadius: '4px',
                           fontSize: '0.8rem',
                        }}
                     >
                        <option value="1">1 ngày</option>
                        <option value="3">3 ngày</option>
                        <option value="7">1 tuần</option>
                        <option value="14">2 tuần</option>
                        <option value="30">1 tháng</option>
                     </select>
                  </div>
               </div>

               <div className={styles.chartPlaceholder} style={{ background: 'transparent', padding: 0 }}>
                  <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                     {/* Horizontal grid lines */}
                     {[0, 0.5, 1].map((ratio) => {
                        const y = h - pY - ratio * uH;
                        return (
                           <g key={ratio}>
                              <line x1={pX} y1={y} x2={w} y2={y} stroke="#333" strokeDasharray="4 4" />
                              <text x={pX - 10} y={y + 4} fill="#888" fontSize="12" textAnchor="end">
                                 {Math.round(chartData.maxVal * ratio)}
                              </text>
                           </g>
                        );
                     })}

                     {/* X axis line */}
                     <line x1={pX} y1={h - pY} x2={w} y2={h - pY} stroke="#555" />

                     {/* X axis labels (skip some if too many) */}
                     {chartData.labels.map((label, i) => {
                        const showLabel =
                           chartData.labels.length <= 14 ||
                           i % Math.ceil(chartData.labels.length / 7) === 0 ||
                           i === chartData.labels.length - 1;
                        if (!showLabel) return null;
                        const x = pX + i * stepX;
                        return (
                           <text key={i} x={x} y={h - 2} fill="#888" fontSize="11" textAnchor="middle">
                              {label}
                           </text>
                        );
                     })}

                     {/* The Line */}
                     {chartData.values.length > 1 && (
                        <polyline points={points} fill="none" stroke="#ff5722" strokeWidth="3" strokeLinejoin="round" />
                     )}

                     {/* Data points */}
                     {chartData.values.map((v, i) => {
                        const x = pX + i * stepX;
                        const y = h - pY - (v / chartData.maxVal) * uH;
                        return <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#ff5722" strokeWidth="2" />;
                     })}
                  </svg>
               </div>
            </div>

            <div className={styles.chartBox}>
               <div className={styles.chartHeader}>
                  <h2>Tỷ lệ bài viết</h2>
               </div>
               <div className={styles.chartPlaceholder} style={{ flexDirection: 'column', background: 'transparent' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div
                        style={{
                           width: '120px',
                           height: '120px',
                           borderRadius: '50%',
                           background: statusData.gradient,
                           position: 'relative',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                        }}
                     >
                        <div
                           style={{
                              position: 'absolute',
                              top: '20px',
                              left: '20px',
                              right: '20px',
                              bottom: '20px',
                              background: '#1a1a1a',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                           }}
                        >
                           <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                              {statusData.total}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className={styles.legendGrid}>
                     <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ background: '#ffb300' }}></div>
                        <span>Chờ duyệt ({statusData.pending})</span>
                     </div>
                     <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ background: '#1976d2' }}></div>
                        <span>Bản nháp ({statusData.draft})</span>
                     </div>
                     <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ background: '#4caf50' }}></div>
                        <span>Đã đăng ({statusData.published})</span>
                     </div>
                     <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ background: '#f44336' }}></div>
                        <span>Bị từ chối ({statusData.rejected})</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
               <h2>Bài viết gần đây</h2>
               <button className={styles.btnViewAll} onClick={() => onTabChange && onTabChange('published')}>
                  Xem tất cả
               </button>
            </div>
            <table className={styles.recentTable}>
               <thead>
                  <tr>
                     <th>MÃ BÀI</th>
                     <th>TIÊU ĐỀ</th>
                     <th>CHUYÊN MỤC</th>
                     <th>THỜI GIAN</th>
                     <th>TRẠNG THÁI</th>
                     <th>THAO TÁC</th>
                  </tr>
               </thead>
               <tbody>
                  {articles.slice(0, 5).map((article) => (
                     <tr key={article.id}>
                        <td style={{ color: '#fff' }}>#{article.id.substring(0, 6)}</td>
                        <td style={{ color: '#fff', fontWeight: '500' }}>{article.title}</td>
                        <td>{article.category || 'Chung'}</td>
                        <td>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                           <span
                              style={{
                                 background:
                                    article.status === 'published' || article.status === 'approved'
                                       ? 'rgba(76, 175, 80, 0.2)'
                                       : 'rgba(255, 152, 0, 0.2)',
                                 color: (article.status === 'published' || article.status === 'approved') ? '#4caf50' : '#ff9800',
                                 padding: '0.2rem 0.6rem',
                                 borderRadius: '4px',
                                 fontSize: '0.75rem',
                                 fontWeight: '600',
                              }}
                           >
                              {article.status.toUpperCase()}
                           </span>
                        </td>
                        <td>
                           <button
                              style={{
                                 background: 'transparent',
                                 border: '1px solid #444',
                                 color: '#ccc',
                                 padding: '0.3rem 0.6rem',
                                 borderRadius: '4px',
                                 cursor: 'pointer',
                              }}
                              onClick={() => window.open(`/article/${article.id}`, '_blank')}
                           >
                              Chi tiết
                           </button>
                        </td>
                     </tr>
                  ))}
                  {articles.length === 0 && (
                     <tr>
                        <td colSpan="6" className={styles.recentEmpty}>
                           Không có bài viết nào gần đây.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </section>
   );
}
