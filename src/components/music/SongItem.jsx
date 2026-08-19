import { Play, Pause, Trash2 } from 'lucide-react';

export default function SongItem({ song, index, isActive, isPlaying, onSelect, onDelete, formatTime }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
      }`}
      onClick={() => onSelect(index)}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {isActive && isPlaying ? (
          <Pause className="h-4 w-4 text-primary" />
        ) : isActive ? (
          <Play className="h-4 w-4 text-primary" />
        ) : (
          <span className="text-xs text-muted-foreground font-medium">
            {index + 1}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-tight">
          {song.name || 'Unknown title'}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {song.artist || song.name || 'Unknown artist'}
        </p>
      </div>

      <span className="flex-shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatTime(song.duration)}
      </span>

      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(song.id); }}
          className="flex-shrink-0 p-1 rounded-full hover:bg-destructive/20 text-destructive transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
