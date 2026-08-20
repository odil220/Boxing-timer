import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import TimerSetup from './components/TimerSetup';
import ActiveTimer from './components/ActiveTimer';
import CompletionView from './components/CompletionView';
import ConfirmDialog from './components/ConfirmDialog';
import MusicTab from './components/music/MusicTab';
import { useTimer } from './hooks/useTimer';
import { useMusicPlayer } from './hooks/useMusicPlayer';

export default function App() {
  const [page, setPage] = useState('timer');
  const [settings, setSettings] = useState({
    rounds: 6,
    roundDuration: 180,
    restDuration: 60,
    startCountdown: true,
    soundEnabled: true,
    theme: 'system',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { timer, startWorkout, pause, resume, endWorkout } = useTimer(settings, settings.soundEnabled);
  const music = useMusicPlayer();

  const handleStart = () => { startWorkout(); };

  const handlePause = () => {
    if (timer.isPaused) { resume(); } else { pause(); }
  };

  const handleEnd = () => { setDialogOpen(true); };
  const handleConfirmEnd = () => { setDialogOpen(false); endWorkout(); };
  const handleStartAgain = () => { startWorkout(); };
  const handleDone = () => { endWorkout(); };

  const showTimer = page === 'timer';
  const showMusic = page === 'music';

  return (
    <div className="h-dvh w-full bg-background text-foreground flex flex-col overflow-hidden max-w-md mx-auto">
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showTimer && timer.phase === 'setup' && (
            <TimerSetup key="setup" settings={settings} setSettings={setSettings} onStart={handleStart} />
          )}
          {showTimer && ['countdown', 'round', 'rest', 'paused'].includes(timer.phase) && (
            <ActiveTimer key="timer" timer={timer} settings={settings} onPause={handlePause} onEnd={handleEnd} />
          )}
          {showTimer && timer.phase === 'complete' && (
            <CompletionView key="complete" rounds={settings.rounds} onDone={handleDone} onAgain={handleStartAgain} />
          )}
          {showMusic && <MusicTab key="music" player={music} />}
        </AnimatePresence>
      </main>

      <BottomNav page={page} onChange={setPage} />
      <ConfirmDialog open={dialogOpen} onConfirm={handleConfirmEnd} onCancel={() => setDialogOpen(false)} />
    </div>
  );
}
