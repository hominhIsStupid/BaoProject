# Tính Năng Sản Phẩm (Product Features) - Báo Rồng Vàng

## 1. Tổng Quan Về Hệ Thống Tính Năng

Hệ thống tính năng của **Báo Rồng Vàng** được thiết kế nhằm mục đích xây dựng một nền tảng báo điện tử hiện đại, nhanh chóng, dễ tiếp cận và có tính cá nhân hóa cao. Các tính năng được phân bổ theo 5 giai đoạn phát triển (Phases) chiến lược từ cốt lõi (MVP) đến nâng cao (AI & Kiếm tiền), đảm bảo tính ổn định tối đa trước khi mở rộng.

---

## 2. Chi Tiết Các Tính Năng Theo Module

### Module 1: Đọc Tin Tức Cốt Lõi (Core News Reading)

_Module này cung cấp các tính năng thiết yếu nhất để độc giả có thể tiếp cận tin tức một cách mượt mà và trực quan._

#### F1.1: Trang Chủ Với Danh Sách Bài Viết (Home Grid Layout)

- **Mô tả**: Giao diện trang chủ hiển thị danh sách bài viết mới nhất và nổi bật.
- **Tính năng con**:
   - Bố cục lưới đáp ứng (3 cột trên Desktop, 2 cột trên Tablet, 1 cột trên Mobile).
   - Thẻ bài viết hiển thị hình ảnh tối ưu, tiêu đề, tóm tắt (2-3 dòng), tác giả và ngày xuất bản.
- **Giá trị**: Giúp độc giả nhanh chóng bao quát và khám phá nội dung mới ngay khi truy cập.
- **Độ ưu tiên**: Cao (Phải có)
- **Giai đoạn**: Phase 1 (MVP)

#### F1.2: Trang Chi Tiết Bài Viết (Article Detail View)

- **Mô tả**: Hiển thị nội dung đầy đủ của bài viết được chọn.
- **Tính năng con**:
   - Hỗ trợ định dạng văn bản đa dạng (HTML/Markdown).
   - Tích hợp hình ảnh chất lượng cao và nút chia sẻ nhanh.
   - Đề xuất các bài viết liên quan ở cuối bài.
- **Giá trị**: Cung cấp trải nghiệm đọc tập trung, tối ưu hóa về mặt thị giác cho độc giả.
- **Độ ưu tiên**: Cao (Phải có)
- **Giai đoạn**: Phase 1 (MVP)

#### F1.3: Chức Năng Tìm Kiếm (Search Functionality)

- **Mô tả**: Tìm kiếm bài viết theo từ khóa.
- **Tính năng con**:
   - Ô tìm kiếm tích hợp trên Header của tất cả các trang.
   - Trang hiển thị kết quả tìm kiếm có hỗ trợ phân trang khi số lượng kết quả lớn (>20).
   - Tìm kiếm không phân biệt chữ hoa, chữ thường.
- **Giá trị**: Giúp người dùng dễ dàng chủ động định vị thông tin cần tìm kiếm.
- **Độ ưu tiên**: Cao (Phải có)
- **Giai đoạn**: Phase 1 (MVP)

#### F1.4: Bộ Lọc Danh Mục (Category Filter)

- **Mô tả**: Phân loại và lọc tin tức theo các chuyên mục chuyên biệt.
- **Tính năng con**:
   - 7 danh mục chính: _Chính Trị, Kinh Tế, Công Nghệ, Thể Thao, Giải Trí, Sức Khỏe, Lối Sống_.
   - Hiển thị số lượng bài viết đi kèm mỗi danh mục.
- **Giá trị**: Giúp người đọc phân nhóm và chỉ tiếp cận những chủ đề phù hợp với mối quan tâm cá nhân.
- **Độ ưu tiên**: Cao (Phải có)
- **Giai đoạn**: Phase 1 (MVP)

