import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ArticleGrid from '../components/ArticleGrid';
import CategoryFilter from '../components/CategoryFilter';
import { searchArticles } from '../../utils/mockData';
import styles from './SearchPage.module.css';

function SearchPage() {
   const [searchParams, setSearchParams] = useSearchParams();
   const query = searchParams.get('q') || '';
   const selectedCategory = searchParams.get('category') || 'all';

   const results = useMemo(() => {
      return searchArticles(query, selectedCategory === 'all' ? null : selectedCategory);
   }, [query, selectedCategory]);

   const handleCategoryChange = (categoryId) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('category', categoryId);
      setSearchParams(newParams);
   };

   return (
      <div className={styles.searchPage}>
         <div className={styles.container}>
            {/* Search Header */}
            <header className={styles.header}>
               <h1>Search Results</h1>
               {query && (
                  <p className={styles.searchQuery}>
                     Results for: <strong>"{query}"</strong>
                     <span className={styles.resultCount}>
                        ({results.length} {results.length === 1 ? 'result' : 'results'})
                     </span>
                  </p>
               )}
            </header>

            {/* Filter Section */}
            <section className={styles.filters} aria-label="Filter results">
               <h2 className={styles.filterTitle}>Filter by Category</h2>
               <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            </section>

            {/* Results */}
            <section className={styles.results} aria-label="Search results" aria-live="polite">
               {query && results.length === 0 ? (
                  <div className={styles.noResults}>
                     <h2>No articles found</h2>
                     <p>Try searching for different keywords or browse all articles.</p>
                     <Link to="/" className={styles.link}>
                        Browse All Articles
                     </Link>
                  </div>
               ) : (
                  <ArticleGrid articles={results} />
               )}
            </section>
         </div>
      </div>
   );
}

export default SearchPage;
