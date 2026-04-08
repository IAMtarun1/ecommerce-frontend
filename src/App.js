import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import {AuthProvider} from './context/AuthContext';
import Navigation from './components/common/Navbar';
import Hero from './components/common/Hero';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import Cart from './components/cart/Cart';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OrderHistory from './components/orders/OrderHistory';
import Profile from './components/profile/Profile';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminOrders from './components/admin/AdminOrders';
import AdminUsers from './components/admin/AdminUsers';
import {ProtectedRoute, PublicOnlyRoute} from './components/common/ProtectedRoute';
import UserDashboard from './components/dashboard/UserDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navigation/>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                        duration: 3000,
                        className: 'go-toast',
                        success: {
                            duration: 3000,
                            icon: null,
                        },
                        error: {
                            duration: 4000,
                            icon: null,
                        },
                        loading: {
                            duration: Infinity,
                            icon: null,
                        },
                    }}
                />
                <div className="main-container">
                    <Routes>
                        {/* Public Routes - Everyone can access */}
                        <Route path="/" element={
                            <>
                                <Hero/>
                                <ProductList/>
                            </>
                        }/>
                        <Route path="/products" element={<ProductList/>}/>
                        <Route path="/products/:id" element={<ProductDetail/>}/>
                        <Route path="/dashboard" element={<UserDashboard/>}/>


                        {/* Public Only Routes - Redirect to home if already logged in */}
                        <Route element={<PublicOnlyRoute/>}>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/register" element={<Register/>}/>
                        </Route>

                        {/* Protected Routes - Require authentication */}
                        <Route element={<ProtectedRoute/>}>
                            <Route path="/cart" element={<Cart/>}/>
                            <Route path="/orders" element={<OrderHistory/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                        </Route>

                        {/* Admin Routes - Protected with Admin check inside component */}
                        <Route path="/admin" element={<ProtectedRoute/>}>
                            <Route element={<AdminLayout/>}>
                                <Route index element={<AdminDashboard/>}/>
                                <Route path="products" element={<AdminProducts/>}/>
                                <Route path="orders" element={<AdminOrders/>}/>
                                <Route path="users" element={<AdminUsers/>}/>
                            </Route>
                        </Route>
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
