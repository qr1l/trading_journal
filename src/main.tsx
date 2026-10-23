import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { JournalProvider } from './app/JournalProvider';
import { RouterProvider } from './app/RouterProvider';
import './styles/base.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Не найден корневой элемент #root');
}

createRoot(container).render(
  <StrictMode>
    <JournalProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </JournalProvider>
  </StrictMode>,
);