#### F1.5: Bài Viết Nổi Bật/Xu Hướng (Featured & Trending)

- **Mô tả**: Hệ thống tự động đẩy các bài viết có lượt tương tác lớn lên vị trí dễ thấy.
- **Tính năng con**:
   - Khu vực "Bài Viết Nổi Bật" (Featured) nằm nổi bật ở đầu trang chủ.
   - Danh sách "Bài Viết Xu Hướng" (Trending) được cập nhật định kỳ mỗi 24 giờ dựa trên số lượng lượt xem.
- **Giá trị**: Tạo điểm nhấn thu hút và định hướng đọc cho khách truy cập.
- **Độ ưu tiên**: Trung bình
- **Giai đoạn**: Phase 1 (MVP)

---

### Module 2: Quản Lý Tài Khoản & Cá Nhân Hóa (User Account & Personalization)

_Module này tập trung vào việc định danh người dùng và cải thiện trải nghiệm cá nhân._

#### F2.1: Xác Thực Người Dùng (Authentication)

- **Mô tả**: Hệ thống đăng ký, đăng nhập và bảo mật tài khoản độc giả.
- **Tính năng con**:
   - Đăng ký bằng Email, Tên và Mật khẩu (được mã hóa mật khẩu qua bcrypt).
   - Xác thực tài khoản qua email để kích hoạt.
   - Cơ chế duy trì phiên đăng nhập an toàn bằng JWT (JSON Web Token).
   - Tính năng đặt lại mật khẩu qua email khi người dùng quên.
- **Giá trị**: Đảm bảo an toàn thông tin và tạo nền tảng lưu trữ dữ liệu cá nhân.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 2

#### F2.2: Lưu Trữ & Đánh Dấu Bài Viết (Bookmarks)

- **Mô tả**: Cho phép độc giả lưu trữ những nội dung hay để đọc lại sau.
- **Tính năng con**:
   - Nút "Đánh dấu" nhanh hiển thị trên trang chi tiết bài viết.
   - Trang quản lý "Danh sách lưu trữ" trong tài khoản cá nhân.
- **Giá trị**: Giúp độc giả tích lũy kiến thức và lưu lại tài liệu quan trọng mà không mất thời gian tìm kiếm lại.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 2

#### F2.3: Lịch Sử Đọc (Reading History)

- **Mô tả**: Ghi nhận tự động các nội dung người dùng đã xem.
- **Tính năng con**:
   - Tự động lưu lịch sử bài viết kèm thời gian đọc cụ thể.
   - Tính năng "Tiếp tục đọc" cho phép người đọc mở lại bài viết đang đọc dở ở đúng vị trí cũ.
   - Tùy chọn xóa lịch sử đọc để bảo vệ quyền riêng tư.
- **Giá trị**: Tối ưu hóa trải nghiệm đọc liên tục trên nhiều thiết bị.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 2

#### F2.4: Tùy Biến Giao Diện & Tùy Chọn (User Preferences)

- **Mô tả**: Cá nhân hóa giao diện đọc tin tức của từng người dùng.
- **Tính năng con**:
   - Chuyển đổi Chủ Đề Sáng / Tối (Light/Dark Mode) giảm mỏi mắt.
   - Điều chỉnh kích thước phông chữ (Nhỏ/Vừa/Lớn).
   - Thiết lập danh mục ưu tiên hiển thị trên trang chủ cá nhân.
- **Giá trị**: Đem lại trải nghiệm đọc tin thoải mái nhất cho từng cá nhân, đặc biệt là vào ban đêm.
- **Độ ưu tiên**: Trung bình
- **Giai đoạn**: Phase 2

---

### Module 3: Quản Lý Nội Dung & Xuất Bản (CMS - Content Management System)

_Dành riêng cho đội ngũ sản xuất nội dung (Tác giả, Biên tập viên, Quản trị viên) nhằm vận hành quy trình xuất bản._

#### F3.1: Bảng Điều Khiển Tác Giả (Writer Dashboard)

