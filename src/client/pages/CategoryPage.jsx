import { Link, useParams } from 'react-router-dom';
import { getArticlesByCategory, MOCK_ARTICLES } from '../../utils/mockData';
import { CATEGORIES } from '../../constant/global';

function CategoryPage() {
   const { category } = useParams();
   const normalizedCategory = category?.toLowerCase() ?? '';

   const currentCategory = CATEGORIES.find((c) => {
      const slug = (c.slug || c.name).toLowerCase();
      return slug === normalizedCategory || c.id?.toString().toLowerCase() === normalizedCategory;
   });

   const filteredArticles = currentCategory
      ? getArticlesByCategory(currentCategory.id)
      : MOCK_ARTICLES.filter((article) => article.category?.toLowerCase() === normalizedCategory);

   const title = currentCategory
      ? `${currentCategory.name} Articles`
      : `${normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)} Articles`;

   return (
      <div className="page-container">
         <h1>{title}</h1>
         {filteredArticles.length === 0 ? (
            <p>No articles found in this category.</p>
         ) : (
            <div className="article-list">
               {filteredArticles.map((article) => (
                  <article key={article.id} className="article-card">
                     <Link to={`/article/${article.id}`}>
                        <h2>{article.title}</h2>
                     </Link>
                     <p>{article.excerpt || article.summary || ''}</p>
                  </article>
               ))}
            </div>
         )}
      </div>
   );
}

export default CategoryPage;
