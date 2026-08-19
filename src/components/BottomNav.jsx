import Icon from './Icon';

export default function BottomNav({ page, onChange }) {
  const items = [
    { id: 'timer', label: 'Timer', icon: 'timer' },
    { id: 'music', label: 'Music', icon: 'music' }
  ];
  return <nav className="bottom-nav" aria-label="Primary navigation">
    {items.map((item) => <button
      key={item.id}
      className={`nav-item ${page === item.id ? 'is-active' : ''}`}
      type="button"
      aria-current={page === item.id ? 'page' : undefined}
      onClick={() => onChange(item.id)}
    ><Icon name={item.icon} /><span className="nav-label">{item.label}</span></button>)}
  </nav>;
}
