function Playlist({ songs, currentSongId, onSelect }) {
  return (
    <aside className="playlist-panel">
      <div className="playlist-heading">
        <div>
          <p className="eyebrow">Your queue</p>
          <h2>Playlist</h2>
        </div>
        <span className="track-count">{songs.length} tracks</span>
      </div>
      <div className="playlist-list">
        {songs.map((song, index) => {
          const isActive = song.id === currentSongId;
          return (
            <button
              className={`playlist-item ${isActive ? "active" : ""}`}
              key={song.id}
              onClick={() => onSelect(song.id)}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="track-number">
                {isActive ? "♪" : String(index + 1).padStart(2, "0")}
              </span>
              <img src={song.cover} alt="" />
              <span className="track-info">
                <strong>{song.title}</strong>
                <small>{song.artist}</small>
              </span>
              <span className="track-duration">{song.duration}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default Playlist;
