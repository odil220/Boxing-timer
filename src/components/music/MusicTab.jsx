import { motion, AnimatePresence } from 'framer-motion';
import { Music, AlertCircle } from 'lucide-react';
import CircularPlayer from './CircularPlayer';
import MusicLibrary from './MusicLibrary';
import ImportButton from './ImportButton';

export default function MusicTab({ player }) {
  const {
    songs, currentSong, isPlaying, currentTime, duration, progress, errorMessage,
    handleImport, handlePlayPause, handleSelect, handleSeek, handleNext, handlePrevious,
    handleDelete, formatTime,
  } = player;

  const handleCircleSeek = (seconds) => {
    if (duration > 0) {
      handleSeek(seconds);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {currentSong ? (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <CircularPlayer
                currentTime={currentTime}
                duration={duration}
                progress={progress}
                isPlaying={isPlaying}
                songName={currentSong.name}
                artist={currentSong.artist || currentSong.album}
                onPlayPause={handlePlayPause}
                onSeek={handleCircleSeek}
                onNext={handleNext}
                onPrevious={handlePrevious}
                formatTime={formatTime}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Music className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">No track selected</p>
              <ImportButton onImport={handleImport} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-4 mb-2 p-2 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            {errorMessage}
          </div>
        )}

        {/* Library section */}
        <div className="flex-shrink-0">
          <div className="px-4 py-2 flex items-center justify-between">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Library ({songs.length})
            </h2>
            {songs.length === 0 && <ImportButton onImport={handleImport} />}
          </div>

          <MusicLibrary
            songs={songs}
            currentSongIndex={player.currentSongIndex}
            isPlaying={isPlaying}
            onSelect={handleSelect}
            onDelete={handleDelete}
            formatTime={formatTime}
          />
        </div>
      </div>
    </div>
  );
}
