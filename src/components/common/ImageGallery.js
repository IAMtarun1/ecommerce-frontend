import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaTimes, FaSearchPlus } from 'react-icons/fa';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images, productName, defaultImage }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Ensure images is an array
  const imageList = Array.isArray(images) && images.length > 0 ? images : [defaultImage];
  const currentImage = imageList[selectedIndex];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleImageError = (e) => {
    e.target.src = defaultImage || 'https://placehold.co/500x500/667eea/white?text=No+Image';
  };

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div className={styles.mainImageContainer}>
        <img
          src={currentImage}
          alt={productName}
          className={styles.mainImage}
          onError={handleImageError}
        />
        <button 
          className={styles.zoomBtn}
          onClick={() => setLightboxOpen(true)}
          aria-label="Zoom in"
        >
          <FaSearchPlus />
        </button>
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className={styles.thumbnailContainer}>
          {imageList.map((img, index) => (
            <div
              key={index}
              className={`${styles.thumbnail} ${selectedIndex === index ? styles.activeThumbnail : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={img}
                alt={`${productName} - view ${index + 1}`}
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Modal
        show={lightboxOpen}
        onHide={() => setLightboxOpen(false)}
        centered
        size="lg"
        contentClassName={styles.lightboxContent}
      >
        <Modal.Body className={styles.lightboxBody}>
          <button className={styles.closeLightbox} onClick={() => setLightboxOpen(false)} aria-label="Close">
            <FaTimes />
          </button>
          
          <div className={styles.lightboxImageContainer}>
            <img
              src={currentImage}
              alt={productName}
              className={styles.lightboxImage}
              onError={handleImageError}
            />
            
            {imageList.length > 1 && (
              <>
                <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevImage} aria-label="Previous image">
                  <FaChevronLeft />
                </button>
                <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextImage} aria-label="Next image">
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
          
          <div className={styles.lightboxCaption}>
            {productName} - Image {selectedIndex + 1} of {imageList.length}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ImageGallery;
