import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Table, Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import { FaBox, FaMapMarkerAlt, FaCreditCard, FaUserCog, FaHeart, FaEye, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './UserDashboard.module.css';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    isDefault: false
  });
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const ordersResponse = await orderAPI.getUserOrders();
      setOrders(ordersResponse.data || []);
      
      const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
      setAddresses(savedAddresses);
      
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(savedWishlist);
      
      const savedRecentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(savedRecentlyViewed);
      
      const savedPayments = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
      setPaymentMethods(savedPayments);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { bg: 'warning', text: 'Pending' },
      PROCESSING: { bg: 'info', text: 'Processing' },
      CONFIRMED: { bg: 'primary', text: 'Confirmed' },
      SHIPPED: { bg: 'info', text: 'Shipped' },
      DELIVERED: { bg: 'success', text: 'Delivered' },
      CANCELLED: { bg: 'danger', text: 'Cancelled' }
    };
    const config = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.firstName + ' ' + user?.lastName || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      const updatedAddresses = addresses.map(addr => 
        addr.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : addr
      );
      setAddresses(updatedAddresses);
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      showSuccess('Address updated successfully');
    } else {
      const newAddress = { ...addressForm, id: Date.now() };
      if (addressForm.isDefault) {
        const updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        setAddresses([...updatedAddresses, newAddress]);
        localStorage.setItem('userAddresses', JSON.stringify([...updatedAddresses, newAddress]));
      } else {
        setAddresses([...addresses, newAddress]);
        localStorage.setItem('userAddresses', JSON.stringify([...addresses, newAddress]));
      }
      showSuccess('Address added successfully');
    }
    setShowAddressModal(false);
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      showSuccess('Address deleted successfully');
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    showSuccess('Removed from wishlist');
  };

  const handleAddPaymentMethod = () => {
    showInfo('Payment method integration coming soon');
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-custom mx-auto"></div>
        <p className="mt-3 text-white">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <Row>
        {/* Sidebar */}
        <Col md={3}>
          <Card className={styles.sidebar}>
            <Card.Body className="text-center">
              <div className={styles.avatar}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <h5 className={styles.userName}>{user?.firstName} {user?.lastName}</h5>
              <p className={styles.userEmail}>{user?.email}</p>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{orders.length}</div>
                  <div className={styles.statLabel}>Orders</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{wishlist.length}</div>
                  <div className={styles.statLabel}>Wishlist</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{addresses.length}</div>
                  <div className={styles.statLabel}>Addresses</div>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card className={styles.menu}>
            <Card.Body className="p-0">
              <button 
                className={`${styles.menuItem} ${activeTab === 'orders' ? styles.menuItemActive : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <FaBox /> My Orders
              </button>
              <button 
                className={`${styles.menuItem} ${activeTab === 'addresses' ? styles.menuItemActive : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <FaMapMarkerAlt /> Saved Addresses
              </button>
              <button 
                className={`${styles.menuItem} ${activeTab === 'payments' ? styles.menuItemActive : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                <FaCreditCard /> Payment Methods
              </button>
              <button 
                className={`${styles.menuItem} ${activeTab === 'wishlist' ? styles.menuItemActive : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <FaHeart /> Wishlist
              </button>
              <button 
                className={`${styles.menuItem} ${activeTab === 'recent' ? styles.menuItemActive : ''}`}
                onClick={() => setActiveTab('recent')}
              >
                <FaEye /> Recently Viewed
              </button>
              <button 
                className={`${styles.menuItem} ${activeTab === 'settings' ? styles.menuItemActive : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <FaUserCog /> Account Settings
              </button>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col md={9}>
          <Card className={styles.content}>
            <Card.Body className={styles.contentBody}>
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h4 className={styles.sectionTitle}>My Orders</h4>
                  {orders.length === 0 ? (
                    <Alert variant="info">No orders yet. Start shopping!</Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className={styles.tableHover}>
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} onClick={() => navigate(`/orders/${order.orderNumber}`)}>
                              <td><code>{order.orderNumber}</code></td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>{order.items?.length || 0} items</td>
                              <td>${order.totalAmount}</td>
                              <td>{getStatusBadge(order.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className={styles.sectionTitle}>Saved Addresses</h4>
                    <Button variant="primary" size="sm" onClick={handleAddAddress}>
                      <FaPlus /> Add New Address
                    </Button>
                  </div>
                  {addresses.length === 0 ? (
                    <Alert variant="info">No saved addresses. Add one for faster checkout!</Alert>
                  ) : (
                    <Row>
                      {addresses.map((address) => (
                        <Col md={6} key={address.id} className="mb-3">
                          <Card className={styles.addressCard}>
                            <Card.Body>
                              {address.isDefault && <Badge bg="primary" className="mb-2">Default</Badge>}
                              <div><strong>{address.fullName}</strong></div>
                              <div>{address.street}</div>
                              <div>{address.city}, {address.state} {address.zipCode}</div>
                              <div>{address.country}</div>
                              <div className="text-muted small mt-2">{address.phone}</div>
                              <div className="mt-3">
                                <Button variant="outline-primary" size="sm" onClick={() => handleEditAddress(address)}>Edit</Button>
                                <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDeleteAddress(address.id)}>Delete</Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payments' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className={styles.sectionTitle}>Payment Methods</h4>
                    <Button variant="primary" size="sm" onClick={handleAddPaymentMethod}>
                      <FaPlus /> Add Payment Method
                    </Button>
                  </div>
                  {paymentMethods.length === 0 ? (
                    <Alert variant="info">No saved payment methods. Add one for faster checkout!</Alert>
                  ) : (
                    <Row>
                      {paymentMethods.map((method) => (
                        <Col md={6} key={method.id} className="mb-3">
                          <Card>
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{method.cardType}</strong>
                                  <div>•••• {method.last4}</div>
                                  <div className="text-muted small">Expires {method.expiryMonth}/{method.expiryYear}</div>
                                </div>
                                {method.isDefault && <Badge bg="primary">Default</Badge>}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h4 className={styles.sectionTitle}>Wishlist</h4>
                  {wishlist.length === 0 ? (
                    <Alert variant="info">Your wishlist is empty. Start adding products!</Alert>
                  ) : (
                    <Row>
                      {wishlist.map((product) => (
                        <Col md={4} key={product.id} className="mb-3">
                          <Card className={styles.wishlistCard}>
                            <Card.Img variant="top" src={product.imageUrl || 'https://placehold.co/300x200'} />
                            <Card.Body>
                              <Card.Title className="fs-6">{product.name}</Card.Title>
                              <Card.Text className="text-primary fw-bold">${product.price}</Card.Text>
                              <div className="d-flex gap-2">
                                <Button size="sm" variant="primary" onClick={() => navigate(`/products/${product.id}`)}>View</Button>
                                <Button size="sm" variant="danger" onClick={() => handleRemoveFromWishlist(product.id)}>Remove</Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )}

              {/* Recently Viewed Tab */}
              {activeTab === 'recent' && (
                <div>
                  <h4 className={styles.sectionTitle}>Recently Viewed</h4>
                  {recentlyViewed.length === 0 ? (
                    <Alert variant="info">No recently viewed products. Browse some products!</Alert>
                  ) : (
                    <Row>
                      {recentlyViewed.map((product) => (
                        <Col md={4} key={product.id} className="mb-3">
                          <Card className={styles.recentCard}>
                            <Card.Img variant="top" src={product.imageUrl || 'https://placehold.co/300x200'} />
                            <Card.Body>
                              <Card.Title className="fs-6">{product.name}</Card.Title>
                              <Card.Text className="text-primary fw-bold">${product.price}</Card.Text>
                              <Button size="sm" variant="primary" onClick={() => navigate(`/products/${product.id}`)}>View Again</Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h4 className={styles.sectionTitle}>Account Settings</h4>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control type="text" defaultValue={user?.firstName} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control type="text" defaultValue={user?.lastName} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control type="email" defaultValue={user?.email} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control type="tel" defaultValue={user?.phoneNumber || ''} />
                    </Form.Group>
                    <hr />
                    <h5 className="mb-3">Change Password</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control type="password" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control type="password" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control type="password" />
                    </Form.Group>
                    <Button variant="primary">Save Changes</Button>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingAddress ? 'Edit Address' : 'Add New Address'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Street Address</Form.Label>
              <Form.Control
                type="text"
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Set as default address"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveAddress}>Save Address</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserDashboard;
