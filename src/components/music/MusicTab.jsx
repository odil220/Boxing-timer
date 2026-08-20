import { motion, AnimatePresence } from 'framer-motion';
import { Music, Plus, Pause, Play, SkipBack, SkipForward, Trash2 } from 'lucide-react';
import CircularPlayer from './CircularPlayer';
import ImportButton from './ImportButton';
import SongItem from './SongItem';

const CIRCUMFERENCE = 2 * Math.PI * 90;
const RADIUS = 90;
const CENTER = 100;
const SIZE = 160;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicTab({ player }) {
  const {
    songs, currentSong, isPlaying, currentTime, duration, progress,
    handleImport, handlePlayPause, handleSelect, handleSeek, handleNext, handlePrevious,
    handleDelete,
  } = player;

  const handleCircleSeek = (seconds) => {
    if (duration > 0) {
      handleSeek(seconds);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Player section - always visible at top */}
      <div className="flex-shrink-0 pb-4">
        <AnimatePresence mode="wait">
          {currentSong ? (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3" style={{ width: SIZE, height: SIZE }}>
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 200 200"
                  width={SIZE}
                  height={SIZE}
                >
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-border opacity-30"
                  />
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-300"
                    style={{
                      strokeDasharray: CIRCUMFERENCE,
                      strokeDashoffset: CIRCUMFERENCE * (1 - progress),
                    }}
                  />
                </svg>

                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-sm font-medium truncate max-w-[140px] leading-tight">
                      {currentSong.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {currentSong.artist || ''}
                    </p>
                  </div>
                  <p className="text-2xl font-bold mt-2 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-5 mb-3">
                <button
                  onClick={handlePrevious}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </button>

                <button
                  onClick={handleNext}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center pb-6"
            >
              <div className="relative mb-3" style={{ width: SIZE, height: SIZE }}>
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 200 200"
                  width={SIZE}
                  height={SIZE}
                >
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-border opacity-30"
                  />
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-300"
                    style={{
                      strokeDasharray: CIRCUMFERENCE,
                      strokeDashoffset: CIRCUMFERENCE,
                    }}
                  />
                </svg>

                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-sm font-medium truncate max-w-[140px] leading-tight">
                      No track selected
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select a song to play
                  </p>
                </div>
              </div>

              <ImportButton onImport={handleImport} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Library section - scrollable bottom section */}
      <div className="flex-1 min-h-0 border-t border-border flex flex-col">
        <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Library ({songs.length})
          </h2>
          <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer text-sm font-medium">
            <Plus className="h-4 w-4" />
            Add File
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleImport(files);
                }
                e.target.value = null;
              }}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {songs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4 mx-auto">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No music yet</p>
            </div>
          ) : (
            <div className="px-4 pt-2 pb-4 space-y-1">
              {songs.map((song, index) => (
                <SongItem
                  key={song.id}
                  song={song}
                  index={index}
                  isActive={index === player.currentSongIndex}
                  isPlaying={isPlaying}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
