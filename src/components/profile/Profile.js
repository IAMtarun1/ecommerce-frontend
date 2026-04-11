import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Container className={styles.container}>
      <Row className="justify-content-center">
        <Col md={8}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h4>My Profile</h4>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <div className={styles.label}>Name:</div>
                <div className={styles.value}>{user?.firstName} {user?.lastName}</div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.label}>Email:</div>
                <div className={styles.value}>{user?.email}</div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.label}>Role:</div>
                <div className={styles.value}>
                  <span className={styles.roleBadge}>{user?.role || 'CUSTOMER'}</span>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.label}>Member Since:</div>
                <div className={styles.value}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.buttons}>
                <button 
                  className={styles.ordersBtn}
                  onClick={() => navigate('/orders')}
                >
                  My Orders
                </button>
                <button 
                  className={styles.logoutBtn}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
