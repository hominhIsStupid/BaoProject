# Báo Rồng Vàng (BaoProject)

**Báo Rồng Vàng** là nền tảng báo điện tử hiện đại dành cho độc giả hiện đại. Sứ mệnh của chúng tôi là giúp độc giả trên khắp thế giới khám phá, tiêu thụ và tương tác với nội dung tin tức đáng tin cậy thông qua một nền tảng kỹ thuật số nhanh chóng, dễ tiếp cận và trực quan.

Dự án được xây dựng với mục tiêu cung cấp trải nghiệm đọc tin tức ổn định, tối ưu hoá tốc độ tải trang, cùng giao diện UI/UX thiết kế theo tiêu chuẩn hiện đại, ưu tiên cho các thiết bị di động.

## 🚀 Công nghệ sử dụng (Tech Stack)

Dự án được phát triển theo kiến trúc ba tầng (Three-Tier Architecture):

- **Frontend**: React (Vite), React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (với công cụ quản lý DB tự xây dựng)
- **Khác**: Cheerio & RSS Parser (Thu thập dữ liệu), JWT (Authentication), Jest (Testing), Framer Motion (Animations)

## 📚 Tài liệu dự án (Documentation)

Toàn bộ tài liệu chi tiết của hệ thống được tổ chức trong thư mục `docs/`:

- **Định hướng sản phẩm**: `docs/productIdentity/` (Xem chi tiết [Tầm nhìn Sản phẩm](docs/productIdentity/PRODUCT_VISION.md))
- **Kiến trúc hệ thống**: `docs/architectures/` (Xem chi tiết [Kiến trúc](docs/architectures/ARCHITECTURE.md))
- **Hướng dẫn & API**: `docs/guides/`

---

## 💻 Hướng dẫn Cài đặt & Chạy Local

Do dự án sử dụng PostgreSQL làm hệ quản trị cơ sở dữ liệu, bạn cần thiết lập Database trước khi khởi động ứng dụng.

### 1. Cài đặt thư viện (Dependencies)

```bash
npm install
```

### 2. Thiết lập Biến môi trường (.env)

- Sao chép file `.env.example` thành file `.env`:

```bash
cp .env.example .env
```

- Mở file `.env` và cập nhật thông số `DATABASE_URL` theo Username và Password PostgreSQL trên hệ thống của bạn.
  Ví dụ: `postgresql://postgres:123456@localhost:5432/baorongvang`

### 3. Khởi tạo Database (Migration & Seed)

- Đảm bảo PostgreSQL service đang chạy.
- Tạo một database mới tên là `baorongvang` thông qua pgAdmin hoặc terminal (`psql`):

```sql
CREATE DATABASE baorongvang;
```

- Chạy lệnh sau để tự động tạo schema các bảng (Tables) và chèn dữ liệu mẫu (Seeding):

```bash
npm run db:reset-full
```

_(Lưu ý: Nếu cần cào thêm dữ liệu bài báo mới nhất, chạy lệnh `npm run scraper`)_

### 4. Khởi chạy dự án (Môi trường Development)

Dự án được cấu hình để khởi động cả Frontend (Vite) và Backend (Node) song song:

```bash
npm run dev
```

---

## 🛠 Triển khai (Build for Production)

- Build dự án (kết xuất ra thư mục `dist` / `build`):

```bash
npm run build
```

- Chạy bản build tĩnh bằng thư viện `serve`:

```bash
npm i -g serve
serve -s build
```

- _Nhấn `Ctrl + C` để dừng server._
