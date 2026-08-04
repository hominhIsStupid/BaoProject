import { useState, useEffect } from 'react';
import { articlesAPI, commentsAPI, bookmarksAPI, recommendationAPI, tokenStorage } from '../utils/api';
import { apiCache } from '../utils/cache';

export function useArticleData(id) {
   const cacheKey = `GET:/articles/${id}`;
   const cachedArticle = apiCache.has(cacheKey) ? apiCache.get(cacheKey) : null;

   const [article, setArticle] = useState(cachedArticle);
   const [relatedArticles, setRelatedArticles] = useState([]);
   const [mostReadArticles, setMostReadArticles] = useState([]);
   const [loading, setLoading] = useState(!cachedArticle);
   const [error, setError] = useState(null);
   const [recommendations, setRecommendations] = useState([]);

   const [comments, setComments] = useState([]);
   const [isBookmarked, setIsBookmarked] = useState(false);
   const [bookmarkLoading, setBookmarkLoading] = useState(false);
   const [isLiked, setIsLiked] = useState(false);
   const [likeCount, setLikeCount] = useState(cachedArticle?.likes || 0);
   const [likeLoading, setLikeLoading] = useState(false);

   const loggedInUser = tokenStorage.getUser();

   useEffect(() => {
      const fetchData = async () => {
         if (!apiCache.has(`GET:/articles/${id}`)) setLoading(true);
         setError(null);
         try {
            // Fetch main article
            const articleData = await articlesAPI.getById(id);
            setArticle(articleData);
            setLikeCount(articleData.likes || 0);

            // Track reading + get recommendations (if logged in)
            if (loggedInUser) {
               try {
                  await recommendationAPI.trackRead(id, articleData.category);
                  const likeStatus = await recommendationAPI.getLikeStatus(id);
                  setIsLiked(likeStatus.liked);
                  const recs = await recommendationAPI.getRecommendations(8);
                  setRecommendations(recs.filter((r) => r.id !== id));
               } catch (recErr) {
                  console.error('Recommendation tracking error:', recErr);
               }
            }

            // Fetch related and most read
            const allArticles = await articlesAPI.getAll(20, 0);

            // Related: same category, different ID
            const related = allArticles
               .filter((a) => a.category === articleData.category && a.id !== articleData.id)
               .slice(0, 4);
            setRelatedArticles(related);

            // Most read: just taking some from the list
            setMostReadArticles(allArticles.slice(0, 5));

            // Fetch comments
            const commentsData = await commentsAPI.getByArticle(id);
            setComments(commentsData);

            // Fetch bookmark status
            if (loggedInUser) {
               try {
                  const bookmarks = await bookmarksAPI.getAll();
                  setIsBookmarked(bookmarks.some((b) => String(b.id) === String(id)));
               } catch (bookmarkErr) {
                  console.error('Failed to fetch bookmark status:', bookmarkErr);
               }
            }
         } catch (err) {
            console.error(err);
            setError('Không thể tải bài viết. Bài viết có thể không tồn tại hoặc đã bị xóa.');
         } finally {
            setLoading(false);
         }
      };

      fetchData();
      window.scrollTo(0, 0);
   }, [id, loggedInUser?.id]);

   const handleToggleBookmark = async () => {
      if (!loggedInUser) {
         alert('Vui lòng đăng nhập để lưu bài viết!');
         return;
      }
      setBookmarkLoading(true);
      try {
         if (isBookmarked) {
            await bookmarksAPI.delete(id);
            setIsBookmarked(false);
         } else {
            await bookmarksAPI.add(id);
            setIsBookmarked(true);
         }
      } catch (err) {
         console.error(err);
         alert('Lỗi khi cập nhật trạng thái lưu bài viết: ' + err.message);
      } finally {
         setBookmarkLoading(false);
      }
   };

   const handleToggleLike = async () => {
      if (!loggedInUser) {
         alert('Vui lòng đăng nhập để thích bài viết!');
         return;
      }
      if (!article) return;
      setLikeLoading(true);
      try {
         if (isLiked) {
            await recommendationAPI.unlike(id);
            setIsLiked(false);
            setLikeCount((prev) => Math.max(0, prev - 1));
         } else {
            await recommendationAPI.like(id, article.category);
            setIsLiked(true);
            setLikeCount((prev) => prev + 1);
         }
      } catch (err) {
         console.error(err);
      } finally {
         setLikeLoading(false);
      }
   };

   return {
      article,
      relatedArticles,
      mostReadArticles,
      loading,
      error,
      recommendations,
      comments,
      setComments,
      isBookmarked,
      bookmarkLoading,
      isLiked,
      likeCount,
      likeLoading,
      loggedInUser,
      handleToggleBookmark,
      handleToggleLike,
   };
}
