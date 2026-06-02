import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import styles from './Header.module.css';
import { CATEGORIES } from '../../constant/global';

function Header() {
   return (
      <header className={styles.header}>
         <div className={styles.container}>
            <div className={styles.row}>
               <Link to="/" className={styles.logo}>
                  <h1>BaoProject</h1>
               </Link>
               <SearchBar />
               <a>Login</a>
            </div>
            <nav className={`${styles.navLinks} ${styles.row}`}>
               {CATEGORIES.map((category) => {
                  const slug = (category.slug || category.name).toLowerCase();
                  return (
                     <Link key={slug} className={styles.navLink} to={`/category/${slug}`}>
                        {category.name}
                        <div></div>
                     </Link>
                  );
               })}
            </nav>
         </div>
      </header>
   );
}

export default Header;
