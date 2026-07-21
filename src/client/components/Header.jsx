import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { CATEGORIES } from '../../constant/global';
import { useWeather } from '../../hooks/useWeather';

const NAV_ITEMS = [
   { label: 'Trang Chủ', path: '/', id: 'home' },
   ...CATEGORIES.map((cat) => ({ label: cat.name, path: `/category/${cat.slug}`, id: cat.id })),
];

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function getVietnameseDate() {
   const now = new Date();
   const dayOfWeek = WEEKDAYS[now.getDay()];
   const day = now.getDate();
   const month = now.getMonth() + 1;
   const year = now.getFullYear();
   return `${dayOfWeek}, ${day}/${month}/${year}`;
}

function getWeatherIcon(code) {
   if (code === 0) return '☀️';
   if (code <= 3) return '⛅';
   if (code <= 48) return '🌫️';
   if (code <= 57) return '🌦️';
   if (code <= 67) return '🌧️';
   if (code <= 77) return '🌨️';
   if (code <= 82) return '🌧️';
   if (code <= 86) return '🌨️';
   if (code >= 95) return '⛈️';
   return '🌤️';
}

const VIETNAM_CITIES = [
   // 6 Thành phố trực thuộc Trung ương
   { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
   { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 }, // HCM + Bình Dương + Bà Rịa-Vũng Tàu
   { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 }, // Đà Nẵng + Quảng Nam
   { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 }, // Hải Phòng + Hải Dương
   { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 }, // Cần Thơ + Hậu Giang + Sóc Trăng
   { name: 'Huế', lat: 16.4637, lon: 107.5909 },
   // 28 Tỉnh (sau sáp nhập)
   { name: 'Cao Bằng', lat: 22.6666, lon: 106.2578 },
   { name: 'Điện Biên', lat: 21.386, lon: 103.023 },
   { name: 'Lai Châu', lat: 22.3964, lon: 103.4702 },
   { name: 'Lạng Sơn', lat: 21.8534, lon: 106.7614 },
   { name: 'Sơn La', lat: 21.327, lon: 103.9028 },
   { name: 'Hà Tĩnh', lat: 18.356, lon: 105.8877 },
   { name: 'Nghệ An', lat: 18.6733, lon: 105.6733 },
   { name: 'Thanh Hóa', lat: 19.8067, lon: 105.7852 },
   { name: 'Quảng Ninh', lat: 21.0064, lon: 107.2925 },
   { name: 'Tuyên Quang', lat: 21.7768, lon: 105.228 }, // Hà Giang + Tuyên Quang
   { name: 'Lào Cai', lat: 22.338, lon: 104.1488 }, // Yên Bái + Lào Cai
   { name: 'Thái Nguyên', lat: 21.5928, lon: 105.8442 }, // Bắc Kạn + Thái Nguyên
   { name: 'Bắc Ninh', lat: 21.1861, lon: 106.0763 }, // Bắc Giang + Bắc Ninh
   { name: 'Phú Thọ', lat: 21.3225, lon: 105.4017 }, // Vĩnh Phúc + Hòa Bình + Phú Thọ
   { name: 'Hưng Yên', lat: 20.6465, lon: 106.0512 }, // Hưng Yên + Thái Bình
   { name: 'Ninh Bình', lat: 20.2506, lon: 105.9745 }, // Hà Nam + Nam Định + Ninh Bình
   { name: 'Quảng Trị', lat: 16.7505, lon: 107.1854 }, // Quảng Bình + Quảng Trị
   { name: 'Quảng Ngãi', lat: 15.1214, lon: 108.8044 }, // Quảng Ngãi + Kon Tum
   { name: 'Bình Định', lat: 13.7765, lon: 109.2237 }, // Bình Định + Phú Yên
   { name: 'Khánh Hòa', lat: 12.2585, lon: 109.0526 }, // Khánh Hòa + Ninh Thuận
   { name: 'Đắk Lắk', lat: 12.71, lon: 108.2378 }, // Đắk Lắk + Đắk Nông
   { name: 'Gia Lai', lat: 13.9752, lon: 108.0005 },
   { name: 'Lâm Đồng', lat: 11.9404, lon: 108.4583 }, // Lâm Đồng + Bình Thuận
   { name: 'Đồng Nai', lat: 10.9415, lon: 106.8246 }, // Bình Phước + Đồng Nai
   { name: 'Tây Ninh', lat: 11.3184, lon: 106.0985 }, // Long An + Tây Ninh
   { name: 'Đồng Tháp', lat: 10.4938, lon: 105.6882 }, // Tiền Giang + Đồng Tháp
   { name: 'Vĩnh Long', lat: 10.2537, lon: 105.9722 }, // Bến Tre + Trà Vinh + Vĩnh Long
   { name: 'An Giang', lat: 10.3899, lon: 105.4353 }, // An Giang + Kiên Giang
   { name: 'Cà Mau', lat: 9.1527, lon: 105.1961 }, // Bạc Liêu + Cà Mau
];

function getWeatherDescription(code) {
   if (code === 0) return 'Trời nắng';
   if (code <= 3) return 'Có mây';
   if (code <= 48) return 'Sương mù';
   if (code <= 57) return 'Mưa phùn';
   if (code <= 67) return 'Mưa';
   if (code <= 77) return 'Mưa tuyết';
   if (code <= 82) return 'Mưa rào';
   if (code <= 86) return 'Mưa tuyết';
   if (code >= 95) return 'Giông bão';
   return 'Nhiều mây';
}

function Header() {
   const location = useLocation();
   const [searchQuery, setSearchQuery] = useState('');
   const [suggestions, setSuggestions] = useState({ articles: [], tags: [] });
   const [isLoading, setIsLoading] = useState(false);
   const [showDropdown, setShowDropdown] = useState(false);
   const searchRef = useRef(null);
   const navRowRef = useRef(null);

   const [menuOpen, setMenuOpen] = useState(false);
   const { weather, loading: weatherLoading } = useWeather('Hanoi');
   const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
   });

   // Date & Weather state
   const [dateStr] = useState(getVietnameseDate);
   const [weatherData, setWeatherData] = useState({
      temp: null,
      humidity: null,
      weatherCode: null,
      city: 'Đang xác định...',
      loading: true,
   });
   const [showCityPicker, setShowCityPicker] = useState(false);
   const [citySearch, setCitySearch] = useState('');
   const cityPickerRef = useRef(null);

   // Reusable weather fetch function
   const fetchWeatherForCity = async (lat, lon, cityName) => {
      setWeatherData((prev) => ({ ...prev, loading: true }));
      try {
         const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FHo_Chi_Minh`
         );
         if (res.ok) {
            const data = await res.json();
            setWeatherData({
               temp: Math.round(data.current.temperature_2m),
               humidity: data.current.relative_humidity_2m,
               weatherCode: data.current.weather_code,
               city: cityName,
               loading: false,
            });
            localStorage.setItem('weather_city', JSON.stringify({ name: cityName, lat, lon }));
         }
      } catch {
         setWeatherData((prev) => ({ ...prev, city: cityName, loading: false }));
      }
   };

   // Handle city selection
   const handleCitySelect = (city) => {
      setShowCityPicker(false);
      setCitySearch('');
      fetchWeatherForCity(city.lat, city.lon, city.name);
   };

   // Initial weather load: saved city > geolocation > Hanoi fallback
   useEffect(() => {
      const savedCity = localStorage.getItem('weather_city');
      if (savedCity) {
         try {
            const city = JSON.parse(savedCity);
            fetchWeatherForCity(city.lat, city.lon, city.name);
            return;
         } catch {}
      }

      const getCityName = async (lat, lon) => {
         try {
            const res = await fetch(
               `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=vi`
            );
            if (res.ok) {
               const data = await res.json();
               return data.address?.city || data.address?.town || data.address?.state || 'Việt Nam';
            }
         } catch {}
         return 'Việt Nam';
      };

      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            async (position) => {
               const { latitude, longitude } = position.coords;
               const cityName = await getCityName(latitude, longitude);
               fetchWeatherForCity(latitude, longitude, cityName);
            },
            () => fetchWeatherForCity(21.0285, 105.8542, 'Hà Nội'),
            { timeout: 5000 }
         );
      } else {
         fetchWeatherForCity(21.0285, 105.8542, 'Hà Nội');
      }
   }, []);

   // Close city picker on outside click
   useEffect(() => {
      const handleClick = (e) => {
         if (cityPickerRef.current && !cityPickerRef.current.contains(e.target)) {
            setShowCityPicker(false);
            setCitySearch('');
         }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
   }, []);

   const filteredCities = citySearch.trim()
      ? VIETNAM_CITIES.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
      : VIETNAM_CITIES;

   // Drag-to-scroll for nav bar
   useEffect(() => {
      const navRow = navRowRef.current;
      if (!navRow) return;

      let isDown = false;
      let startX;
      let scrollLeft;

      const handleMouseDown = (e) => {
         isDown = true;
         navRow.style.cursor = 'grabbing';
         startX = e.pageX - navRow.offsetLeft;
         scrollLeft = navRow.scrollLeft;
      };
      const handleMouseLeave = () => {
         isDown = false;
         navRow.style.cursor = 'grab';
      };
      const handleMouseUp = () => {
         isDown = false;
         navRow.style.cursor = 'grab';
      };
      const handleMouseMove = (e) => {
         if (!isDown) return;
         e.preventDefault();
         const x = e.pageX - navRow.offsetLeft;
         const walk = (x - startX) * 1.5;
         navRow.scrollLeft = scrollLeft - walk;
      };

      navRow.addEventListener('mousedown', handleMouseDown);
      navRow.addEventListener('mouseleave', handleMouseLeave);
      navRow.addEventListener('mouseup', handleMouseUp);
      navRow.addEventListener('mousemove', handleMouseMove);

      return () => {
         navRow.removeEventListener('mousedown', handleMouseDown);
         navRow.removeEventListener('mouseleave', handleMouseLeave);
         navRow.removeEventListener('mouseup', handleMouseUp);
         navRow.removeEventListener('mousemove', handleMouseMove);
      };
   }, []);

   useEffect(() => {
      const handleAuthChange = () => {
         const savedUser = localStorage.getItem('user');
         setUser(savedUser ? JSON.parse(savedUser) : null);
      };

      window.addEventListener('auth-change', handleAuthChange);
      return () => {
         window.removeEventListener('auth-change', handleAuthChange);
      };
   }, []);

   // Handle click outside to close dropdown
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowDropdown(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   // Debounce search
   useEffect(() => {
      const fetchSuggestions = async () => {
         if (!searchQuery.trim()) {
            setSuggestions({ articles: [], tags: [] });
            setShowDropdown(false);
            return;
         }

         setIsLoading(true);
         setShowDropdown(true);

         try {
            const res = await fetch(`/api/articles/search/suggestions/${encodeURIComponent(searchQuery.trim())}`);
            if (res.ok) {
               const data = await res.json();
               setSuggestions(data);
            }
         } catch (err) {
            console.error('Failed to fetch suggestions:', err);
         } finally {
            setIsLoading(false);
         }
      };

      const delayDebounceFn = setTimeout(() => {
         fetchSuggestions();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
   }, [searchQuery]);

   const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         setShowDropdown(false);
         window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      }
   };

   return (
      <header className={styles.header}>
         {/* Info Bar - Date & Weather (VnExpress style) */}
         <div className={styles.infoBar}>
            <div className={styles.container}>
               <div className={styles.infoRow}>
                  <div className={styles.dateSection}>
                     <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ flexShrink: 0 }}
                     >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                     </svg>
                     <span>{dateStr}</span>
                  </div>

                  {/* Quick Links */}
                  <div className={styles.quickLinks}>
                     <Link to="/category/tin-moi" className={styles.quickLink}>
                        Mới nhất
                     </Link>
                     <span className={styles.divider}>|</span>
                     <Link to="/category/thoi-su" className={styles.quickLink}>
                        Thời sự
                     </Link>
                     <span className={styles.divider}>|</span>
                     <Link to="/category/kinh-doanh" className={styles.quickLink}>
                        Kinh doanh
                     </Link>
                     <span className={styles.divider}>|</span>
                     <Link to="/category/the-gioi" className={styles.quickLink}>
                        Quốc tế
                     </Link>
                  </div>
                  <div className={styles.infoRight} ref={cityPickerRef}>
                     <div className={styles.weatherBadge}>
                        {weatherData.loading ? (
                           <span className={styles.weatherLoading}>Đang tải...</span>
                        ) : (
                           <>
                              <span className={styles.weatherEmoji}>{getWeatherIcon(weatherData.weatherCode)}</span>
                              <div className={styles.weatherDetails}>
                                 <button
                                    className={styles.weatherCityBtn}
                                    onClick={() => setShowCityPicker(!showCityPicker)}
                                    title="Đổi thành phố"
                                 >
                                    <svg
                                       width="10"
                                       height="10"
                                       viewBox="0 0 24 24"
                                       fill="currentColor"
                                       style={{ marginRight: '3px', flexShrink: 0 }}
                                    >
                                       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    {weatherData.city}
                                    <svg
                                       width="8"
                                       height="8"
                                       viewBox="0 0 24 24"
                                       fill="none"
                                       stroke="currentColor"
                                       strokeWidth="3"
                                       style={{ marginLeft: '3px' }}
                                    >
                                       <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                 </button>
                                 <span className={styles.weatherTemp}>{weatherData.temp}°C</span>
                                 <span className={styles.weatherDesc}>
                                    {getWeatherDescription(weatherData.weatherCode)}
                                 </span>
                                 {weatherData.humidity !== null && (
                                    <span className={styles.weatherHumidity}>💧 {weatherData.humidity}%</span>
                                 )}
                              </div>
                           </>
                        )}
                     </div>

                     {/* City Picker Dropdown */}
                     {showCityPicker && (
                        <div className={styles.cityPicker}>
                           <div className={styles.citySearchWrapper}>
                              <svg
                                 width="14"
                                 height="14"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="2"
                              >
                                 <circle cx="11" cy="11" r="8" />
                                 <path d="m21 21-4.35-4.35" />
                              </svg>
                              <input
                                 type="text"
                                 className={styles.citySearchInput}
                                 placeholder="Tìm tỉnh/thành phố..."
                                 value={citySearch}
                                 onChange={(e) => setCitySearch(e.target.value)}
                                 autoFocus
                              />
                           </div>
                           <div className={styles.cityList}>
                              {filteredCities.length === 0 ? (
                                 <div className={styles.cityEmpty}>Không tìm thấy</div>
                              ) : (
                                 filteredCities.map((city) => (
                                    <button
                                       key={city.name}
                                       className={`${styles.cityItem} ${weatherData.city === city.name ? styles.cityItemActive : ''}`}
                                       onClick={() => handleCitySelect(city)}
                                    >
                                       <svg
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          style={{ flexShrink: 0, opacity: 0.5 }}
                                       >
                                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                       </svg>
                                       {city.name}
                                    </button>
                                 ))
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Top Bar */}
         <div className={styles.topBar}>
            <div className={styles.container}>
               <div className={styles.topRow}>
                  {/* Logo */}
                  <Link to="/" className={styles.logo} aria-label="Rồng Vàng - Trang chủ">
                     <div className={styles.logoIcon}>
                        <img alt="icon" src="../../../logo512.png"></img>
                     </div>
                     <div className={styles.logoText}>
                        <span className={styles.logoTitle}>RỒNG VÀNG</span>
                        <span className={styles.logoSub}>— BÁO ĐIỆN TỬ —</span>
                     </div>
                  </Link>

                  {/* Search */}
                  <div className={styles.searchWrapper} ref={searchRef}>
                     <form className={styles.searchForm} onSubmit={handleSearch} role="search">
                        <input
                           id="header-search"
                           type="search"
                           className={styles.searchInput}
                           placeholder="Tìm kiếm tin tức..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           onFocus={() => {
                              if (searchQuery.trim()) setShowDropdown(true);
                           }}
                           aria-label="Tìm kiếm tin tức"
                           autoComplete="off"
                        />
                        <button type="submit" className={styles.searchBtn} aria-label="Tìm kiếm">
                           <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                           >
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.35-4.35" />
                           </svg>
                        </button>
                     </form>

                     {/* Hot Tags */}
                     <div className={styles.hotTags}>
                        <span className={styles.hotTagsLabel}>
                           <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           >
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                              <polyline points="17 6 23 6 23 12"></polyline>
                           </svg>
                           Xu hướng:
                        </span>
                        <Link to="/search?q=Chứng khoán">Chứng khoán</Link>
                        <Link to="/search?q=Bất động sản">Bất động sản</Link>
                        <Link to="/search?q=Công nghệ AI">Công nghệ AI</Link>
                     </div>

                     {/* Search Suggestions Dropdown */}
                     {showDropdown && (
                        <div className={styles.searchDropdown}>
                           {isLoading ? (
                              <div className={styles.dropdownMessage}>Đang tìm kiếm...</div>
                           ) : suggestions.tags.length === 0 && suggestions.articles.length === 0 ? (
                              <div className={styles.dropdownMessage}>Không tìm thấy kết quả phù hợp</div>
                           ) : (
                              <>
                                 {suggestions.tags.length > 0 && (
                                    <div className={styles.suggestionSection}>
                                       <h4 className={styles.suggestionHeader}>Từ khóa liên quan</h4>
                                       <div className={styles.tagList}>
                                          {suggestions.tags.map((tag, idx) => (
                                             <Link
                                                key={idx}
                                                to={`/search?q=${encodeURIComponent(tag)}`}
                                                className={styles.suggestionTag}
                                                onClick={() => {
                                                   setSearchQuery(tag);
                                                   setShowDropdown(false);
                                                }}
                                             >
                                                # {tag}
                                             </Link>
                                          ))}
                                       </div>
                                    </div>
                                 )}

                                 {suggestions.articles.length > 0 && (
                                    <div className={styles.suggestionSection}>
                                       <h4 className={styles.suggestionHeader}>Bài viết đề xuất</h4>
                                       <div className={styles.articleList}>
                                          {suggestions.articles.map((article) => (
                                             <Link
                                                key={article.id}
                                                to={`/article/${article.id}`}
                                                className={styles.suggestionArticle}
                                                onClick={() => setShowDropdown(false)}
                                             >
                                                <div className={styles.suggestionImageWrapper}>
                                                   <img
                                                      src={
                                                         article.image || 'https://via.placeholder.com/50x50?text=News'
                                                      }
                                                      alt={article.title}
                                                      className={styles.suggestionImage}
                                                   />
                                                </div>
                                                <div className={styles.suggestionArticleInfo}>
                                                   <span className={styles.suggestionArticleTitle}>
                                                      {article.title}
                                                   </span>
                                                   <span className={styles.suggestionArticleCat}>
                                                      {article.category.toUpperCase()}
                                                   </span>
                                                </div>
                                             </Link>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                              </>
                           )}
                        </div>
                     )}
                  </div>

                  {/* Right: Auth + ThemeToggle */}
                  <div className={styles.topRight}>
                     <ThemeToggle />
                     {user ? (
                        <div className={styles.userMenu}>
                           <Link to="/profile" className={styles.userInfo} id="header-profile-link">
                              <div className={styles.avatarWrapper}>
                                 {user.avatar ? (
                                    <img src={user.avatar} className={styles.userAvatar} alt="Avatar" />
                                 ) : (
                                    <div className={styles.avatarPlaceholder}>
                                       {user.fullName ? user.fullName.charAt(0) : 'U'}
                                    </div>
                                 )}
                              </div>
                              <span className={styles.userName}>{user.fullName}</span>
                           </Link>

                           {user.role === 'author' && (
                              <Link
                                 to="/author"
                                 className={styles.authorLink}
                                 id="header-author-link"
                                 title="Quản lý bài viết"
                              >
                                 ✍️
                              </Link>
                           )}
                           {user.role === 'editor' && (
                              <Link
                                 to="/editor"
                                 className={styles.editorLink}
                                 id="header-editor-link"
                                 title="Duyệt bài viết"
                              >
                                 📋
                              </Link>
                           )}
                           {user.role === 'admin' && (
                              <Link
                                 to="/admin"
                                 className={styles.adminLink}
                                 id="header-admin-link"
                                 title="Quản lý hệ thống"
                              >
                                 ⚙️
                              </Link>
                           )}

                           <button
                              onClick={() => {
                                 localStorage.removeItem('auth_token');
                                 localStorage.removeItem('user');
                                 window.location.href = '/';
                              }}
                              className={styles.btnLogout}
                              title="Đăng xuất"
                           >
                              🚪
                           </button>
                        </div>
                     ) : (
                        <>
                           <Link to="/login" className={styles.btnLogin} id="btn-login">
                              Đăng nhập
                           </Link>
                           <Link to="/register" className={styles.btnRegister} id="btn-register">
                              Đăng ký
                           </Link>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Nav Bar */}
         <nav className={styles.navBar} aria-label="Navigation chính">
            <div className={styles.navRow} ref={navRowRef}>
               {NAV_ITEMS.map((item) => {
                  const isActive =
                     location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                     <Link
                        key={item.id}
                        to={item.path}
                        id={`nav-${item.id}`}
                        className={`${styles.navLink} ${isActive ? styles.navActive : ''}`}
                     >
                        {item.id === 'home' && (
                           <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              style={{ marginRight: '4px', verticalAlign: 'middle' }}
                           >
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                           </svg>
                        )}
                        {item.label}
                     </Link>
                  );
               })}
               <button
                  className={styles.menuToggle}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Thêm danh mục"
                  id="btn-menu-toggle"
               >
                  <span></span>
                  <span></span>
                  <span></span>
               </button>
            </div>
         </nav>

         {/* Mega Menu Overlay */}
         <div className={`${styles.megaMenuOverlay} ${menuOpen ? styles.megaMenuOpen : ''}`}>
            <div className={styles.megaMenuContainer}>
               <h3 className={styles.megaMenuTitle}>TẤT CẢ CHUYÊN MỤC</h3>
               <div className={styles.megaMenuGrid}>
                  {CATEGORIES.map((cat) => (
                     <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className={styles.megaMenuItem}
                        onClick={() => setMenuOpen(false)}
                     >
                        <span className={styles.megaMenuColor} style={{ backgroundColor: cat.color }}></span>
                        {cat.name}
                     </Link>
                  ))}
               </div>
            </div>
         </div>
      </header>
   );
}

export default Header;
