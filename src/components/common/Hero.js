import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.hero}>
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className={styles.title}>
                Shop the Best <br />
                <span className={styles.highlight}>Deals Online</span>
              </h1>
              <p className={styles.subtitle}>
                Discover amazing products at unbeatable prices. 
                Free shipping on orders over $50!
              </p>
              <button 
                className={styles.shopBtn}
                onClick={() => navigate('/products')}
              >
                Shop Now →
              </button>
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
                className={styles.image}
              />
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Hero;
