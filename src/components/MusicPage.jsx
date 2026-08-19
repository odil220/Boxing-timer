import Icon from './Icon';

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function MusicPage({ audio }) {
  const inputId = 'music-upload';
  const onFiles = (event) => audio.importFiles(event.target.files);
  const percent = audio.progress.duration ? (audio.progress.current / audio.progress.duration) * 100 : 0;
  return <section className="music-view view" aria-labelledby="music-title">
    <div className="music-header"><div><p className="music-kicker">Local audio lab</p><h1 className="music-title" id="music-title">Music</h1><p className="music-subtitle">Choose your tracks and train.</p></div><label className="icon-button import-icon" htmlFor={inputId} aria-label="Import music files"><Icon name="upload" size={19} /><input className="file-input" id={inputId} type="file" accept="audio/*" multiple onChange={onFiles} /></label></div>
    {!audio.track ? <div className="music-empty"><h2>No music added</h2><p>Choose one or more audio files to build your training queue.</p></div> : <>
      <div className="track-panel"><div className="track-heading"><div><span className="now-playing-label">Now playing</span><p className="track-name" title={audio.track.name}>{audio.track.name}</p></div><span className="track-count">{audio.tracks.length} {audio.tracks.length === 1 ? 'track' : 'tracks'}</span></div><div className="progress-track" role="slider" tabIndex="0" aria-label="Music progress" aria-valuemin="0" aria-valuemax={audio.progress.duration || 0} aria-valuenow={audio.progress.current} onClick={(event) => { const box = event.currentTarget.getBoundingClientRect(); audio.seek(((event.clientX - box.left) / box.width) * audio.progress.duration); }}><span className="progress-fill" style={{ width: `${percent}%` }} /></div><div className="music-times"><span>{formatTime(audio.progress.current)}</span><span>{formatTime(audio.progress.duration)}</span></div><div className="player-actions">{audio.tracks.length > 1 && <button className="player-skip" type="button" aria-label="Previous track" onClick={() => audio.skip(-1)}>‹</button>}<button className="player-main" type="button" aria-label={audio.playing ? 'Pause music' : 'Play music'} onClick={audio.toggle}><Icon name={audio.playing ? 'pause' : 'play'} size={17} /></button>{audio.tracks.length > 1 && <button className="player-skip" type="button" aria-label="Next track" onClick={() => audio.skip(1)}>›</button>}</div></div>
      <div className="track-list-window"><div className="track-list" aria-label="Imported tracks">{audio.tracks.map((item, index) => <div className="track-row" key={`${item.name}-${index}`}><span className="track-row-name" title={item.name}>{item.name}</span><button className="track-row-play" type="button" aria-label={`Play ${item.name}`} onClick={() => audio.select(index)}><Icon name="play" size={13} /></button></div>)}</div></div>
    </>}
  </section>;
}
