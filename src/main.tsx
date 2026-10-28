import '@fontsource-variable/vazirmatn';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/cards.css';
import './styles/clay.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { bootTelegram } from './lib/telegram';

bootTelegram();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
