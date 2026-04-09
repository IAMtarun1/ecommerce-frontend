import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showLoadingToast } from '../../utils/toast';
import { motion } from 'framer-motion';
import { FaGoogle, FaApple, FaShoppingBag } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await showLoadingToast(
        'Creating your account...',
        'Account created successfully! Welcome aboard!',
        'Registration failed',
        async () => {
          const result = await register(formData);
          if (!result.success) {
            throw new Error(result.message);
          }
          return result;
        }
      );
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-modern">
      <div className="auth-grid">
        {/* Left Side - Brand Section */}
        <div className="auth-brand-side">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="brand-content-modern"
          >
            <div className="brand-logo-modern">
              <FaShoppingBag size={42} />
              <h1>ShopHub</h1>
            </div>
            <h2>Join our community</h2>
            <p>Create an account to enjoy exclusive deals and faster checkout</p>
            <div className="brand-features-modern">
              <div className="feature">
                <span>✓</span> Exclusive member discounts
              </div>
              <div className="feature">
                <span>✓</span> Early access to sales
              </div>
              <div className="feature">
                <span>✓</span> Free shipping on orders over $50
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form Section */}
        <div className="auth-form-side">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="form-container-modern"
          >
            <div className="form-header-modern">
              <h2>Create account</h2>
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link-modern">
                  Log in
                </Link>
              </p>
            </div>

            {error && (
              <div className="alert-modern alert-error-modern">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row-modern">
                <div className="col-modern">
                  <div className="input-group-modern">
                    <label>First name</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>
                </div>
                <div className="col-modern">
                  <div className="input-group-modern">
                    <label>Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>
                </div>
              </div>

              <div className="input-group-modern">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-modern"
                />
              </div>

              <div className="input-group-modern">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-modern"
                />
              </div>

              <div className="checkbox-group-modern">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>I agree to the Terms & Conditions</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="submit-btn-modern"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="divider-modern">
              <span>Or register with</span>
            </div>

            <div className="social-buttons-modern">
              <button className="social-btn-modern">
                <FaGoogle /> Google
              </button>
              <button className="social-btn-modern">
                <FaApple /> Apple
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
