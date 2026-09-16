import { GalleryItem } from './GalleryItem';

export const GalleryGrid = ({ items, onOpenLightbox }) => {
  return (
    <div className="gallery-grid">
      {items.map((item, index) => (
        <GalleryItem
          key={item.id}
          item={item}
          onClick={() => onOpenLightbox(index)}
        />
      ))}
    </div>
  );
};
