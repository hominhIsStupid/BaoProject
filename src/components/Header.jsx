import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <h1>BaoProject</h1>
        </Link>
        
        <nav className={styles.nav}>
          <SearchBar />
          <ul className={styles.navLinks}>
            <li><Link to="/">Home</Link></li>
            <li><a href="#categories">Categories</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
