function formatTime(value) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ProgressBar({ currentTime, duration, onSeek }) {
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="progress-area">
      <div className="progress-labels">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <input
        className="range-input"
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={currentTime}
        onChange={(event) => onSeek(Number(event.target.value))}
        style={{ "--progress": `${progress}%` }}
        aria-label="Seek through song"
      />
    </div>
  );
}

export default ProgressBar;
