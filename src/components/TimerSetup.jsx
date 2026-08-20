import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Toggle } from './ui/toggle';
import { cn } from '../lib/utils';

const ROUND_DURATIONS = [30, 60, 90, 120, 150, 180, 240, 300];
const REST_DURATIONS = [15, 30, 45, 60, 90, 120, 180, 300];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TimerSetup({ settings, setSettings, onStart }) {
  const changeRounds = (delta) => {
    setSettings(s => ({ ...s, rounds: Math.max(1, Math.min(20, s.rounds + delta)) }));
  };

  const changeRoundDuration = (delta) => {
    const idx = ROUND_DURATIONS.indexOf(settings.roundDuration);
    const newIdx = Math.max(0, Math.min(ROUND_DURATIONS.length - 1, idx + delta));
    setSettings(s => ({ ...s, roundDuration: ROUND_DURATIONS[newIdx] }));
  };

  const changeRestDuration = (delta) => {
    const idx = REST_DURATIONS.indexOf(settings.restDuration);
    const newIdx = Math.max(0, Math.min(REST_DURATIONS.length - 1, idx + delta));
    setSettings(s => ({ ...s, restDuration: REST_DURATIONS[newIdx] }));
  };

  const roundIdx = ROUND_DURATIONS.indexOf(settings.roundDuration);
  const restIdx = REST_DURATIONS.indexOf(settings.restDuration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full flex-col px-6 pt-6 pb-4"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Boxing Timer</h1>
      </div>

      <p className="text-muted-foreground text-sm mb-8">Set your rounds. Start training.</p>

      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rounds</span>
          <div className="flex items-center gap-3">
            <button onClick={() => changeRounds(-1)} disabled={settings.rounds <= 1}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground disabled:opacity-30 transition-opacity">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-lg font-semibold tabular-nums">{settings.rounds}</span>
            <button onClick={() => changeRounds(1)} disabled={settings.rounds >= 20}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground disabled:opacity-30 transition-opacity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Round</span>
          <div className="flex items-center gap-3">
            <button onClick={() => changeRoundDuration(-1)} disabled={roundIdx <= 0}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground disabled:opacity-30 transition-opacity">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-14 text-center text-lg font-semibold tabular-nums">{formatTime(settings.roundDuration)}</span>
            <button onClick={() => changeRoundDuration(1)} disabled={roundIdx >= ROUND_DURATIONS.length - 1}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground disabled:opacity-30 transition-opacity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rest</span>
          <div className="flex items-center gap-3">
            <button onClick={() => changeRestDuration(-1)} disabled={restIdx <= 0}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground disabled:opacity-30 transition-opacity">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-14 text-center text-lg font-semibold tabular-nums">{formatTime(settings.restDuration)}</span>
            <button onClick={() => changeRestDuration(1)} disabled={restIdx >= REST_DURATIONS.length - 1}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground disabled:opacity-30 transition-opacity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Start countdown</span>
          <Toggle checked={settings.startCountdown} onCheckedChange={(v) => setSettings(s => ({ ...s, startCountdown: v }))} />
        </div>
      </div>

      <Button size="pill" className="w-full mt-8" onClick={onStart}>
        Start Workout
      </Button>
    </motion.div>
  );
}
