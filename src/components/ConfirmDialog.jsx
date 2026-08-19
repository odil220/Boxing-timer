export default function ConfirmDialog({ open, onClose, onConfirm }) {
  if (!open) return null;
  return <div className="dialog-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="end-title">
      <p className="setup-kicker">Pause your session</p>
      <h2 id="end-title">End workout?</h2>
      <p className="dialog-copy">Your current session will stop.</p>
      <div className="dialog-actions"><button className="app-button secondary-button" type="button" onClick={onClose}>Keep Training</button><button className="app-button danger-button-fill" type="button" onClick={onConfirm}>End Workout</button></div>
    </section>
  </div>;
}
