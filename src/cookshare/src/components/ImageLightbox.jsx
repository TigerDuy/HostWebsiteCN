import { useState, useEffect } from 'react';
import './ImageLightbox.css';

function ImageLightbox({ src, alt, className, style }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt || 'Image'}
        className={`lightbox-trigger ${className || ''}`}
        style={{ cursor: 'zoom-in', ...style }}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div className="lightbox-overlay" onClick={() => setIsOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsOpen(false)}>
            ✕
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={src} alt={alt || 'Image'} className="lightbox-image" />
          </div>
          <p className="lightbox-hint">Nhấn ESC hoặc click bên ngoài để đóng</p>
        </div>
      )}
    </>
  );
}

export default ImageLightbox;
