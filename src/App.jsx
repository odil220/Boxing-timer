import { useEffect, useState } from 'react';
import ActiveTimer from './components/ActiveTimer';
import BottomNav from './components/BottomNav';
import CompletionView from './components/CompletionView';
import ConfirmDialog from './components/ConfirmDialog';
import MusicPage from './components/MusicPage';
import TimerSetup from './components/TimerSetup';
import useAudio from './hooks/useAudio';
import useTimer from './hooks/useTimer';

const defaults = { rounds: 6, roundDuration: 180, restDuration: 60, countdown: true };

export default function App() {
  const [page, setPage] = useState('timer');
  const [settings, setSettings] = useState(defaults);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profile, setProfile] = useState({ name: 'Odiljon', avatar: '' });
  const [announcement, setAnnouncement] = useState('');
  const audio = useAudio();
  const timer = useTimer(settings);

  useEffect(() => { timer.setAnnouncer(setAnnouncement); }, [timer]);
  useEffect(() => { if (timer.timer.phase === 'complete') setPage('timer'); }, [timer.timer.phase]);
  useEffect(() => { const onKey = (event) => event.key === 'Escape' && setDialogOpen(false); window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);

  const start = () => { timer.start(); setPage('timer'); };
  const reset = () => { timer.reset(); setDialogOpen(false); setPage('timer'); };
  const musicProps = { ...audio, onOpen: () => setPage('music') };
  const active = timer.timer.phase !== 'setup' && timer.timer.phase !== 'complete';
  return <div className="app-frame">
    <header className="app-header"><div className="wordmark"><span className="wordmark-mark" aria-hidden="true" /> Boxing</div><span className="header-caption">TRAIN / PLAY</span></header>
    <main className="app-main">{page === 'music' ? <MusicPage audio={audio} /> : timer.timer.phase === 'complete' ? <CompletionView rounds={settings.rounds} onDone={reset} onAgain={start} /> : active ? <ActiveTimer timer={timer.timer} rounds={settings.rounds} roundDuration={settings.roundDuration} restDuration={settings.restDuration} onPause={timer.togglePause} onEnd={() => setDialogOpen(true)} music={musicProps} /> : <TimerSetup settings={settings} setSettings={setSettings} profile={profile} setProfile={setProfile} onStart={start} />}</main>
    {announcement && <p className="sr-only" aria-live="polite">{announcement}</p>}
    <BottomNav page={page} onChange={setPage} />
    <ConfirmDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={reset} />
  </div>;
}
