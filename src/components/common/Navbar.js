import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaShoppingBag, FaUser, FaHeart, FaBox, FaSignOutAlt, FaStore, FaSearch, FaSun, FaMoon } from 'react-icons/fa';
import { cartAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';
import { useTheme } from '../../context/ThemeContext';

const Navigation = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      const count = response.data?.items?.length || 0;
      setCartCount(count);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <FaStore className={styles.logoIcon} />
            <span>ShopHub</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className={`${styles.searchContainer} ${styles.desktopOnly}`}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <div className={`${styles.navLinks} ${styles.desktopOnly}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.navLink} ${isActive(link.path) ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className={`${styles.actions} ${styles.desktopOnly}`}>
            {/* Theme Toggle */}
            <button className={styles.actionIcon} onClick={toggleTheme}>
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>

            {/* Cart */}
            <button 
              className={styles.actionIcon} 
              onClick={() => navigate(isAuthenticated ? '/cart' : '/login')}
              aria-label="Cart"
            >
              <FaShoppingBag />
              {cartCount > 0 && <span className={styles.cartDot}>{cartCount}</span>}
            </button>

            {/* Auth / User */}
            {isAuthenticated ? (
              <div className={styles.userMenuWrapper}>
                <button className={styles.userAvatarBtn}>
                  <div className={styles.avatarPlaceholder}>
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className={styles.userName}>{user?.firstName}</span>
                </button>
                <div className={styles.userDropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className={styles.dropdownInfo}>
                      <div className={styles.dropdownName}>{user?.firstName} {user?.lastName}</div>
                      <div className={styles.dropdownEmail}>{user?.email}</div>
                    </div>
                  </div>
                  <Link to="/dashboard" className={styles.dropdownLink} onClick={() => setMobileMenuOpen(false)}>
                    <FaUser /> Profile
                  </Link>
                  <Link to="/orders" className={styles.dropdownLink} onClick={() => setMobileMenuOpen(false)}>
                    <FaBox /> Orders
                  </Link>
                  <Link to="/wishlist" className={styles.dropdownLink} onClick={() => setMobileMenuOpen(false)}>
                    <FaHeart /> Wishlist
                  </Link>
                  <button onClick={handleLogout} className={`${styles.dropdownLink} ${styles.logout}`}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className={styles.btnOutline}>Log in</Link>
                <Link to="/register" className={styles.btnPrimary}>Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className={`${styles.menuLine} ${mobileMenuOpen ? styles.menuLineOpen : ''}`}></span>
            <span className={`${styles.menuLine} ${mobileMenuOpen ? styles.menuLineOpen : ''}`}></span>
            <span className={`${styles.menuLine} ${mobileMenuOpen ? styles.menuLineOpen : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
          >
            <div className={styles.mobileMenuContent}>
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.mobileSearchInput}
                />
                <button type="submit" className={styles.mobileSearchBtn}>
                  <FaSearch />
                </button>
              </form>
              
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${styles.mobileLink} ${isActive(link.path) ? styles.mobileActive : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <button className={styles.mobileLink} onClick={toggleTheme}>
                {theme === 'dark' ? <FaSun /> : <FaMoon />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              
              <div className={styles.mobileDivider}></div>
              {isAuthenticated ? (
                <>
                  <div className={styles.mobileUserInfo}>
                    <div className={styles.mobileAvatar}>{user?.firstName?.charAt(0)}</div>
                    <div>
                      <div className={styles.mobileUserName}>{user?.firstName} {user?.lastName}</div>
                      <div className={styles.mobileUserEmail}>{user?.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                    <FaUser /> Profile
                  </Link>
                  <Link to="/orders" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                    <FaBox /> Orders
                  </Link>
                  <Link to="/wishlist" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                    <FaHeart /> Wishlist
                  </Link>
                  <button onClick={handleLogout} className={`${styles.mobileLink} ${styles.logout}`}>
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <div className={styles.mobileAuth}>
                  <Link to="/login" className={styles.mobileBtnOutline} onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className={styles.mobileBtnPrimary} onClick={() => setMobileMenuOpen(false)}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