- **Mô tả**: Không gian làm việc của nhà báo để quản lý bài viết của mình.
- **Tính năng con**:
   - Trình soạn thảo WYSIWYG hiện đại, hỗ trợ Markdown và tải lên hình ảnh.
   - Tính năng tự động lưu bản nháp (Auto-save) mỗi 30 giây để tránh mất dữ liệu.
   - Quản lý trạng thái bài viết: _Nháp, Chờ Duyệt, Yêu Cầu Sửa Đổi, Đã Xuất Bản_.
- **Giá trị**: Tối giản hóa quy trình viết và gửi bài cho các nhà báo.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 3

#### F3.2: Bảng Điều Khiển Biên Tập (Editor Dashboard)

- **Mô tả**: Công cụ thẩm định và kiểm soát chất lượng của biên tập viên.
- **Tính năng con**:
   - Danh sách bài viết chờ duyệt được sắp xếp theo thời gian gửi.
   - Tính năng Nhận xét nội tuyến (Inline commenting) trực tiếp trên từng đoạn văn trong bài viết của tác giả.
   - Phê duyệt trực tiếp để xuất bản hoặc từ chối kèm phản hồi chi tiết.
- **Giá trị**: Đảm bảo tính nhất quán, độ chính xác và chất lượng báo chí trước khi nội dung tiếp cận độc giả.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 3

---

### Module 4: Kiếm Tiền & Đăng Ký Gói (Monetization & Subscriptions)

_Hỗ trợ hoạt động thương mại hóa và tạo doanh thu bền vững cho tòa soạn._

#### F4.1: Mô Hình Gói Đăng Ký (Subscription Plans)

- **Mô tả**: Phân quyền truy cập theo 3 mức độ thành viên.
- **Chi tiết các gói**:
   - **Gói Basic (Miễn phí)**: Đọc bài viết cơ bản, có quảng cáo.
   - **Gói Premium ($4.99/tháng)**: Không quảng cáo, được đọc bài viết chuyên sâu (Premium).
   - **Gói Premium+ ($9.99/tháng)**: Quyền lợi gói Premium cộng thêm quyền truy cập các ấn phẩm độc quyền và nhận hỗ trợ ưu tiên.
- **Giá trị**: Đa dạng hóa lựa chọn cho người dùng và tối ưu hóa doanh thu.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 3

#### F4.2: Tích Hợp Thanh Toán Stripe (Payment Gateway)

- **Mô tả**: Hệ thống thanh toán trực tuyến bảo mật.
- **Tính năng con**:
   - Tích hợp Stripe API xử lý giao dịch thẻ tín dụng quốc tế an toàn.
   - Tự động gửi hóa đơn và quản lý chu kỳ gia hạn/hủy gói tự động.
- **Giá trị**: Giảm thiểu ma sát thanh toán, tạo lòng tin cho người dùng khi nâng cấp gói.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 3

#### F4.3: Tường Phí Bảo Vệ Nội Dung (Paywall System)

- **Mô tả**: Ngăn chặn người dùng chưa nâng cấp tiếp cận các bài viết độc quyền.
- **Tính năng con**:
   - Đánh dấu bài viết nhạy cảm/chuyên sâu là "Premium".
   - Chỉ hiển thị tóm tắt (20% nội dung) kèm biểu mẫu kêu gọi nâng cấp đối với tài khoản thường.
- **Giá trị**: Khuyến khích người dùng đăng ký trả phí để trải nghiệm toàn bộ nội dung.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 3

---

### Module 5: Công Cụ Khuyến Nghị AI & Thông Báo (AI Engine & Engagement)

_Sử dụng công nghệ để gia tăng tỷ lệ giữ chân và mức độ tương tác của độc giả._

#### F5.1: Gợi Ý Bài Viết Cá Nhân Hóa

