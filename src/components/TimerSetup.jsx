import Stepper from './Stepper';

const roundTimes = [30, 60, 90, 120, 150, 180, 240, 300];
const restTimes = [0, 30, 45, 60, 90, 120];
const formatTime = (value) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;

export default function TimerSetup({ settings, setSettings, profile, setProfile, onStart }) {
  const change = (key, value) => setSettings((old) => ({ ...old, [key]: value }));
  const changeIndex = (key, values, value) => change(key, values[Math.max(0, Math.min(values.length - 1, values.indexOf(value))) ]);
  const onAvatar = (event) => { const file = event.target.files[0]; if (file) setProfile((old) => ({ ...old, avatar: URL.createObjectURL(file) })); };
  return <section className="setup-view view" aria-labelledby="setup-title">
    <div className="profile-strip"><label className="avatar" htmlFor="avatar-upload" style={profile.avatar ? { backgroundImage: `url(${profile.avatar})` } : undefined}><span>{profile.name.slice(0, 1).toUpperCase()}</span><input id="avatar-upload" className="file-input" type="file" accept="image/*" onChange={onAvatar} /></label><label className="profile-name"><span>Your name</span><input value={profile.name} maxLength="18" aria-label="Your name" onChange={(event) => setProfile((old) => ({ ...old, name: event.target.value }))} /></label></div>
    <div className="setup-top"><div><p className="setup-kicker">Training console</p><h1 className="setup-heading" id="setup-title">Ready to<br /><span>put in work.</span></h1></div><div className="rounds-word">Rounds</div></div>
    <div className="rounds-display">
      <button className="stepper-control" type="button" aria-label="Decrease rounds" disabled={settings.rounds <= 1} onClick={() => change('rounds', settings.rounds - 1)}>−</button>
      <output className="rounds-number">{String(settings.rounds).padStart(2, '0')}</output>
      <button className="stepper-control" type="button" aria-label="Increase rounds" disabled={settings.rounds >= 20} onClick={() => change('rounds', settings.rounds + 1)}>+</button>
    </div>
    <div className="duration-grid">
      <Stepper label="Time" value={settings.roundDuration} format={formatTime} canDecrease={roundTimes.indexOf(settings.roundDuration) > 0} canIncrease={roundTimes.indexOf(settings.roundDuration) < roundTimes.length - 1} onDecrease={() => changeIndex('roundDuration', roundTimes, roundTimes[roundTimes.indexOf(settings.roundDuration) - 1])} onIncrease={() => changeIndex('roundDuration', roundTimes, roundTimes[roundTimes.indexOf(settings.roundDuration) + 1])} />
      <Stepper label="Rest" value={settings.restDuration} format={formatTime} canDecrease={restTimes.indexOf(settings.restDuration) > 0} canIncrease={restTimes.indexOf(settings.restDuration) < restTimes.length - 1} onDecrease={() => changeIndex('restDuration', restTimes, restTimes[restTimes.indexOf(settings.restDuration) - 1])} onIncrease={() => changeIndex('restDuration', restTimes, restTimes[restTimes.indexOf(settings.restDuration) + 1])} />
    </div>
    <div className="countdown-row"><span>Start countdown</span><button className={`toggle ${settings.countdown ? 'is-on' : ''}`} type="button" role="switch" aria-checked={settings.countdown} aria-label="Start countdown" onClick={() => change('countdown', !settings.countdown)}><span className="toggle-thumb" /></button></div>
    <button className="app-button primary-button" type="button" onClick={onStart}>Start Training <span aria-hidden="true">↗</span></button><p className="creator-credit">Created by Odiljon</p>
  </section>;
}
