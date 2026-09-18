function PlayerCard({ song, isPlaying }) {
  return (
    <section className="player-card" aria-label="Currently playing">
      <div className="artwork-wrap">
        <img
          className="artwork"
          src={song.cover}
          alt={`${song.title} album art`}
        />
        <span
          className={`playing-orb ${isPlaying ? "is-playing" : ""}`}
          aria-hidden="true"
        />
      </div>
      <div className="song-copy">
        <p className="eyebrow">Now playing</p>
        <h1>{song.title}</h1>
        <p className="artist">{song.artist}</p>
        <p className="album">{song.album}</p>
      </div>
    </section>
  );
}

export default PlayerCard;
