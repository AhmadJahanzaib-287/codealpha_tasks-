const categories = ['all', 'nature', 'city', 'tech'];

export const FilterBar = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="filter-bar">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
};