const { pool } = require('../config/database');
const Parser = require('rss-parser');
const cheerio = require('cheerio');

const parser = new Parser({
  customFields: {
    item: ['description']
  }
});

const RESEARCH_CATEGORIES = [
  { slug: 'khoahoc', name: 'Khoa học', url: 'https://vnexpress.net/rss/khoa-hoc.rss' },
  { slug: 'congnghe', name: 'Công nghệ', url: 'https://vnexpress.net/rss/so-hoa.rss' },
  { slug: 'suckhoe', name: 'Y học', url: 'https://vnexpress.net/rss/suc-khoe.rss' },
  { slug: 'giaoduc', name: 'Giáo dục', url: 'https://vnexpress.net/rss/giao-duc.rss' },
  { slug: 'khoahoc-tuoitre', name: 'Khoa học', url: 'https://tuoitre.vn/rss/khoa-hoc.rss' },
  { slug: 'suckhoe-tuoitre', name: 'Y học', url: 'https://tuoitre.vn/rss/suc-khoe.rss' },
  { slug: 'congnghe-tuoitre', name: 'Công nghệ', url: 'https://tuoitre.vn/rss/nhip-song-so.rss' },
  { slug: 'giaoduc-tuoitre', name: 'Giáo dục', url: 'https://tuoitre.vn/rss/giao-duc.rss' },
  { slug: 'kinhte-tuoitre', name: 'Kinh tế', url: 'https://tuoitre.vn/rss/kinh-doanh.rss' }
];

async function scrapeFullResearchContent(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let contentHtml = '';
    
    // VnExpress
    if (url.includes('vnexpress.net')) {
      $('.fck_detail').children().each((i, el) => {
        const tag = $(el).prop('tagName').toLowerCase();
        if (tag === 'p' && $(el).hasClass('Normal')) {
          contentHtml += `<p>${$(el).html()}</p>\n`;
        } else if (tag === 'figure') {
          const imgMeta = $(el).find('meta[itemprop="url"]').attr('content');
          let caption = $(el).find('figcaption').text().trim() || $(el).find('.Image').text().trim();
          
          if (imgMeta) {
            contentHtml += `
              <figure style="margin: 1.5rem 0; text-align: center;">
                <img src="${imgMeta}" alt="${caption}" style="max-width: 100%; border-radius: 8px;" />
                ${caption ? `<figcaption style="font-size: 0.9rem; color: #888; margin-top: 0.5rem;">${caption}</figcaption>` : ''}
              </figure>\n`;
          }
        } else if (tag === 'ul' || tag === 'ol') {
           contentHtml += `<${tag}>${$(el).html()}</${tag}>\n`;
        }
      });
      if (!contentHtml) {
        $('article.fck_detail p').each((i, el) => {
          contentHtml += `<p>${$(el).text().trim()}</p>\n`;
        });
      }
    } 
    // TuoiTre
    else if (url.includes('tuoitre.vn')) {
      $('.detail-content').children().each((i, el) => {
        const tag = $(el).prop('tagName').toLowerCase();
        if (tag === 'p') {
          contentHtml += `<p>${$(el).html()}</p>\n`;
        } else if (tag === 'figure' || tag === 'div') {
          const img = $(el).find('img').attr('src');
          const caption = $(el).find('figcaption, .PhotoCMS_Caption').text().trim();
          if (img) {
            contentHtml += `
              <figure style="margin: 1.5rem 0; text-align: center;">
                <img src="${img}" alt="${caption}" style="max-width: 100%; border-radius: 8px;" />
                ${caption ? `<figcaption style="font-size: 0.9rem; color: #888; margin-top: 0.5rem;">${caption}</figcaption>` : ''}
              </figure>\n`;
          }
        }
      });
    }

    return contentHtml;
  } catch (err) {
    console.error(`[Research Scraper] Failed to scrape ${url}:`, err.message);
    return '';
  }
}

