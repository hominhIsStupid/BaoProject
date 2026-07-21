import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './ResearchDetailPage.module.css';
import { tokenStorage } from '../../utils/api';

export default function ResearchDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const token = tokenStorage.get();
      const user = tokenStorage.getUser();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      let isUnlocked = true; // Bỏ qua khóa tạm thời để user kiểm tra nội dung
      if (user) {
        const unlockedStr = localStorage.getItem('unlocked_articles') || '[]';
        const unlockedList = JSON.parse(unlockedStr);
        if (unlockedList.includes(id) || user.role === 'admin') {
          isUnlocked = true;
        }
      }

      // Pass mock params for backend to bypass JWT if using mock auth
      const query = `?mockRole=${user?.role || ''}&mockId=${user?.id || ''}&mockPurchased=${isUnlocked}`;

      const res = await fetch(`/api/research/${id}${query}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    const user = tokenStorage.getUser();
    if (!user) {
      alert('Vui lòng đăng nhập để mở khóa bài viết');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      alert('Bạn là admin nên không bị giới hạn.');
      return;
    }

    const price = article.price || 50000;
    const confirmMsg = `Bạn muốn dùng gói Premium hay thanh toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)} để mở khóa bài này? (Bấm OK để tiếp tục, Cancel để hủy)`;
    
    if (window.confirm(confirmMsg)) {
      try {
        const walletStr = localStorage.getItem('rongvang_wallet');
        let wallet = walletStr ? JSON.parse(walletStr) : { balance: 0, plan: null, dailyUsed: 0 };
        
        let unlocked = false;
        
        // 1. Check premium plan first
        if (wallet.plan && wallet.plan !== 'none') {
           const maxDaily = wallet.plan === 'pro' ? 9999 : wallet.plan === 'v2' ? 4 : 2;
           if (wallet.plan === 'pro' || wallet.dailyUsed < maxDaily) {
              wallet.dailyUsed += 1;
              unlocked = true;
           } else {
              if (window.confirm(`Gói ${wallet.plan.toUpperCase()} của bạn đã hết lượt đọc hôm nay. Bạn có muốn dùng ${price}đ trong số dư để mua lẻ không?`)) {
                 if (wallet.balance >= price) {
                    wallet.balance -= price;
                    unlocked = true;
                 } else {
                    alert('Số dư của bạn không đủ để thanh toán. Vui lòng nạp thêm tiền!');
                 }
              }
           }
        } 
        // 2. Check balance if no plan
        else {
           if (wallet.balance >= price) {
              wallet.balance -= price;
              unlocked = true;
           } else {
              alert('Số dư của bạn không đủ. Vui lòng vào mục Tài khoản & Premium để nạp thêm tiền!');
           }
        }

        if (unlocked) {
           // Save to unlocked list
           const unlockedList = JSON.parse(localStorage.getItem('unlocked_articles') || '[]');
           if (!unlockedList.includes(id)) {
              unlockedList.push(id);
              localStorage.setItem('unlocked_articles', JSON.stringify(unlockedList));
           }
           // Save wallet
           localStorage.setItem('rongvang_wallet', JSON.stringify(wallet));
           
           alert('Mở khóa thành công! Chúc bạn đọc bài vui vẻ.');
           fetchArticle(); // Reload article to get full content
        }

      } catch (err) {
        alert('Có lỗi xảy ra: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (!article) {
    return (
      <div className={styles.notFound}>
        <h2>Không tìm thấy bài nghiên cứu</h2>
        <Link to="/research">Quay lại thư viện</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/research" className={styles.backBtn}>← Quay lại thư viện</Link>
      
      <div className={styles.header}>
        <span className={styles.category}>{article.category}</span>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.meta}>
          <span className={styles.author}>Tác giả: {article.author}</span>
          <span className={styles.divider}>|</span>
          <span className={styles.date}>Ngày đăng: {new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
          <span className={styles.divider}>|</span>
          <span className={styles.time}>Thời gian đọc: {article.readingTime} phút</span>
        </div>
      </div>

      {article.thumbnail && !(article.content && /<img/i.test(article.content)) && (
        <div className={styles.thumbnailWrapper}>
          <img src={article.thumbnail} alt={article.title} className={styles.thumbnail} />
        </div>
      )}

      <div className={styles.summaryBox}>
        <strong>Tóm tắt nghiên cứu:</strong>
        <p>{article.summary}</p>
      </div>

      <div className={styles.content}>
        {/* Render HTML content if purchased, otherwise show fade effect */}
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: (() => {
             let html = article.content;
             if (typeof window !== 'undefined' && window.DOMParser) {
                try {
                   const parser = new DOMParser();
                   const doc = parser.parseFromString(html, 'text/html');
                   const imgs = doc.querySelectorAll('img');
                   const seen = new Set();
                   imgs.forEach(img => {
                      const rawSrc = img.src.split('?')[0];
                      if (seen.has(rawSrc)) {
                         img.remove();
                      } else {
                         seen.add(rawSrc);
                      }
                   });
                   html = doc.body.innerHTML;
                } catch(e) {}
             }
             return html;
          })() }} />
        ) : (
          <div style={{ position: 'relative' }}>
            <div dangerouslySetInnerHTML={{ __html: article.contentPreview || '<h2>Mở đầu</h2><p>Phần nội dung mở đầu của bài nghiên cứu đang bị làm mờ...</p>' }} style={{ filter: 'blur(6px)', opacity: 0.4, userSelect: 'none', pointerEvents: 'none' }} />
            
            <div className={styles.premiumPlaceholder} style={{ position: 'absolute', top: '10px', left: 0, right: 0, marginTop: 0 }}>
              <div className={styles.premiumIcon}>🔒</div>
              <h3>Nội dung Premium</h3>
              <p>Phần còn lại của bài nghiên cứu này dành riêng cho hội viên đã mở khóa.</p>
              <h2 style={{ color: 'var(--gold-primary)', margin: '1rem 0' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(article.price || 50000)}
              </h2>
              <button className={styles.premiumBtn} onClick={handleBuy} style={{ opacity: 1, cursor: 'pointer' }}>
                Mua bài viết
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
