const paths = {
  timer: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 2h8M12 2v3M8 13h4M12 9v4l3 2" /></>,
  music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
  settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.1-1.7 2.9-2-.8a7.6 7.6 0 0 1-1.4.8l-.3 2h-3.4l-.3-2a7.6 7.6 0 0 1-1.4-.8l-2 .8-1.7-2.9.1-.1-1.5-1.1V10l1.5-1.1-.1-.1 1.7-2.9 2 .8a7.6 7.6 0 0 1 1.4-.8l.3-2h3.4l.3 2a7.6 7.6 0 0 1 1.4.8l2-.8 1.7 2.9-.1.1 1.5 1.1v3.9L19.4 15Z" /></>,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <path d="M5 12h14" />,
  upload: <><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></>,
  folder: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>
};

export default function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
