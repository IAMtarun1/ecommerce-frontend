import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import styles from './AdminUsers.module.css';

// Note: You'll need to add a user management endpoint in backend
// For now, this is a placeholder component

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // This endpoint doesn't exist yet - you'll need to add it to backend
      // For now, we'll use mock data
      setUsers([
        { id: 1, email: 'admin@ecommerce.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', status: 'ACTIVE' },
        { id: 2, email: 'customer@example.com', firstName: 'John', lastName: 'Doe', role: 'CUSTOMER', status: 'ACTIVE' },
        { id: 3, email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', role: 'CUSTOMER', status: 'ACTIVE' }
      ]);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    return role === 'ADMIN' ? styles.badgeAdmin : styles.badgeCustomer;
  };

  const getStatusBadgeClass = (status) => {
    return status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
        <p className={styles.loadingText}>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <button className={styles.refreshBtn} onClick={fetchUsers}>
          Refresh
        </button>
      </div>

      {error && <div className={styles.errorContainer}>{error}</div>}

      <div className="table-responsive">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.tableRow}>
                <td className={styles.userId}>{user.id}</td>
                <td className={styles.userEmail}>{user.email}</td>
                <td className={styles.userName}>{user.firstName} {user.lastName}</td>
                <td>
                  <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${getStatusBadgeClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
