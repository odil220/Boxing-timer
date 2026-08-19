import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 90;
const RADIUS = 90;
const CENTER = 100;

export default function CircularPlayer({ currentTime, duration, progress, isPlaying, songName, artist,
  onPlayPause, onSeek, onNext, onPrevious, formatTime }) {

  const size = 256; // 16rem
  const offset = progress * CIRCUMFERENCE;

  const handleCircleClick = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x) + Math.PI / 2;
    const normalized = angle < 0 ? angle + 2 * Math.PI : angle;
    const clickProgress = normalized / (2 * Math.PI);
    if (duration > 0 && onSeek) {
      onSeek(Math.min(duration, Math.max(0, clickProgress * duration)));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      {/* Circular progress */}
      <div
        className="relative flex items-center justify-center mb-8 cursor-pointer"
        onClick={handleCircleClick}
        style={{ width: size, height: size }}
      >
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 200 200"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-border opacity-30"
          />
          {/* Progress circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: CIRCUMFERENCE - offset,
            }}
          />
        </svg>

        {/* Center content: song info and time */}
        <div className="flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <p className="text-sm font-medium truncate max-w-[180px] leading-tight">{songName || 'No song'}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{artist || ''}</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</p>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <button
          onClick={onPrevious}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={onPlayPause}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
        >
          {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
        </button>

        <button
          onClick={onNext}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
