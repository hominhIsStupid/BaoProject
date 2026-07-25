# Hệ Thống Scenarios (Kịch bản sử dụng) - Dự án Báo Rồng Vàng

---

## Kịch Bản 1: Cập nhật tin tức giải trí nhanh chóng trong giờ nghỉ

- **Người dùng (Actor):** Trần Hải (Persona 1 - Độc Giả Đại Chúng)
- **Bối cảnh (Context):** Đang trong giờ nghỉ trưa tại văn phòng, Hải lướt điện thoại và muốn tìm đọc tin tức giải trí, văn hóa đại chúng một cách nhanh chóng trước khi quay lại làm việc.
- **Mục tiêu (Goal):** Đọc được thông tin mới nhất về bộ phim yêu thích và chia sẻ cho bạn bè.
- **Các bước tương tác (Flow):**
   1. Hải mở trình duyệt trên smartphone và truy cập vào trang chủ.
   2. Tại trang chủ, hệ thống gợi ý chuyên mục "Giải trí & Văn hóa". Hải lướt qua và thấy tiêu đề bài viết công bố trailer bộ phim mới.
   3. Hải nhấn vào bài viết. Trang web tải hoàn tất nội dung chỉ trong chưa tới 2 giây. Không có pop-up quảng cáo toàn màn hình che khuất tầm nhìn.
   4. Hải đọc nhanh các ý chính được bôi đậm ở đầu bài.
   5. Cảm thấy phấn khích, Hải nhấn vào nút "Chia sẻ qua Facebook" nằm ngay dưới bài viết để thảo luận cùng bạn bè.
- **Kết quả mong đợi:** Hải tiếp nhận thông tin giải trí thành công trong chưa đầy 3 phút, hệ thống ghi nhận 1 lượt share từ người dùng.

---

## Kịch Bản 2: Tra cứu và lưu trữ tin tức chuyên sâu để tham khảo

- **Người dùng (Actor):** Lê Minh (Persona 3 - Sinh Viên & Học Giả)
- **Bối cảnh (Context):** Minh đang cần tổng hợp thông tin về chiến thuật của các đội tuyển tham dự giải đấu eSports toàn cầu để viết một bài phân tích trên blog cá nhân.
- **Mục tiêu (Goal):** Tìm lại được các bài phân tích sâu về giải đấu đã diễn ra vài tháng trước và lưu trữ chúng một cách có hệ thống.
- **Các bước tương tác (Flow):**
   1. Minh truy cập trang web trên laptop cá nhân và điều hướng tới chuyên mục "Thể thao điện tử".
   2. Minh sử dụng thanh tìm kiếm nâng cao của hệ thống, nhập từ khóa _"Valorant Masters Santiago"_, lọc khoảng thời gian đăng bài từ tháng 1 đến tháng 3.
   3. Hệ thống trả về danh sách 5 bài phân tích chiến thuật chi tiết.
   4. Minh click vào từng bài để đọc. Khi thấy một biểu đồ phân tích chỉ số KDA (Kill/Death/Assist) rất hữu ích, Minh bấm nút "Lưu bài viết" (Bookmark) ở góc phải màn hình.
   5. Minh mở phần "Thư viện cá nhân" trong tài khoản của mình, tạo một thư mục mới tên "Tài liệu eSports" và di chuyển bài viết vừa lưu vào đó.
- **Kết quả mong đợi:** Người dùng dễ dàng tìm lại thông tin cũ dựa trên bộ lọc nâng cao và tổ chức được kho tài liệu cá nhân mà không phải trả phí.

---

## Kịch Bản 3: Đưa tin nóng (Breaking News) từ hiện trường

- **Người dùng (Actor):** Phạm Hải (Persona 4 - Phóng Viên)
- **Bối cảnh (Context):** Hải đang tham dự một sự kiện ra mắt dòng bàn phím cơ từ tính (magnetic switch) công nghệ mới nhất. Vừa có thông tin về giá bán chính thức, Hải cần đưa tin ngay lập tức để lấy lợi thế độc quyền cho tờ báo.
- **Mục tiêu (Goal):** Soạn thảo và gửi duyệt tin vắn cực kỳ nhanh chóng từ một chiếc tablet tại sự kiện.
- **Các bước tương tác (Flow):**
   1. Hải đăng nhập vào hệ thống CMS của tòa soạn (đường dẫn dành cho Admin/Tác giả).
   2. Tại Dashboard, Hải chọn nút "Viết tin nóng". Trình soạn thảo WYSIWYG được thiết kế tối giản hiện ra.
   3. Hải gõ nhanh tiêu đề, tóm tắt thông số kỹ thuật (Rapid Trigger, SOCD) và cập nhật mức giá bán.
   4. Hải chụp một bức ảnh thực tế bàn phím tại quầy trải nghiệm bằng tablet, nhấn nút "Tải ảnh lên" ngay trong trình soạn thảo. Hệ thống tự động nén và chèn ảnh vào bài mà không làm vỡ bố cục.
   5. Hải gắn thẻ (tag) _"Công nghệ"_, _"Phần cứng"_ và nhấn "Gửi duyệt khẩn cấp".
- **Kết quả mong đợi:** Bài viết được đẩy thẳng vào hàng đợi ưu tiên của Biên tập viên chỉ trong vòng 2 phút thao tác.

---

## Kịch Bản 4: Phê duyệt và điều phối vị trí hiển thị tin tức

- **Người dùng (Actor):** Lương Yến (Persona 5 - Biên Tập Viên)
- **Bối cảnh (Context):** Yến đang trực hệ thống CMS tại tòa soạn thì nhận được thông báo có bài viết dán nhãn "Khẩn cấp" từ phóng viên.
- **Mục tiêu (Goal):** Kiểm duyệt nhanh nội dung, sửa lỗi (nếu có) và đưa bài lên vị trí trung tâm của trang chủ để thu hút lượt xem.
- **Các bước tương tác (Flow):**
   1. Hệ thống CMS gửi thông báo (Push notification): "Có 1 bài viết khẩn cấp đang chờ duyệt từ Phạm Hải". Yến click vào thông báo để mở màn hình "Duyệt bài".
   2. Yến đọc lướt nội dung, phát hiện một lỗi gõ phím nhỏ ở phần thông số kỹ thuật. Yến bôi đen từ đó, dùng tính năng "Inline Edit" sửa trực tiếp mà không cần trả bài về cho tác giả.
   3. Sau khi xác nhận thông tin chính xác, Yến nhấn nút "Xuất bản".
   4. Yến chuyển sang tab "Quản lý Trang chủ". Giao diện hiển thị dưới dạng kéo-thả (Drag & Drop) mô phỏng trang chủ thực tế.
   5. Yến nắm kéo khối bài viết công nghệ vừa xuất bản vào block "Tin Tiêu Điểm" (Spotlight) to nhất ở đầu trang và nhấn "Lưu thay đổi".
- **Kết quả mong đợi:** Tin nóng được xuất bản nhanh chóng, không sai sót và lập tức xuất hiện ở vị trí bắt mắt nhất đối với độc giả.
