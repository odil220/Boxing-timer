export default function Stepper({ label, value, onDecrease, onIncrease, canDecrease = true, canIncrease = true, format = (item) => item }) {
  return <div className="duration-control">
    <span className="duration-label">{label}</span>
    <output className="duration-value">{format(value)}</output>
    <div className="duration-actions">
      <button className="stepper-control" type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={!canDecrease} onClick={onDecrease}>−</button>
      <button className="stepper-control" type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={!canIncrease} onClick={onIncrease}>+</button>
    </div>
  </div>;
}
