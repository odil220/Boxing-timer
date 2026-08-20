import SongItem from './SongItem';

export default function MusicLibrary({ songs, currentSongIndex, isPlaying, onSelect, onDelete, formatTime }) {
  if (songs.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        <p className="text-sm">No music yet</p>
      </div>
    );
  }

  return (
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
  );
}
