import { useCallback, useEffect, useRef, useState } from 'react';

const initial = { phase: 'setup', round: 1, remaining: 180, paused: false };

export default function useTimer({ rounds, roundDuration, restDuration, countdown }) {
  const [timer, setTimer] = useState(initial);
  const timerRef = useRef(timer);
  const lastTick = useRef(0);
  const interval = useRef(null);
  const announce = useRef(() => {});

  const update = useCallback((next) => {
    timerRef.current = next;
    setTimer(next);
  }, []);

  const start = useCallback(() => {
    window.clearInterval(interval.current);
    const next = { phase: countdown ? 'countdown' : 'round', round: 1, remaining: countdown ? 3 : roundDuration, paused: false };
    update(next);
    announce.current(countdown ? 'Get ready. Countdown started.' : 'Round 1 started.');
    lastTick.current = performance.now();
    interval.current = window.setInterval(() => {
      const current = timerRef.current;
      if (current.paused || current.phase === 'setup' || current.phase === 'complete') return;
      const elapsed = (performance.now() - lastTick.current) / 1000;
      lastTick.current = performance.now();
      const remaining = current.remaining - elapsed;
      if (remaining > 0) {
        update({ ...current, remaining });
        return;
      }
      if (current.phase === 'countdown') {
        update({ phase: 'round', round: 1, remaining: roundDuration, paused: false });
        announce.current('Round 1 started.');
      } else if (current.phase === 'round' && current.round < rounds && restDuration > 0) {
        update({ ...current, phase: 'rest', remaining: restDuration });
        announce.current(`Rest started after round ${current.round}.`);
      } else if (current.phase === 'rest') {
        const round = current.round + 1;
        update({ phase: 'round', round, remaining: roundDuration, paused: false });
        announce.current(round === rounds ? 'Final round started.' : `Round ${round} started.`);
      } else if (current.phase === 'round' && current.round < rounds) {
        const round = current.round + 1;
        update({ phase: 'round', round, remaining: roundDuration, paused: false });
        announce.current(round === rounds ? 'Final round started.' : `Round ${round} started.`);
      } else {
        window.clearInterval(interval.current);
        update({ ...current, phase: 'complete', remaining: 0, paused: false });
        announce.current('Workout complete.');
      }
    }, 100);
  }, [countdown, roundDuration, rounds, restDuration, update]);

  const togglePause = useCallback(() => {
    const current = timerRef.current;
    if (current.phase === 'setup' || current.phase === 'complete' || current.phase === 'countdown') return;
    const paused = !current.paused;
    lastTick.current = performance.now();
    update({ ...current, paused });
    announce.current(paused ? 'Workout paused.' : 'Workout resumed.');
  }, [update]);

  const reset = useCallback(() => {
    window.clearInterval(interval.current);
    update({ ...initial, remaining: roundDuration });
  }, [roundDuration, update]);

  useEffect(() => () => window.clearInterval(interval.current), []);

  return { timer, start, togglePause, reset, setAnnouncer: (fn) => { announce.current = fn; } };
}
