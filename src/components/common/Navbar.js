import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaShoppingBag, FaUser, FaHeart, FaBox, FaSignOutAlt, FaStore } from 'react-icons/fa';
import { cartAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <>
      <nav className="navbar-modern">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <FaStore className="logo-icon" />
            <span>ShopHub</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="navbar-links desktop-only">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link-item ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="navbar-actions desktop-only">
            {/* Cart */}
            <button 
              className="action-icon cart-icon" 
              onClick={() => navigate(isAuthenticated ? '/cart' : '/login')}
              aria-label="Cart"
            >
              <FaShoppingBag />
              {cartCount > 0 && <span className="cart-dot">{cartCount}</span>}
            </button>

            {/* Auth / User */}
            {isAuthenticated ? (
              <div className="user-menu-wrapper">
                <button className="user-avatar-btn">
                  <div className="avatar-placeholder">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className="user-name">{user?.firstName}</span>
                </button>
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className="dropdown-info">
                      <div className="dropdown-name">{user?.firstName} {user?.lastName}</div>
                      <div className="dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <Link to="/dashboard" className="dropdown-link" onClick={() => setMobileMenuOpen(false)}>
                    <FaUser /> Profile
                  </Link>
                  <Link to="/orders" className="dropdown-link" onClick={() => setMobileMenuOpen(false)}>
                    <FaBox /> Orders
                  </Link>
                  <Link to="/wishlist" className="dropdown-link" onClick={() => setMobileMenuOpen(false)}>
                    <FaHeart /> Wishlist
                  </Link>
                  <button onClick={handleLogout} className="dropdown-link logout">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-outline">Log in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className={`menu-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`menu-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`menu-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
          >
            <div className="mobile-menu-content">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mobile-divider"></div>
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <div className="mobile-avatar">{user?.firstName?.charAt(0)}</div>
                    <div>
                      <div className="mobile-user-name">{user?.firstName} {user?.lastName}</div>
                      <div className="mobile-user-email">{user?.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    <FaUser /> Profile
                  </Link>
                  <Link to="/orders" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    <FaBox /> Orders
                  </Link>
                  <Link to="/wishlist" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    <FaHeart /> Wishlist
                  </Link>
                  <button onClick={handleLogout} className="mobile-link logout">
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <div className="mobile-auth">
                  <Link to="/login" className="mobile-btn-outline" onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className="mobile-btn-primary" onClick={() => setMobileMenuOpen(false)}>
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
