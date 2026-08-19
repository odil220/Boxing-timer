import { useState, useEffect, useRef, useCallback } from 'react';

const ROUND_DURATIONS = [30, 60, 90, 120, 150, 180, 240, 300];
const REST_DURATIONS = [15, 30, 45, 60, 90, 120, 180, 300];

export function useTimer(settings, soundEnabled) {
  const [timer, setTimer] = useState({
    phase: 'setup',
    currentRound: 0,
    remaining: 0,
    isPaused: false,
  });

  const timerRef = useRef(null);
  const phaseStartRef = useRef(0);
  const phaseDurationRef = useRef(0);
  const soundRef = useRef(null);

  const initSound = useCallback(() => {
    if (soundRef.current) return;
    try {
      soundRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      // no audio
    }
  }, []);

  const playBeep = useCallback((freq, duration = 200) => {
    if (!soundEnabled) return;
    initSound();
    const ctx = soundRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      // silent
    }
  }, [soundEnabled, initSound]);

  const startPhase = useCallback((phase, durationSec) => {
    phaseDurationRef.current = durationSec * 1000;
    phaseStartRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 80);
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - phaseStartRef.current;
    let remaining = (phaseDurationRef.current - elapsed) / 1000;

    if (remaining <= 0) {
      remaining = 0;
      handlePhaseEnd();
      return;
    }

    setTimer(t => ({ ...t, remaining }));
  }, []);

  const handlePhaseEnd = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const currentPhase = timer.phase;
    if (currentPhase === 'countdown') {
      setTimer({ phase: 'round', currentRound: 1, remaining: settings.roundDuration, isPaused: false });
      setTimeout(() => startPhase('round', settings.roundDuration), 0);
      playBeep(880, 200);
    } else if (currentPhase === 'round') {
      if (timer.currentRound >= settings.rounds) {
        setTimer({ phase: 'complete', currentRound: timer.currentRound, remaining: 0, isPaused: false });
      } else {
        setTimer({ phase: 'rest', remaining: settings.restDuration, isPaused: false });
        setTimeout(() => startPhase('rest', settings.restDuration), 0);
        playBeep(440, 200);
      }
    } else if (currentPhase === 'rest') {
      setTimer({ phase: 'round', currentRound: timer.currentRound + 1, remaining: settings.roundDuration, isPaused: false });
      setTimeout(() => startPhase('round', settings.roundDuration), 0);
      playBeep(880, 200);
    }
  }, [timer, settings, startPhase, playBeep]);

  const startWorkout = useCallback(() => {
    initSound();
    if (settings.startCountdown) {
      setTimer({ phase: 'countdown', currentRound: 0, remaining: 3, isPaused: false });
      startPhase('countdown', 3);
      playBeep(880, 150);
    } else {
      setTimer({ phase: 'round', currentRound: 1, remaining: settings.roundDuration, isPaused: false });
      startPhase('round', settings.roundDuration);
      playBeep(880, 200);
    }
  }, [settings, startPhase, playBeep, initSound]);

  const pause = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Date.now() - phaseStartRef.current;
    phaseDurationRef.current = phaseDurationRef.current - elapsed;
    phaseStartRef.current = Date.now();
    setTimer(t => ({ ...t, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setTimer(t => ({ ...t, isPaused: false }));
    startPhase(timer.phase, phaseDurationRef.current / 1000);
  }, [timer.phase, startPhase]);

  const endWorkout = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer({ phase: 'setup', currentRound: 0, remaining: 0, isPaused: false });
  }, []);

  return { timer, startWorkout, pause, resume, endWorkout, playBeep };
}
