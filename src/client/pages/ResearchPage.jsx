import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ResearchPage.module.css';

const CATEGORIES = [
  'Tất cả', 'AI', 'Công nghệ', 'Y học', 'Kinh tế', 'Giáo dục', 'Môi trường', 'Vật lý', 'Toán học'
];

export default function ResearchPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArticles();
  }, [activeCat, page]);

  const fetchArticles = async (searchQuery = search) => {
    setLoading(true);
    try {
      let url = `/api/research?limit=9&offset=${(page - 1) * 9}`;
      if (activeCat !== 'Tất cả') url += `&category=${encodeURIComponent(activeCat)}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles(search);
  };

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <h1>Thư viện Nghiên cứu Khoa học</h1>
        <p>Khám phá hàng ngàn công trình nghiên cứu chuyên sâu đa lĩnh vực</p>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Tìm kiếm bài nghiên cứu, tác giả..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">Tìm kiếm</button>
        </form>
      </div>

      <div className={styles.filterBar}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            className={`${styles.filterBtn} ${activeCat === cat ? styles.active : ''}`}
            onClick={() => { setActiveCat(cat); setPage(1); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className={styles.grid}>
            {articles.map(article => (
              <Link to={`/research/${article.id}`} key={article.id} className={styles.card}>
                <div className={styles.thumbnail}>
                  <img src={article.thumbnail || 'https://via.placeholder.com/400x250?text=Research'} alt={article.title} />
                  <span className={styles.categoryBadge}>{article.category}</span>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{article.title}</h3>
                  <p className={styles.summary}>{article.summary}</p>
                  <div className={styles.meta}>
                    <span className={styles.author}>👤 {article.author}</span>
                    <span className={styles.time}>
                      <span style={{color: 'var(--gold-primary)', fontWeight: 'bold', marginRight: '10px'}}>
                        🔒 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(article.price || 50000)}
                      </span>
                      ⏱ {article.readingTime} phút đọc
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Trang trước
              </button>
              <span className={styles.pageInfo}>Trang {page} / {totalPages}</span>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
