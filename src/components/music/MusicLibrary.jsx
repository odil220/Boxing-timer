import SongItem from './SongItem';

export default function MusicLibrary({ songs, currentSongIndex, isPlaying, onSelect, onDelete, formatTime }) {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 pb-20">
        <p className="text-sm text-muted-foreground mb-1">No music yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-4 pt-2 pb-4 space-y-1">
        {songs.map((song, index) => (
          <SongItem
            key={song.id}
            song={song}
            index={index}
            isActive={index === currentSongIndex}
            isPlaying={isPlaying}
            onSelect={onSelect}
            onDelete={onDelete}
            formatTime={formatTime}
          />
        ))}
      </div>
    </div>
  );
}
