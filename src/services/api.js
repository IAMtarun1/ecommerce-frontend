import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

console.log('🚀 API URL configured as:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Flag to prevent multiple redirects
let isRedirecting = false;

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token added for: ${config.url}`);
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error ${error.response.status}:`, error.response.data);
      
      // Handle 401 Unauthorized - token expired
      if (error.response.status === 401 && !isRedirecting) {
        isRedirecting = true;
        console.log('Token expired or invalid. Redirecting to login...');
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show message to user
        const message = error.response.data?.message || 'Your session has expired. Please login again.';
        
        // Redirect to login page
        window.location.href = '/login';
        
        // Reset flag after redirect
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    } else if (error.request) {
      console.error('❌ No response from server');
    }
    return Promise.reject(error);
  }
);

// Cart endpoints
export const cartAPI = {
  getCart: () => {
    console.log('🛒 Fetching cart...');
    return api.get('/cart');
  },
  addItem: (productId, quantity) => {
    console.log(`➕ Adding product ${productId} to cart...`);
    return api.post('/cart/add', { productId, quantity });
  },
  updateItem: (itemId, quantity) => {
    console.log(`🔄 Updating cart item ${itemId} to quantity ${quantity}`);
    return api.put(`/cart/items/${itemId}?quantity=${quantity}`);
  },
  removeItem: (itemId) => {
    console.log(`❌ Removing cart item ${itemId}`);
    return api.delete(`/cart/items/${itemId}`);
  },
  clearCart: () => {
    console.log('🗑️ Clearing cart');
    return api.delete('/cart/clear');
  },
};

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  checkEmail: (email) => api.get(`/auth/check-email?email=${email}`),
};

// Product endpoints
export const productAPI = {
  getAll: () => {
    console.log('🛍️ Fetching products...');
    return api.get('/products');
  },
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

// Order endpoints
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  checkout: (shippingAddress, paymentMethod) => 
    api.post(`/orders/checkout?shippingAddress=${encodeURIComponent(shippingAddress)}&paymentMethod=${paymentMethod}`),
  getUserOrders: () => api.get('/orders'),
  getOrderByNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
  getAllOrders: () => api.get('/orders/admin/all'),
  updateOrderStatus: (orderId, status) => api.put(`/orders/${orderId}/status?status=${status}`),
};

// Payment endpoints
export const paymentAPI = {
  createPaymentIntent: (orderId, paymentMethodId) => 
    api.post('/payments/create-intent', { orderId, paymentMethodId }),
  confirmPayment: (paymentIntentId) => 
    api.post(`/payments/confirm/${paymentIntentId}`),
};

export default api;
