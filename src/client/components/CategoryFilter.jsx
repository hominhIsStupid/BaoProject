import { CATEGORIES } from '../../utils/mockData';
import styles from './CategoryFilter.module.css';

function CategoryFilter({ selectedCategory, onCategoryChange, allLabel = 'All Categories' }) {
   const activeCategory = selectedCategory || 'all';

   const options = [
      { id: 'all', name: allLabel, color: '#000000' },
      ...CATEGORIES,
   ];

   return (
      <div className={styles.filter} role="tablist">
         {options.map((category) => {
            const isActive = activeCategory === category.id;

            return (
               <button
                  key={category.id}
                  className={`${styles.button} ${isActive ? styles.active : ''}`}
                  style={{ '--category-filter-active-color': category.color }}
                  onClick={() => onCategoryChange(category.id)}
                  role="tab"
                  aria-selected={isActive}
               >
                  {category.name}
               </button>
            );
         })}
      </div>
   );
}

export default CategoryFilter;
