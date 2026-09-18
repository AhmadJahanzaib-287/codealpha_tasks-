import { useEffect, useRef, useState } from "react";
import Controls from "./components/Controls";
import PlayerCard from "./components/PlayerCard";
import Playlist from "./components/Playlist";
import ProgressBar from "./components/ProgressBar";
import VolumeBar from "./components/VolumeBar";
import songsData from "./data/songsData";
import "./styles/App.css";

function App() {
  const audioRef = useRef(null);
  const [currentSongId, setCurrentSongId] = useState(songsData[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.72);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const currentSong =
    songsData.find((song) => song.id === currentSongId) || songsData[0];

  useEffect(() => {
    const audio = audioRef.current;
    audio.pause();
    audio.src = currentSong.audio;
    audio.load();
    setCurrentTime(0);

    if (isPlaying) {
      const resumePlayback = () =>
        audio.play().catch(() => setIsPlaying(false));
      audio.addEventListener("canplay", resumePlayback, { once: true });
      return () => audio.removeEventListener("canplay", resumePlayback);
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const selectSong = (id, shouldPlay = true) => {
    setCurrentSongId(id);
    setIsPlaying(shouldPlay);
  };

  const nextSong = () => {
    const nextIndex = isShuffled
      ? Math.floor(Math.random() * songsData.length)
      : (songsData.findIndex((song) => song.id === currentSongId) + 1) %
        songsData.length;
    selectSong(songsData[nextIndex].id);
  };

  const previousSong = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const currentIndex = songsData.findIndex(
      (song) => song.id === currentSongId,
    );
    selectSong(
      songsData[(currentIndex - 1 + songsData.length) % songsData.length].id,
    );
  };

  const togglePlay = () => {
    setIsPlaying((playing) => !playing);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleShuffle = () => {
    setIsShuffled((value) => !value);
  };

  const toggleRepeat = () => {
    setRepeatMode((value) => !value);
  };

  const toggleMute = () => {
    setIsMuted((value) => !value);
  };

  const handleEnded = () => {
    if (repeatMode) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else nextSong();
  };

  return (
    <main className="app-shell">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">♪</span>
          <span>sonora</span>
        </div>
        <span className="status">
          <i /> Listening session
        </span>
      </header>
      <div className="player-layout">
        <section className="main-player">
          <div className="section-kicker">
            <span>01</span>
            <span>Immersive listening</span>
          </div>
          <PlayerCard song={currentSong} isPlaying={isPlaying} />
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
          <Controls
            isPlaying={isPlaying}
            isShuffled={isShuffled}
            repeatMode={repeatMode}
            onTogglePlay={togglePlay}
            onPrevious={previousSong}
            onNext={nextSong}
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeat}
          />
          <VolumeBar
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
          />
        </section>
        <Playlist
          songs={songsData}
          currentSongId={currentSongId}
          onSelect={(id) => selectSong(id, true)}
        />
      </div>
      <footer>
        <span>STEREO / 44.1 KHZ</span>
        <span>Built By: Ahmad Jahanzaib</span>
      </footer>
    </main>
  );
}

export default App;
