import { useEffect } from 'react';

export const Lightbox = ({ items, currentIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (currentIndex === null) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose, onPrev, onNext]);

  if (currentIndex === null) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" type="button" onClick={onClose} aria-label="Close image viewer">&times;</button>
        <button className="nav-btn prev-btn" type="button" onClick={onPrev} aria-label="Previous image">&#10094;</button>
        
        <div className="lightbox-image-container">
          <img src={currentItem.src} alt={currentItem.title} decoding="async" />
          <div className="lightbox-caption">
            <h4>{currentItem.title}</h4>
            <p>{currentIndex + 1} / {items.length}</p>
          </div>
        </div>

        <button className="nav-btn next-btn" type="button" onClick={onNext} aria-label="Next image">&#10095;</button>
      </div>
    </div>
  );
};