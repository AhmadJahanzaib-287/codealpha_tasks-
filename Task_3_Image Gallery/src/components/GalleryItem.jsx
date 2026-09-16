export const GalleryItem = ({ item, onClick }) => {
  return (
    <button className="gallery-item" type="button" onClick={onClick}>
      <img src={item.src} alt={item.title} loading="lazy" decoding="async" />
      <div className="overlay">
        <h3>{item.title}</h3>
        <span>{item.category}</span>
      </div>
    </button>
  );
};