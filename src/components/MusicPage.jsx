import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, FolderOpen, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

export default function MusicPage({ isActive }) {
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
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const playPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col px-6 pt-6 pb-4"
    >
      <h2 className="text-xl font-semibold tracking-tight mb-6">Music</h2>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {tracks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center">
                <Music className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">No tracks loaded</p>
                <p className="text-xs text-muted-foreground">Load music from your device to train with beats.</p>
              </div>
              <label className="mt-4">
                <input type="file" accept="audio/*" multiple onChange={handleFileSelect} className="hidden" />
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </label>
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="h-48 w-48 rounded-2xl bg-secondary flex items-center justify-center">
                <Music className="h-16 w-16 text-muted-foreground" />
              </div>

              <div className="text-center w-full">
                <p className="text-lg font-semibold truncate px-4">{tracks[currentIndex]?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentIndex + 1} / {tracks.length}
                </p>
              </div>

              <div className="w-full space-y-2">
                <Slider value={currentTime} onValueChange={handleSeek} min={0} max={duration || 100} />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" onClick={playPrev} disabled={currentIndex === 0}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-14 w-14 rounded-full" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext} disabled={currentIndex === tracks.length - 1}>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="w-full flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8">Vol</span>
                <Slider value={Math.round(volume * 100)} onValueChange={(v) => setVolume(v / 100)} min={0} max={100} />
              </div>

              <label className="mt-2">
                <input type="file" accept="audio/*" multiple onChange={handleFileSelect} className="hidden" />
                <Button variant="ghost" size="sm" className="cursor-pointer text-xs">
                  <FolderOpen className="h-3 w-3 mr-1" />
                  Add more tracks
                </Button>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