async function runResearchScraper() {
  console.log('[Research Auto-Scraper] Bắt đầu lấy bài báo khoa học từ RSS...');
  
  try {
    const userRes = await pool.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    if (userRes.rows.length === 0) {
      console.warn('[Research Auto-Scraper] Không tìm thấy user admin. Hủy cào dữ liệu.');
      return;
    }
    const adminId = userRes.rows[0].id;

    let totalAdded = 0;
    for (const cat of RESEARCH_CATEGORIES) {
      try {
        const feed = await parser.parseURL(cat.url);
        const items = feed.items.slice(0, 5); // Lấy 5 bài mới nhất mỗi lần quét để giảm tải
        
        let added = 0;
        for (const item of items) {
          try {
            const sourceUrl = item.link;
            
            // Lấy URL hình ảnh
            let thumbnail = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800'; // Default science image
            // Tìm ảnh trong thẻ img (description) hoặc enclosure
            const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) {
              thumbnail = imgMatch[1];
            } else if (item.enclosure && item.enclosure.url) {
               thumbnail = item.enclosure.url;
            } else if (item.content?.match(/<img[^>]+src="([^">]+)"/)) {
               thumbnail = item.content.match(/<img[^>]+src="([^">]+)"/)[1];
            }

            // Dọn dẹp summary
            let summary = item.contentSnippet || item.description || '';
            summary = summary.replace(/<[^>]+>/g, '').substring(0, 250) + '...';

            const existingCheck = await pool.query('SELECT id FROM research_articles WHERE title = $1', [item.title]);
            if (existingCheck.rows.length > 0) continue;

            const content = await scrapeFullResearchContent(sourceUrl);
            if (!content || content.length < 200) {
              console.log(`[Research Auto-Scraper] Bài viết quá ngắn hoặc lỗi lấy nội dung: ${item.title}`);
              continue;
            }

            // Tạo giá random và thời gian đọc random
            const readingTime = Math.floor(Math.random() * 8) + 3; // 3 - 10 phút
            // Giá random 30.000đ, 50.000đ, 80.000đ, 100.000đ, 150.000đ
            const prices = [30000, 50000, 50000, 80000, 100000, 150000];
            const price = prices[Math.floor(Math.random() * prices.length)];

            await pool.query(
              `INSERT INTO research_articles 
                (title, summary, content, thumbnail, author, category, "readingTime", price, "createdAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
              [
                item.title,
                summary,
                content,
                thumbnail,
                item.creator || feed.title || 'Hệ thống tự động',
                cat.name, // Lấy tên category thay vì Nghiên cứu chung
                readingTime,
                price
              ]
            );

            added++;
            totalAdded++;
          } catch (itemErr) {
            console.error(`[Research Auto-Scraper] Lỗi bài báo ${item.link}:`, itemErr.message);
          }
        }
        
        console.log(`[Research Auto-Scraper] Chuyên mục ${cat.slug}: Thêm mới ${added} bài báo.`);
      } catch (feedErr) {
        console.error(`[Research Auto-Scraper] Lỗi feed ${cat.url}:`, feedErr.message);
      }
    }

    console.log(`[Research Auto-Scraper] Hoàn tất vòng quét. Đã thêm tổng cộng ${totalAdded} bài báo khoa học.`);

    // Cleanup: Chỉ giữ lại tối đa 50 bài báo mới nhất để DB không quá lớn
    try {
      await pool.query(`
        WITH RankedArticles AS (
          SELECT id, ROW_NUMBER() OVER(ORDER BY "createdAt" DESC) as rn
          FROM research_articles
        )
        DELETE FROM research_articles
        WHERE id IN (
          SELECT id FROM RankedArticles WHERE rn > 50
        )
      `);
      console.log('[Research Auto-Scraper] Đã dọn dẹp DB, giữ tối đa 50 bài.');
    } catch (cleanupErr) {
      console.error('[Research Auto-Scraper] Lỗi dọn dẹp DB:', cleanupErr.message);
    }

  } catch (err) {
    console.error('[Research Auto-Scraper] Lỗi tổng:', err.message);
  }
}

function startResearchScraperService() {
  // Chạy lần đầu sau 15 giây khi server start để không đụng với scraper thường
  setTimeout(() => {
    runResearchScraper();
  }, 15000);

  // Sau đó lặp lại mỗi 5 phút (5 * 60 * 1000 ms)
  setInterval(() => {
    runResearchScraper();
  }, 5 * 60 * 1000);
}

module.exports = { startResearchScraperService, runResearchScraper };
