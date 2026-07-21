const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const researchArticles = [
  {
    title: 'Mô hình Ngôn ngữ Lớn trong Y tế: Cơ hội và Thách thức',
    summary: 'Nghiên cứu đánh giá mức độ chính xác của các mô hình LLM trong việc hỗ trợ chẩn đoán lâm sàng và phân tích hồ sơ bệnh án điện tử.',
    content: '<h2>1. Mở đầu</h2><p>Trí tuệ nhân tạo đang làm thay đổi bộ mặt của ngành y tế...</p><h2>2. Phương pháp nghiên cứu</h2><p>Chúng tôi đã thử nghiệm GPT-4 và Med-PaLM trên 1000 hồ sơ bệnh án...</p><h2>3. Kết quả</h2><p>Mô hình đạt độ chính xác 85% trong việc đưa ra chẩn đoán sơ bộ...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    author: 'TS. Nguyễn Hoàng Yến',
    category: 'Y học',
    readingTime: 15,
    price: 50000
  },
  {
    title: 'Tác động của AI tạo sinh đến năng suất lập trình viên',
    summary: 'Phân tích thực nghiệm về thời gian hoàn thành tác vụ và chất lượng code khi sử dụng các công cụ như GitHub Copilot.',
    content: '<h2>1. Giới thiệu</h2><p>Sự ra đời của các công cụ hỗ trợ lập trình bằng AI...</p><h2>2. Thực nghiệm</h2><p>Quan sát 50 lập trình viên chia làm hai nhóm...</p><h2>3. Thảo luận</h2><p>Nhóm sử dụng AI hoàn thành công việc nhanh hơn 30% nhưng tỷ lệ lỗi bảo mật lại cao hơn 5%...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    author: 'PGS.TS Trần Văn Bình',
    category: 'Công nghệ',
    readingTime: 20,
    price: 80000
  },
  {
    title: 'Dự báo rủi ro tài chính sử dụng Học máy lượng tử',
    summary: 'Khám phá tiềm năng của máy tính lượng tử trong việc tối ưu hóa danh mục đầu tư và dự báo khủng hoảng.',
    content: '<h2>1. Giới thiệu Học máy lượng tử (QML)</h2><p>QML kết hợp sức mạnh tính toán lượng tử vào các thuật toán học máy...</p><h2>2. Mô hình</h2><p>Sử dụng thuật toán VQC (Variational Quantum Classifier)...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    author: 'ThS. Lê Minh Tuấn',
    category: 'Kinh tế',
    readingTime: 12,
    price: 100000
  },
  {
    title: 'Giáo dục cá nhân hóa trong kỷ nguyên số',
    summary: 'Đánh giá các nền tảng EdTech sử dụng AI để tạo ra lộ trình học tập riêng biệt cho từng học sinh.',
    content: '<h2>1. Đặt vấn đề</h2><p>Lớp học truyền thống không thể đáp ứng tốc độ học của từng cá nhân...</p><h2>2. Giải pháp AI</h2><p>Hệ thống tự động phân tích lỗ hổng kiến thức...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    author: 'TS. Phạm Quỳnh Hương',
    category: 'Giáo dục',
    readingTime: 10,
    price: 50000
  },
  {
    title: 'Vật liệu nano trong xử lý nước thải công nghiệp',
    summary: 'Nghiên cứu tính chất của graphene oxide trong việc hấp phụ kim loại nặng từ nguồn nước xả thải.',
    content: '<h2>1. Vật liệu Graphene Oxide</h2><p>Với diện tích bề mặt lớn, GO là ứng cử viên sáng giá...</p><h2>2. Thực nghiệm</h2><p>Pha chế dung dịch chứa ion chì (Pb2+)...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    author: 'KS. Vũ Hải Đăng',
    category: 'Môi trường',
    readingTime: 18,
    price: 120000
  },
  {
    title: 'Tối ưu hóa kiến trúc mạng nơ-ron bằng thuật toán di truyền',
    summary: 'Đề xuất phương pháp lai nghiệm giữa GA và tìm kiếm cấu trúc mạng (NAS) để giảm thiểu chi phí tính toán.',
    content: '<h2>1. Neural Architecture Search (NAS)</h2><p>Tìm kiếm cấu trúc tối ưu thường tốn hàng ngàn giờ GPU...</p><h2>2. Thuật toán di truyền</h2><p>Sử dụng cơ chế lai ghép và đột biến...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    author: 'TS. Đinh Công Trí',
    category: 'AI',
    readingTime: 25,
    price: 150000
  }
];

async function seedResearch() {
  try {
    console.log('Clearing existing research articles...');
    await pool.query('DELETE FROM research_articles');

    console.log('Inserting new research articles...');
    for (const article of researchArticles) {
      const query = `
        INSERT INTO research_articles (title, summary, content, thumbnail, author, category, "readingTime", price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const values = [
        article.title, article.summary, article.content, article.thumbnail, 
        article.author, article.category, article.readingTime, article.price
      ];
      await pool.query(query, values);
    }
    console.log('Successfully seeded 6 research articles!');
  } catch (err) {
    console.error('Error seeding research articles:', err);
  } finally {
    pool.end();
  }
}

seedResearch();
