function Controls({
  isPlaying,
  isShuffled,
  repeatMode,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
}) {
  return (
    <div className="controls" aria-label="Playback controls">
      <button
        className={`control-button secondary ${isShuffled ? "selected" : ""}`}
        onClick={onToggleShuffle}
        aria-label="Toggle shuffle"
        aria-pressed={isShuffled}
      >
        <span aria-hidden="true">⌘</span>
      </button>
      <button
        className="control-button secondary"
        onClick={onPrevious}
        aria-label="Previous song"
      >
        <span aria-hidden="true">|◀</span>
      </button>
      <button
        className="play-button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
      </button>
      <button
        className="control-button secondary"
        onClick={onNext}
        aria-label="Next song"
      >
        <span aria-hidden="true">▶|</span>
      </button>
      <button
        className={`control-button secondary ${repeatMode ? "selected" : ""}`}
        onClick={onToggleRepeat}
        aria-label="Toggle repeat"
        aria-pressed={repeatMode}
      >
        <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}

export default Controls;
