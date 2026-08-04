import { useState, useEffect } from 'react';
import { articlesAPI, recommendationAPI, tokenStorage } from '../utils/api';
import { apiCache } from '../utils/cache';

export function useHomePageData() {
   const cacheKey = `GET:/articles?limit=15&offset=0`;
   const cachedData = apiCache.has(cacheKey) ? apiCache.get(cacheKey) : null;
   const initialArticles = cachedData
      ? cachedData.filter((item, index, self) => index === self.findIndex((t) => t.title === item.title))
      : [];

   const [articles, setArticles] = useState(initialArticles);
   const [recommendations, setRecommendations] = useState([]);
   const [dailyHighlights, setDailyHighlights] = useState([]);
   const [researchArticles, setResearchArticles] = useState([]);
   const [loading, setLoading] = useState(!cachedData);
   const [error, setError] = useState(null);

   const loggedInUser = tokenStorage.getUser();

   useEffect(() => {
      const fetchArticles = async () => {
         try {
            const data = await articlesAPI.getAll(15, 0);
            const uniqueData = data.filter(
               (item, index, self) => index === self.findIndex((t) => t.title === item.title)
            );
            setArticles(uniqueData);

            // Fetch personalized recommendations or popular
            try {
               if (loggedInUser) {
                  const recs = await recommendationAPI.getRecommendations(8);
                  const uniqueRecs = recs.filter(
                     (item, index, self) => index === self.findIndex((t) => t.title === item.title)
                  );
                  setRecommendations(uniqueRecs);
               } else {
                  const popular = await recommendationAPI.getPopular(8);
                  const uniquePop = popular.filter(
                     (item, index, self) => index === self.findIndex((t) => t.title === item.title)
                  );
                  setRecommendations(uniquePop);
               }
            } catch (recErr) {
               console.error('Recommendations error:', recErr);
            }

            // Fetch daily highlights
            try {
               const daily = await recommendationAPI.getDaily(8);
               const uniqueDaily = daily.filter(
                  (item, index, self) => index === self.findIndex((t) => t.title === item.title)
               );
               setDailyHighlights(uniqueDaily);
            } catch (dailyErr) {
               console.error('Daily highlights error:', dailyErr);
            }

            // Fetch Research Articles
            try {
               const researchRes = await fetch('/api/research?limit=4');
               if (researchRes.ok) {
                  const researchData = await researchRes.json();
                  setResearchArticles(researchData.articles || []);
               }
            } catch (rErr) {
               console.error('Failed to fetch research articles:', rErr);
            }

            setLoading(false);
         } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            setLoading(false);
         }
      };

      fetchArticles();
   }, []);

   return { articles, recommendations, dailyHighlights, researchArticles, loading, error };
}
