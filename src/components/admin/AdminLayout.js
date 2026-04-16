import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const isActive = (path) => location.pathname === path || location.pathname === `/admin${path}`;

  return (
    <Container fluid className={styles.container}>
      <Row>
        {/* Sidebar */}
        <Col md={2} className={styles.sidebar}>
          <h5 className={styles.sidebarTitle}>Admin Dashboard</h5>
          <div className={styles.nav}>
            <Link 
              to="/admin" 
              className={`${styles.navLink} ${isActive('') ? styles.active : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/products" 
              className={`${styles.navLink} ${isActive('/products') ? styles.active : ''}`}
            >
              Products
            </Link>
            <Link 
              to="/admin/quick-add" 
              className={`${styles.navLink} ${isActive('/quick-add') ? styles.active : ''}`}
            >
              Quick Add Product
            </Link>
            <Link 
              to="/admin/orders" 
              className={`${styles.navLink} ${isActive('/orders') ? styles.active : ''}`}
            >
              Orders
            </Link>
            <Link 
              to="/admin/users" 
              className={`${styles.navLink} ${isActive('/users') ? styles.active : ''}`}
            >
              Users
            </Link>
          </div>
          <div className={styles.divider} />
          <div className={styles.userInfo}>
            <small className={styles.userEmail}>Logged in as: {user?.email}</small>
            <br />
            <small className={styles.userRole}>Role: {user?.role}</small>
          </div>
        </Col>

        {/* Content Area */}
        <Col md={10} className={styles.content}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
