import { useState, useRef, useEffect } from 'react';

export function useMusicPlayer() {
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (currentIndex < tracks.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [tracks.length, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    audio.src = tracks[currentIndex]?.url || '';
    if (isPlaying) audio.play().catch(() => {});
  }, [currentIndex, tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newTracks = files.map(f => ({
      name: f.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(f),
    }));
    if (newTracks.length > 0) {
      setTracks(newTracks);
      setCurrentIndex(0);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (val) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = val;
      setCurrentTime(val);
    }
  };

  const playNext = () => {
    if (currentIndex < tracks.length - 1) setCurrentIndex(i => i + 1);
  };

  const playPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    tracks, currentIndex, isPlaying, currentTime, duration, volume,
    setVolume, handleFileSelect, togglePlay, handleSeek, playNext, playPrev, formatTime,
  };
}
