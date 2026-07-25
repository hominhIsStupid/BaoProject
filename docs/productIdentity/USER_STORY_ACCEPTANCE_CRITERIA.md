# Hệ Thống User Stories & Acceptance Criteria - Báo Rồng Vàng

_Lưu ý: Các User Stories dưới đây được ánh xạ trực tiếp từ các Scenarios đã xây dựng nhằm đảm bảo tính nhất quán từ khâu phân tích kịch bản đến khâu đặc tả yêu cầu kỹ thuật._

---

## Phân hệ 1: Độc giả (End-Users)

### User Story 1: Chia sẻ tin tức nhanh chóng

**Là một** độc giả đại chúng (Trần Hải),
**Tôi muốn** có thể chia sẻ các bài báo giải trí/tin tức lên mạng xã hội (Facebook, Zalo) bằng một cú click chuột,
**Để** tôi có thể nhanh chóng thảo luận các tin tức thú vị cùng bạn bè.

**Acceptance Criteria (Tiêu chí nghiệm thu):**

1. Nút chia sẻ (Facebook, Zalo, Copy Link) phải được hiển thị rõ ràng ở cả đầu và cuối bài viết trên mọi kích thước màn hình (Mobile/Desktop).
2. Khi nhấn chia sẻ qua Facebook/Zalo, hệ thống tự động trích xuất đúng tiêu đề bài viết, ảnh thu nhỏ (thumbnail) và đoạn mô tả ngắn (meta description) lên bài đăng.
3. Liên kết được sao chép từ nút "Copy Link" phải dẫn chính xác đến bài viết hiện tại.

### User Story 2: Lưu trữ và phân loại tài liệu nghiên cứu

**Là một** sinh viên/nhà nghiên cứu (Lê Minh),
**Tôi muốn** lưu các bài phân tích chuyên sâu vào thư viện cá nhân và sắp xếp chúng theo từng thư mục tự tạo,
**Để** tôi có thể dễ dàng tìm lại chúng sau này phục vụ cho việc học tập hoặc tra cứu.

**Acceptance Criteria (Tiêu chí nghiệm thu):**

1. Người dùng đã đăng nhập thấy nút "Lưu bài viết" (Bookmark icon) tại mỗi bài báo.
2. Khi nhấn lưu, hệ thống cho phép chọn lưu vào thư mục mặc định hoặc tạo "Thư mục mới" (Ví dụ: "Tài liệu eSports", "Báo cáo môn học").
3. Người dùng có thể truy cập trang "Thư viện cá nhân" trong phần quản lý tài khoản để xem danh sách bài đã lưu, xóa bài hoặc di chuyển bài giữa các thư mục.
4. Thông báo toast "Đã lưu thành công" xuất hiện trong 3 giây ở góc màn hình.

---

## Phân hệ 2: Tác giả & Quản trị (Internal Users)

### User Story 3: Trình soạn thảo và tải ảnh đa phương tiện

**Là một** phóng viên (Phạm Hải),
**Tôi muốn** có thể tải ảnh lên trực tiếp và chèn vào giữa các đoạn văn bản trong lúc viết tin,
**Để** bài viết sống động, trực quan và đưa tin kịp thời từ hiện trường.

**Acceptance Criteria (Tiêu chí nghiệm thu):**

1. Trình soạn thảo văn bảnản có công cụ "Insert Image".
2. Hệ thống cho phép chọn ảnh từ thiết bị (hỗ trợ định dạng JPG, PNG, WEBP) hoặc kéo-thả (drag & drop) ảnh trực tiếp vào khu vực soạn thảo.
3. Kích thước ảnh tải lên tối đa là 5MB/ảnh. Hệ thống tự động nén (compress) và thay đổi kích thước (resize) để tối ưu tốc độ tải trang mà không làm vỡ bố cục hiển thị.
4. Phóng viên có thể thêm chú thích ảnh (caption) ngay bên dưới bức ảnh vừa chèn.

### User Story 4: Sửa lỗi nhanh nội dung (Inline Edit)

**Là một** biên tập viên (Lương Yến),
**Tôi muốn** có thể chỉnh sửa trực tiếp (sửa lỗi chính tả, câu từ) ngay trên bản xem trước (preview) của bài viết đang chờ duyệt,
**Để** tiết kiệm thời gian, không cần phải trả bài về cho phóng viên với những lỗi nhỏ.

**Acceptance Criteria (Tiêu chí nghiệm thu):**

1. Trong màn hình xem trước bài viết chờ duyệt, Biên tập viên có nút "Bật chế độ chỉnh sửa" (Edit Mode).
2. Khi chế độ này bật, BTV có thể click vào bất kỳ đoạn văn bản nào để sửa chữ trực tiếp.
3. Hệ thống tự động lưu lại phiên bản thay đổi (Revision History) và ghi nhận tài khoản BTV nào đã thực hiện chỉnh sửa.
4. Sau khi sửa, BTV có thể nhấn "Lưu & Xuất bản" ngay lập tức.

### User Story 5: Kéo thả quản lý giao diện trang chủ

**Là một** biên tập viên/trưởng bộ phận (Lương Yến),
**Tôi muốn** có công cụ trực quan để sắp xếp vị trí các bài báo trên trang chủ,
**Để** điều phối các tin tức quan trọng nhất vào các vị trí dễ thấy nhất nhằm thu hút người đọc.

**Acceptance Criteria (Tiêu chí nghiệm thu):**

1. Tại Dashboard Admin, có mục "Quản lý Trang chủ" hiển thị cấu trúc layout trang chủ thu nhỏ.
2. BTV có thể tìm kiếm các bài viết đã xuất bản và dùng thao tác kéo-thả (Drag & Drop) để đưa bài viết vào các khối (blocks) như "Tin Tiêu Điểm", "Tin Mới Nhất", "Đọc Nhiều".
3. Giao diện quản lý không cho phép chèn vượt quá số lượng bài viết quy định của từng khối (VD: Khối Tiêu điểm tối đa 3 bài).
4. Các thay đổi chỉ hiển thị ra trang chủ thực tế của độc giả sau khi BTV nhấn nút "Áp dụng thay đổi" (Save Changes).
