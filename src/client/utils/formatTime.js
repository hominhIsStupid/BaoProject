export const getTimeAgo = (dateStr) => {
   if (!dateStr) return '';
   const date = new Date(dateStr);
   const now = new Date();
   const diffMs = now - date;
   if (diffMs < 60000) return 'Vừa xong';
   const diffMins = Math.floor(diffMs / 60000);
   const diffHours = Math.floor(diffMins / 60);
   if (diffMins < 60) return `${diffMins} phút trước`;
   if (diffHours < 24) return `${diffHours} giờ trước`;
   return `${Math.floor(diffHours / 24)} ngày trước`;
};
