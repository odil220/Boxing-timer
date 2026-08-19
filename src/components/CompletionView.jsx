export default function CompletionView({ rounds, onDone, onAgain }) {
  return <section className="complete-view view" aria-labelledby="complete-title">
    <div className="complete-check" aria-hidden="true">✓</div>
    <p className="setup-kicker">Session finished</p>
    <h1 id="complete-title">Workout<br /><span>complete.</span></h1>
    <p className="complete-copy">{rounds} {rounds === 1 ? 'round' : 'rounds'} completed</p>
    <div className="complete-actions"><button className="app-button primary-button" type="button" onClick={onDone}>Done <span aria-hidden="true">↗</span></button><button className="text-button" type="button" onClick={onAgain}>Start Again</button></div>
  </section>;
}
