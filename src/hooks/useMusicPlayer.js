import { useState, useRef, useEffect, useCallback } from 'react';
import { loadSavedSongs, saveSongs, readAudioMetadata } from './musicStorage';

const AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'webm', 'mp4', '3gp'];

function isAudioFile(file) {
  if (file.type && file.type.startsWith('audio/')) return true;
  if (file.type && file.type.startsWith('video/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext && AUDIO_EXTENSIONS.includes(ext);
}

async function processFile(file) {
  const song = {
    id: Date.now().toString() + Math.random(),
    name: file.name.replace(/\.[^/.]+$/, ''),
    artist: '', album: '', duration: 0, type: file.type, size: file.size,
  };
  song.duration = await readAudioMetadata(file);
  song.url = URL.createObjectURL(file);
  return song;
}

export function useMusicPlayer() {
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const pendingPlayRef = useRef(false);

  useEffect(() => {
    loadSavedSongs().then(loaded => {
      setSongs(Array.isArray(loaded) ? loaded : []);
    }).catch(() => setSongs([]));
  }, []);

  const setAudioTime = useCallback((s) => {
    if (audioRef.current) audioRef.current.currentTime = s;
  }, []);

  // Init audio element with all event listeners
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'metadata';

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration || 0);
      setCurrentTime(0);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Auto-advance to next song
      if (songs.length > 1 && currentSongIndex < songs.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
        setIsPlaying(true);
      }
    });
    audio.addEventListener('error', () => {
      setErrorMessage('Could not play this audio file.');
      setIsPlaying(false);
    });
    // When audio can play, start playback if it was requested
    audio.addEventListener('canplay', () => {
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        audio.play().catch(() => {});
      }
    });

    return () => audio.pause();
  }, [songs, currentSongIndex]);

  // Smooth time update animation loop
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    const animate = () => {
      const a = audioRef.current;
      if (a && !a.paused) {
        setCurrentTime(a.currentTime);
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Load song when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentSongIndex < 0 || currentSongIndex >= songs.length) return;

    const song = songs[currentSongIndex];
    audio.pause();
    setCurrentTime(0);
    setDuration(0);
    setErrorMessage('');

    if (song.url) {
      audio.src = song.url;
      audio.load();
    } else if (song.data) {
      const blob = new Blob([new Uint8Array(JSON.parse(song.data))], { type: song.type });
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.load();
      audio.addEventListener('canplay', () => URL.revokeObjectURL(url), { once: true });
    }

    if (isPlaying) {
      pendingPlayRef.current = true;
    }
  }, [currentSongIndex, songs, isPlaying]);

  // Play/pause sync (for button clicks)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentSongIndex < 0) return;

    if (isPlaying) {
      pendingPlayRef.current = true;
      audio.play().catch(() => {
        // Will retry on canplay event
      });
    } else {
      pendingPlayRef.current = false;
      audio.pause();
    }
  }, [isPlaying, currentSongIndex]);

  // --- Actions ---
  const handleImport = useCallback(async (files) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return;
    setErrorMessage('');

    for (const file of fileArray) {
      if (!isAudioFile(file)) continue;
      try {
        const song = await processFile(file);
        setSongs(s => {
          const updated = [...s, song];
          saveSongs(updated);
          return updated;
        });
      } catch (e) {
        setErrorMessage('Failed to process file: ' + file.name);
      }
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (currentSongIndex < 0 || currentSongIndex >= songs.length) return;
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentSongIndex, songs.length]);

  const handleSelect = useCallback((index) => {
    if (index === currentSongIndex) return;
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setErrorMessage('');
  }, [currentSongIndex]);

  const handleSeek = useCallback((seconds) => {
    setAudioTime(seconds);
    setCurrentTime(seconds);
  }, [setAudioTime, setCurrentTime]);

  const handleNext = useCallback(() => {
    if (songs.length === 0) return;
    if (songs.length === 1) { setAudioTime(0); setCurrentTime(0); setIsPlaying(true); }
    else {
      const next = currentSongIndex >= songs.length - 1 ? 0 : currentSongIndex + 1;
      if (next !== currentSongIndex) { setCurrentSongIndex(next); setIsPlaying(true); }
    }
  }, [currentSongIndex, songs, setAudioTime, setCurrentTime]);

  const handlePrevious = useCallback(() => {
    if (songs.length === 0) return;
    if (songs.length === 1) { setAudioTime(0); setCurrentTime(0); setIsPlaying(true); }
    else if (currentSongIndex <= 0) { setAudioTime(0); setCurrentTime(0); setIsPlaying(true); }
    else { setCurrentSongIndex(currentSongIndex - 1); setIsPlaying(true); }
  }, [currentSongIndex, songs, setAudioTime, setCurrentTime]);

  const handleDelete = useCallback((id) => {
    setSongs(s => {
      const found = s.find(song => song.id === id);
      if (found?.url) URL.revokeObjectURL(found.url);
      const newSongs = s.filter(song => song.id !== id);
      saveSongs(newSongs);
      return newSongs;
    });
  }, []);

  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = duration > 0 ? currentTime / duration : 0;
  const currentSong = currentSongIndex >= 0 ? songs[currentSongIndex] : null;

  return {
    songs, currentSong, currentSongIndex, isPlaying, currentTime, duration, progress, errorMessage,
    handleImport, handlePlayPause, handleSelect, handleSeek, handleNext, handlePrevious,
    handleDelete, formatTime,
  };
}
