import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="display-3 fw-bold mb-4">
                Shop the Best <br />
                <span style={{ color: '#ffd700' }}>Deals Online</span>
              </h1>
              <p className="lead mb-4">
                Discover amazing products at unbeatable prices. 
                Free shipping on orders over $50!
              </p>
              <Button 
                variant="light" 
                size="lg" 
                onClick={() => navigate('/products')}
                style={{ borderRadius: '50px', padding: '12px 32px' }}
              >
                Shop Now →
              </Button>
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <img 
                src="/hero-image.png" 
                alt="Shopping"
                className="img-fluid"
                style={{ 
                  borderRadius: '30px', 
                  boxShadow: '0 0 40px rgba(0, 242, 254, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Hero;
