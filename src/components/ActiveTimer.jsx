import Icon from './Icon';

const formatTime = (seconds) => { const whole = Math.floor(Math.max(0, seconds)); return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`; };

export default function ActiveTimer({ timer, rounds, roundDuration, restDuration, onPause, onEnd, music }) {
  if (timer.phase === 'complete') return null;
  const countdown = timer.phase === 'countdown';
  const total = countdown ? 3 : timer.phase === 'rest' ? Math.max(1, restDuration) : roundDuration;
  const progress = Math.min(360, Math.max(0, ((total - timer.remaining) / total) * 360));
  const final = timer.phase === 'round' && timer.round === rounds;
  const phase = countdown ? 'Get Ready' : timer.paused ? 'Paused' : final ? 'Final Round' : timer.phase;
  const phaseColor = timer.paused ? 'var(--text-soft)' : timer.phase === 'rest' ? 'var(--accent-rest)' : final ? 'var(--accent-warm)' : 'var(--accent-blue)';
  return <section className="timer-view view" aria-labelledby="timer-phase" style={{ '--phase-color': phaseColor }}>
    <div className="timer-meta"><strong>{countdown ? 'Coming up' : `Round ${String(timer.round).padStart(2, '0')} / ${String(rounds).padStart(2, '0')}`}</strong><span>{timer.paused ? 'Paused' : 'Live'}</span></div>
    <div className="timer-center"><div className="timer-orbit" style={{ '--progress': `${progress}deg` }}><div className="timer-orbit-inner"><p className="phase-label" id="timer-phase">{phase}</p><div className="timer-number">{countdown ? Math.ceil(timer.remaining) : formatTime(timer.remaining)}</div><p className="timer-round">{countdown ? `Round 1 of ${rounds}` : `Round ${timer.round} of ${rounds}`}</p></div></div></div>
    <p className="timer-hint">{timer.paused ? 'Timer is paused.' : countdown ? 'Find your stance.' : timer.phase === 'rest' ? 'Breathe and reset.' : 'Stay sharp.'}</p>
    <div className="timer-actions"><button className="pause-control" type="button" aria-label={`${timer.paused ? 'Resume' : 'Pause'} workout`} onClick={onPause}><span className={`pause-symbol ${timer.paused ? 'is-play' : ''}`} aria-hidden="true"><i /><i /></span>{timer.paused ? 'Resume' : 'Pause'}</button><button className="text-button timer-end" type="button" onClick={onEnd}>End Workout</button></div>
    {music.track && <button className="mini-player" type="button" onClick={music.onOpen}><span className="mini-player-icon">♪</span><span className="mini-player-name">{music.track.name}</span><span className="mini-player-action" onClick={(event) => { event.stopPropagation(); music.toggle(); }}><Icon name={music.playing ? 'pause' : 'play'} size={13} /></span></button>}
    <p className="sr-only" aria-live="polite">{timer.phase === 'rest' ? `Rest started. Round ${timer.round} of ${rounds}.` : timer.paused ? 'Workout paused.' : ''}</p>
  </section>;
}
