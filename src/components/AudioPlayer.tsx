import { useState, useRef, useEffect, useMemo } from "react";

interface AudioPlayerProps {
  src: string;
  duration?: number;
  className?: string;
}

const AudioPlayer = ({ src, duration, className = "" }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate consistent wave heights based on src
  const waveHeights = useMemo(() => {
    const seed = src.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const heights = [];
    for (let i = 0; i < 20; i++) {
      const pseudoRandom = Math.sin(seed + i) * 10000;
      heights.push((Math.abs(pseudoRandom) % 20) + 8);
    }
    return heights;
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      const actualDuration = audio.duration;
      if (isFinite(actualDuration) && actualDuration > 0) {
        setAudioDuration(actualDuration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      const actualDuration = audio.duration;
      if (isFinite(actualDuration) && actualDuration > 0) {
        setAudioDuration(actualDuration);
      }
      setIsLoading(false);
    };

    const handleDurationChange = () => {
      const actualDuration = audio.duration;
      if (isFinite(actualDuration) && actualDuration > 0) {
        setAudioDuration(actualDuration);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("durationchange", handleDurationChange);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [src]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || audioDuration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * audioDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = (() => {
    const audio = audioRef.current;
    if (!audio) return 0;

    // Use real-time duration from audio element if available
    const duration =
      audio.duration && isFinite(audio.duration)
        ? audio.duration
        : audioDuration;
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  })();

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-xs ${className}`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex-shrink-0 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className="flex items-center gap-1 h-8 cursor-pointer relative"
          onClick={handleSeek}
        >
          {/* Sound wave bars */}
          {waveHeights.map((barHeight, i) => {
            const isActive = progress > (i / waveHeights.length) * 100;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isActive ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>

        <div className="flex justify-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>
            {isPlaying
              ? formatTime(currentTime)
              : formatTime(duration || audioDuration || 0)}
          </span>
        </div>
      </div>

      <div className="flex items-center text-gray-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
          <line x1="8" x2="16" y1="22" y2="22" />
        </svg>
      </div>
    </div>
  );
};

export default AudioPlayer;
