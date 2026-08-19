import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import './styles/shell.css';
import './styles/setup.css';
import './styles/timer.css';
import './styles/music.css';
import './styles/navigation.css';
import './styles/complete.css';
import './styles/dialog.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
