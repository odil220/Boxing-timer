import { useState, useEffect, useRef } from 'react';

export function useTimer(settings, soundEnabled) {
  const [timer, setTimer] = useState({
    phase: 'setup',
    currentRound: 0,
    remaining: 0,
    isPaused: false,
  });

  const intervalRef = useRef(null);
  const phaseStartRef = useRef(0);
  const phaseDurationRef = useRef(0);
  const soundRef = useRef(null);
  const settingsRef = useRef(settings);
  const currentPhaseRef = useRef('setup');

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const initSound = () => {
    if (!soundRef.current) {
      try { soundRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
  };

  // Simple beep - louder
  const playBeep = (freq, duration = 200) => {
    if (!soundEnabled) return; initSound();
    const ctx = soundRef.current; if (!ctx) return;
    try {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.start(); osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {}
  };

  // Alarm for round start: short-high, short-high (very loud)
  const playRoundStartAlarm = () => {
    if (!soundEnabled) return; initSound();
    const ctx = soundRef.current; if (!ctx) return;
    try {
      const sequence = [
        { freq: 880, duration: 120 },
        { freq: 0, duration: 80 },  // short pause between
        { freq: 880, duration: 120 },
      ];
      let time = ctx.currentTime;
      sequence.forEach(note => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = note.freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.8, time);
        if (note.freq === 0) {
          gain.gain.setValueAtTime(0, time);
        } else {
          gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration / 1000);
        }
        osc.start(time); osc.stop(time + note.duration / 1000);
        time += note.duration / 1000;
      });
    } catch (e) {}
  };

  // Alarm for rest start: low-long, short-pause, low-long (very loud)
  const playRestStartAlarm = () => {
    if (!soundEnabled) return; initSound();
    const ctx = soundRef.current; if (!ctx) return;
    try {
      const sequence = [
        { freq: 440, duration: 200 },
        { freq: 0, duration: 100 },
        { freq: 440, duration: 200 },
      ];
      let time = ctx.currentTime;
      sequence.forEach(note => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = note.freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.8, time);
        if (note.freq === 0) {
          gain.gain.setValueAtTime(0, time);
        } else {
          gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration / 1000);
        }
        osc.start(time); osc.stop(time + note.duration / 1000);
        time += note.duration / 1000;
      });
    } catch (e) {}
  };

  // Alarm for round end: descending tones (very loud)
  const playRoundEndAlarm = () => {
    if (!soundEnabled) return; initSound();
    const ctx = soundRef.current; if (!ctx) return;
    try {
      const sequence = [
        { freq: 523, duration: 150 },  // C5
        { freq: 0, duration: 75 },     // short pause
        { freq: 440, duration: 150 },   // A4
        { freq: 0, duration: 75 },     // short pause
        { freq: 349, duration: 150 },   // F4
      ];
      let time = ctx.currentTime;
      sequence.forEach(note => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = note.freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.8, time);
        if (note.freq === 0) {
          gain.gain.setValueAtTime(0, time);
        } else {
          gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration / 1000);
        }
        osc.start(time); osc.stop(time + note.duration / 1000);
        time += note.duration / 1000;
      });
    } catch (e) {}
  };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPhase = (phase, durationSec, roundNum = 0) => {
    currentPhaseRef.current = phase;
    phaseDurationRef.current = durationSec * 1000;
    phaseStartRef.current = Date.now();
    clearTimer();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      const remaining = (phaseDurationRef.current - elapsed) / 1000;

      if (remaining <= 0) {
        clearTimer();

        const s = settingsRef.current;

        if (currentPhaseRef.current === 'countdown') {
          setTimer({ phase: 'round', currentRound: 1, remaining: s.roundDuration, isPaused: false });
          startPhase('round', s.roundDuration, 1);
          playRoundStartAlarm();
        } else if (currentPhaseRef.current === 'round') {
          playRoundEndAlarm();  // Very loud end-of-round alarm
          if (timer.currentRound >= s.rounds) {
            setTimer({ phase: 'complete', currentRound: timer.currentRound, remaining: 0, isPaused: false });
          } else {
            setTimer(t => ({ ...t, phase: 'rest', remaining: s.restDuration, isPaused: false }));
            startPhase('rest', s.restDuration, timer.currentRound);
            playRestStartAlarm();
          }
        } else if (currentPhaseRef.current === 'rest') {
          setTimer(t => {
            const nextRound = t.currentRound + 1;
            startPhase('round', s.roundDuration, nextRound);
            playRoundStartAlarm();
            return { phase: 'round', currentRound: nextRound, remaining: s.roundDuration, isPaused: false };
          });
        }
        return;
      }

      setTimer(t => ({ ...t, remaining }));
    }, 80);
   };

  const startWorkout = () => {
    initSound();
    const s = settingsRef.current;
    if (s.startCountdown) {
      setTimer({ phase: 'countdown', currentRound: 0, remaining: 3, isPaused: false });
      startPhase('countdown', 3);
      playBeep(880, 150);
    } else {
      setTimer({ phase: 'round', currentRound: 1, remaining: s.roundDuration, isPaused: false });
      startPhase('round', s.roundDuration, 1);
      playRoundStartAlarm();
    }
  };

  const pause = () => {
    clearTimer();
    const elapsed = Date.now() - phaseStartRef.current;
    phaseDurationRef.current = phaseDurationRef.current - elapsed;
    phaseStartRef.current = Date.now();
    setTimer(t => ({ ...t, isPaused: true }));
  };

  const resume = () => {
    setTimer(t => ({ ...t, isPaused: false }));
    startPhase(currentPhaseRef.current, phaseDurationRef.current / 1000, timer.currentRound);
  };

  const endWorkout = () => {
    clearTimer();
    setTimer({ phase: 'setup', currentRound: 0, remaining: 0, isPaused: false });
  };

  useEffect(() => () => clearTimer(), []);

  return { timer, startWorkout, pause, resume, endWorkout, playBeep };
}
