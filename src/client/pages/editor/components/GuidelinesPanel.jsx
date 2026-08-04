import React from 'react';
import styles from '../EditorDashboard.module.css';

export default function GuidelinesPanel() {
   return (
      <div className={styles.guidelinesPanel}>
         <h2 className={styles.panelTitle}>Hướng Dẫn Chỉnh Sửa Bài Viết</h2>

         <div className={styles.guideSection}>
            <h3>✅ Tiêu Chí Duyệt Bài</h3>
            <ul>
               <li>☑ Tiêu đề rõ ràng, hấp dẫn và không lạm dụng từ khóa</li>
               <li>☑ Nội dung không vi phạm chính sách nội dung</li>
               <li>☑ Không chứa thông tin sai lệch hoặc tin giả</li>
               <li>☑ Hình ảnh/video phải rõ ràng và liên quan đến nội dung</li>
               <li>☑ Tôn trọng bản quyền và nguồn tin</li>
            </ul>
         </div>

         <div className={styles.guideSection}>
            <h3>🚫 Lý Do Từ Chối Bài</h3>
            <ul>
               <li>Nội dung không phù hợp với chính sách báo</li>
               <li>Thông tin không được xác minh</li>
               <li>Vi phạm bản quyền hoặc sao chép nguyên bản</li>
               <li>Chất lượng viết bài thấp hoặc spam</li>
            </ul>
         </div>
      </div>
   );
}
