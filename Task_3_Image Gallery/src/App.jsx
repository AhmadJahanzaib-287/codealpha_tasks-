import { useState } from 'react';
import { galleryData } from './data/gallerydata';
import { FilterBar } from './components/FilterBar';
import { GalleryGrid } from './components/GalleryGrid';
import { Lightbox } from './components/Lightbox';
import './styles/App.css';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems = activeCategory === 'all'
    ? galleryData
    : galleryData.filter(item => item.category === activeCategory);

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="app-container">
      <header className="gallery-header">
        <h1>Interactive Gallery</h1>
        <p>Explore high-resolution visual collections</p>
      </header>

      <FilterBar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setLightboxIndex(null);
        }}
      />

      <GalleryGrid
        items={filteredItems}
        onOpenLightbox={handleOpenLightbox}
      />

      <footer className="site-credit">Built By : Ahmad Jahanzaib</footer>

      <Lightbox
        items={filteredItems}
        currentIndex={lightboxIndex}
        onClose={handleCloseLightbox}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}