- **Mô tả**: Thuật toán phân tích hành vi độc giả để đưa ra gợi ý phù hợp.
- **Tính năng con**:
   - Phân tích lịch sử đọc bài, danh mục ưa thích để tạo luồng tin tức "Khuyến Nghị Cho Bạn" trên trang chủ.
   - Sử dụng thuật toán lọc cộng tác (Collaborative Filtering) để tìm kiếm nội dung tương đồng.
- **Giá trị**: Gia tăng đáng kể thời gian ở lại trang (session duration) và số trang xem mỗi phiên.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 5

#### F5.2: Hệ Thống Thông Báo Thông Minh (Smart Notifications)

- **Mô tả**: Gửi thông báo cập nhật kịp thời đến độc giả.
- **Tính năng con**:
   - Gửi bản tin tóm tắt hàng ngày (Daily Digest) qua Email.
   - Đẩy thông báo tin nóng (Breaking News) qua ứng dụng/trình duyệt web cho người dùng đăng ký nhận.
   - Cho phép người dùng tùy chỉnh tần suất và danh mục muốn nhận thông báo.
- **Giá trị**: Kéo người dùng quay lại trang thường xuyên, duy trì lượng truy cập ổn định.
- **Độ ưu tiên**: Cao
- **Giai đoạn**: Phase 5

---

## 3. Các Tính Năng Phi Chức Năng Cốt Lõi (Non-Functional Features)

Nhằm đảm bảo tầm nhìn "Tốc độ và sự tin cậy" của Báo Rồng Vàng, hệ thống tích hợp các tiêu chuẩn kỹ thuật nghiêm ngặt sau:

1. **Tối Ưu Hiệu Suất Tải Trang (Performance Optimization)**:
   - Tốc độ tải trang dưới 3 giây trên mọi môi trường mạng.
   - Sử dụng định dạng WebP cho toàn bộ ảnh trên hệ thống (kích thước tối đa 100KB) kèm lazy loading.
   - Code splitting và tối giản hóa dung lượng file Javascript bundle (<100KB gzipped).
2. **Khả Năng Tiếp Cận Toàn Diện (Accessibility)**:
   - Đạt tiêu chuẩn **WCAG 2.1 AA** cho người khuyết tật.
   - Hỗ trợ đầy đủ điều hướng bằng bàn phím và nhãn ARIA cho trình đọc màn hình.
   - Độ tương phản màu văn bản tối thiểu đạt tỷ lệ 4.5:1.
3. **Bảo Mật Hệ Thống (System Security)**:
   - Toàn bộ kết nối sử dụng giao thức HTTPS được mã hóa SSL/TLS.
   - Ngăn chặn triệt để các lỗ hổng OWASP phổ biến (SQL Injection, XSS) bằng cách validate và sanitize dữ liệu chặt chẽ cả ở Client và Server.

---

## 4. Tiêu Chí Hoàn Thành Một Tính Năng (Definition of Done)

Một tính năng chỉ được coi là hoàn tất và sẵn sàng phát hành khi đáp ứng đủ các tiêu chuẩn sau:

- [ ] Vượt qua toàn bộ các kịch bản kiểm thử tự động (Unit test coverage $\ge$ 80%).
- [ ] Giao diện được kiểm tra hiển thị đồng bộ trên các trình duyệt phổ biến (Chrome, Firefox, Safari, Edge) và mọi kích thước màn hình.
- [ ] Được đội ngũ thiết kế UX/UI xác nhận đạt yêu cầu về thẩm mỹ và độ mượt của hoạt ảnh (micro-animations).
- [ ] Được rà soát mã nguồn (Code review) bởi tối thiểu một thành viên có chuyên môn.
- [ ] Triển khai thành công lên môi trường Staging và được đội ngũ QA xác nhận không có lỗi nghiêm trọng (no blocking issues).
- [ ] Hoàn thiện tài liệu mô tả kỹ thuật và tài liệu hướng dẫn người dùng cuối.
