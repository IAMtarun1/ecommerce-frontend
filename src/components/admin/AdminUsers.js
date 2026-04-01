import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { authAPI } from '../../services/api';

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

  const getRoleBadge = (role) => {
    return <Badge bg={role === 'ADMIN' ? 'danger' : 'primary'}>{role}</Badge>;
  };

  const getStatusBadge = (status) => {
    return <Badge bg={status === 'ACTIVE' ? 'success' : 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-4">
        <h2>User Management</h2>
        <Button variant="outline-primary" onClick={fetchUsers}>
          Refresh
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
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
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{getRoleBadge(user.role)}</td>
              <td>{getStatusBadge(user.status)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminUsers;
