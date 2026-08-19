import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Music } from 'lucide-react';
import BottomNav from './components/BottomNav';
import TimerSetup from './components/TimerSetup';
import ActiveTimer from './components/ActiveTimer';
import CompletionView from './components/CompletionView';
import MusicPage from './components/MusicPage';
import ConfirmDialog from './components/ConfirmDialog';
import SettingsSheet from './components/SettingsSheet';
import { useTimer } from './hooks/useTimer';
import { useMusicPlayer } from './hooks/useAudio';

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { timer, startWorkout, pause, resume, endWorkout, playBeep } = useTimer(settings, settings.soundEnabled);
  const music = useMusicPlayer();

  const handleStart = () => {
    startWorkout();
  };

  const handlePause = () => {
    if (timer.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleEnd = () => {
    setDialogOpen(true);
  };

  const handleConfirmEnd = () => {
    setDialogOpen(false);
    endWorkout();
  };

  const handleStartAgain = () => {
    startWorkout();
  };

  const handleDone = () => {
    endWorkout();
  };

  const showTimer = page === 'timer';
  const showMusic = page === 'music';

  return (
    <div className="h-dvh w-full bg-background text-foreground flex flex-col overflow-hidden max-w-md mx-auto">
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showTimer && timer.phase === 'setup' && (
            <TimerSetup key="setup" settings={settings} setSettings={setSettings} onStart={handleStart} onOpenSettings={() => setSettingsOpen(true)} />
          )}
          {showTimer && ['countdown', 'round', 'rest', 'paused'].includes(timer.phase) && (
            <ActiveTimer key="timer" timer={timer} settings={settings} onPause={handlePause} onEnd={handleEnd} />
          )}
          {showTimer && timer.phase === 'complete' && (
            <CompletionView key="complete" rounds={settings.rounds} onDone={handleDone} onAgain={handleStartAgain} />
          )}
          {showMusic && <MusicPage key="music" />}
        </AnimatePresence>
      </main>

      <BottomNav page={page} onChange={setPage} />

      <ConfirmDialog open={dialogOpen} onConfirm={handleConfirmEnd} onCancel={() => setDialogOpen(false)} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} setSettings={setSettings} />
    </div>
  );
}
