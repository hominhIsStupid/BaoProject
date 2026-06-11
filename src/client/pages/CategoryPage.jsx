import { Link, useParams } from 'react-router-dom';
import { getArticlesByCategory, MOCK_ARTICLES, getFeaturedArticles } from '../../utils/mockData';
import { CATEGORIES } from '../../constant/global';
import ArticleGrid from '../components/ArticleGrid';
import styles from './CategoryPage.module.css';

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

   const featuredArticles = filteredArticles.filter((article) => article.featured);

   const title = currentCategory
      ? `${currentCategory.name} Articles`
      : `${normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)} Articles`;

   return (
      <div className={styles.categoryPage}>
         {/* Featured Section */}
         {featuredArticles.length > 0 && (
            <section className={styles.featured} aria-labelledby="featured-heading">
               <h2 id="featured-heading" className={styles.sectionTitle}>
                  Featured
               </h2>
               <div className={styles.featuredGrid}>
                  {featuredArticles.map((article) => (
                     <Link key={article.id} to={`/article/${article.id}`} className={styles.featuredCard}>
                        <img src={article.image} alt={article.title} className={styles.featuredImage} />
                        <div className={styles.featuredContent}>
                           <h3 className={styles.featuredTitle}>{article.title}</h3>
                           <p className={styles.featuredExcerpt}>{article.excerpt}</p>
                        </div>
                     </Link>
                  ))}
               </div>
            </section>
         )}

         {/* Articles Section */}
         <section className={styles.articles} aria-labelledby="articles-heading">
            <h2 id="articles-heading" className={styles.sectionTitle}>
               {title}
            </h2>
            <ArticleGrid articles={filteredArticles} />
         </section>
      </div>
   );
}

export default CategoryPage;
