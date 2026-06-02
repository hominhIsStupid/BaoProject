import { Link } from 'react-router-dom';
import ArticleGrid from '../components/ArticleGrid';
import { MOCK_ARTICLES, getFeaturedArticles } from '../../utils/mockData';
import { CATEGORIES } from '../../constant/global';
import styles from './HomePage.module.css';

function HomePage() {
   const featuredArticles = getFeaturedArticles();

   // Group articles by category
   const articlesByCategory = CATEGORIES.map((category) => ({
      ...category,
      articles: MOCK_ARTICLES.filter((article) => article.category === category.id),
   })).filter((category) => category.articles.length > 0);

   return (
      <div className={styles.homePage}>
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

         {/* Articles by Category Section */}
         <section className={styles.articles} aria-labelledby="articles-heading">
            <div className={styles.categoryStackContainer}>
               {articlesByCategory.map((category) => (
                  <div key={category.id} className={styles.categorySection}>
                     <h2 className={styles.categoryTitle}>{category.name}</h2>
                     <ArticleGrid articles={category.articles} />
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
}

export default HomePage;
