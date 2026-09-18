function VolumeBar({ volume, isMuted, onVolumeChange, onToggleMute }) {
  return (
    <div className="volume-area">
      <button
        className="volume-button"
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <span aria-hidden="true">{isMuted || volume === 0 ? "◌" : "◖"}</span>
      </button>
      <input
        className="range-input volume-input"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        style={{ "--progress": `${(isMuted ? 0 : volume) * 100}%` }}
        aria-label="Volume"
      />
    </div>
  );
}

export default VolumeBar;
