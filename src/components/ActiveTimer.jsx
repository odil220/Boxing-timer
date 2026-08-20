import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { Button } from './ui/button';

const CIRCUMFERENCE = 2 * Math.PI * 90;
const RADIUS = 90;
const CENTER = 100;
const SIZE = 256; // 16rem

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ActiveTimer({ timer, settings, onPause, onEnd }) {
  const [displayTime, setDisplayTime] = useState(formatTime(timer.remaining));
  const [progress, setProgress] = useState(0);

  const lastRemainingRef = useRef(timer.remaining);
  const lastRemainingTimeRef = useRef(Date.now());

  useEffect(() => {
    lastRemainingRef.current = timer.remaining;
    lastRemainingTimeRef.current = Date.now();
  }, [timer.remaining, timer.phase, timer.isPaused]);

  const getLiveRemaining = () => {
    const elapsed = (Date.now() - lastRemainingTimeRef.current) / 1000;
    return Math.max(0, lastRemainingRef.current - elapsed);
  };

  // RAF loop for smooth time updates (no blinking)
  useEffect(() => {
    if (timer.isPaused || timer.phase === 'complete' || timer.phase === 'setup') {
      setDisplayTime(formatTime(timer.remaining));
      const duration = timer.phase === 'round' ? settings.roundDuration : timer.phase === 'rest' ? settings.restDuration : 0;
      setProgress(duration > 0 ? Math.max(0, Math.min(1, 1 - timer.remaining / duration)) : 0);
      return;
    }

    let rafRef;
    const tick = () => {
      const remaining = getLiveRemaining();
      setDisplayTime(formatTime(remaining));

      const duration = timer.phase === 'round' ? settings.roundDuration : timer.phase === 'rest' ? settings.restDuration : 0;
      setProgress(duration > 0 ? Math.max(0, Math.min(1, 1 - remaining / duration)) : 0);

      rafRef = requestAnimationFrame(tick);
    };

    rafRef = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef);
  }, [timer.isPaused, timer.phase, settings, timer.remaining]);

  const isFinalRound = timer.phase === 'round' && timer.currentRound >= settings.rounds;
  const phaseLabel = timer.isPaused ? 'PAUSED' : timer.phase === 'rest' ? 'REST' : isFinalRound ? 'FINAL ROUND' : 'ROUND';
  const phaseColor = timer.phase === 'rest' ? 'text-red-400' : 'text-primary';
  const isRest = timer.phase === 'rest';

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Red overlay during rest time */}
      {isRest && (
        <motion.div
          className="absolute inset-0 bg-red-900/20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <div className={`text-sm font-semibold tracking-[0.2em] uppercase mb-4 ${phaseColor}`}>
        {phaseLabel}
      </div>

      {/* Circular timer with centered time display */}
      <div className="relative flex items-center justify-center mb-6" style={{ width: SIZE, height: SIZE }}>
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 200 200"
          width={SIZE}
          height={SIZE}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={isRest ? "text-red-800/30" : "text-border opacity-30"}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={isRest ? "text-red-500" : "text-primary transition-all duration-300"}
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: CIRCUMFERENCE * (1 - progress),
            }}
          />
        </svg>

        <div className="flex flex-col items-center justify-center text-center">
          <div className={`text-7xl font-bold tracking-tighter tabular-nums ${isRest ? 'text-red-400' : ''}`}>
            {displayTime}
          </div>
        </div>
      </div>

      <div className={`text-sm mb-8 tabular-nums ${isRest ? 'text-red-300/70' : 'text-muted-foreground'}`}>
        Round {timer.currentRound} of {settings.rounds}
      </div>

      <div className="flex flex-col items-center gap-4 mt-auto mb-8">
        <Button size="icon" className="h-16 w-16 rounded-full" onClick={onPause}>
          {timer.isPaused ? <Play className="h-6 w-6 fill-current" /> : <Pause className="h-6 w-6 fill-current" />}
        </Button>
        <button onClick={onEnd} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
          End Workout
        </button>
      </div>
    </motion.div>
  );
}
