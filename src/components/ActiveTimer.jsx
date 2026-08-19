import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Square } from 'lucide-react';
import { Button } from './ui/button';

const CIRCUMFERENCE = 2 * Math.PI * 90;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ActiveTimer({ timer, settings, onPause, onEnd }) {
  const [displayTime, setDisplayTime] = useState(formatTime(timer.remaining));
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    setDisplayTime(formatTime(Math.max(0, timer.remaining)));
    const duration = timer.phase === 'round' ? settings.roundDuration : timer.phase === 'rest' ? settings.restDuration : 0;
    setProgress(duration > 0 ? Math.max(0, Math.min(1, 1 - timer.remaining / duration)) : 0);
  }, [timer.remaining, timer.phase, settings]);

  useEffect(() => {
    if (timer.isPaused || timer.phase === 'complete') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      // We rely on parent tick; this effect just ensures UI stays smooth
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [timer.isPaused, timer.phase]);

  const isFinalRound = timer.phase === 'round' && timer.currentRound >= settings.rounds;
  const phaseLabel = timer.isPaused ? 'PAUSED' : timer.phase === 'rest' ? 'REST' : isFinalRound ? 'FINAL ROUND' : 'ROUND';
  const phaseColor = timer.phase === 'rest' ? 'text-muted-foreground' : 'text-primary';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center relative"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phaseLabel}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`text-sm font-semibold tracking-[0.2em] uppercase mb-4 ${phaseColor}`}
        >
          {phaseLabel}
        </motion.div>
      </AnimatePresence>

      <div className="relative flex items-center justify-center mb-6">
        <svg className="absolute inset-0 h-64 w-64 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border opacity-50" />
          <circle
            cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: CIRCUMFERENCE * (1 - progress),
            }}
          />
        </svg>
        <motion.div
          key={displayTime}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-7xl font-bold tracking-tighter tabular-nums"
        >
          {displayTime}
        </motion.div>
      </div>

      <div className="text-sm text-muted-foreground mb-8 tabular-nums">
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
