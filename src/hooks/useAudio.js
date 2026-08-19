import { useCallback, useEffect, useRef, useState } from 'react';

function cleanName(name) { return name.replace(/\.[^/.]+$/, ''); }

export default function useAudio() {
  const audio = useRef(new Audio());
  const tracksRef = useRef([]);
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

  const track = tracks[current] || null;
  tracksRef.current = tracks;
  const load = useCallback((nextTrack, index) => {
    audio.current.src = nextTrack.url;
    audio.current.load();
    setCurrent(index);
    setProgress({ current: 0, duration: 0 });
  }, []);
  const play = useCallback(async () => { try { await audio.current.play(); setPlaying(true); } catch { setPlaying(false); } }, []);
  const pause = useCallback(() => { audio.current.pause(); setPlaying(false); }, []);
  const toggle = useCallback(() => { if (audio.current.paused) play(); else pause(); }, [pause, play]);
  const importFiles = useCallback((files) => {
    const imported = [...files].filter((file) => file.type.startsWith('audio/')).map((file) => ({ name: cleanName(file.name), url: URL.createObjectURL(file), file }));
    if (!imported.length) return false;
    setTracks((existing) => {
      const next = [...existing, ...imported];
      if (!existing.length) load(next[0], 0);
      return next;
    });
    return true;
  }, [load]);
  const select = useCallback((index) => { if (tracks[index]) { load(tracks[index], index); play(); } }, [load, play, tracks]);
  const skip = useCallback((direction) => { if (!tracks.length) return; select((current + direction + tracks.length) % tracks.length); }, [current, select, tracks]);
  const seek = useCallback((value) => { audio.current.currentTime = value; setProgress((old) => ({ ...old, current: value })); }, []);

  useEffect(() => {
    const element = audio.current;
    const onTime = () => setProgress({ current: element.currentTime, duration: element.duration || 0 });
    const onEnd = () => tracks.length > 1 ? skip(1) : setPlaying(false);
    element.addEventListener('timeupdate', onTime); element.addEventListener('loadedmetadata', onTime); element.addEventListener('ended', onEnd);
    return () => { element.removeEventListener('timeupdate', onTime); element.removeEventListener('loadedmetadata', onTime); element.removeEventListener('ended', onEnd); };
  }, [skip, tracks.length]);

  useEffect(() => () => tracksRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);
  return { tracks, track, current, playing, progress, importFiles, select, toggle, pause, skip, seek };
}
