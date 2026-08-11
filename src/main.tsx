import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress raw Event objects (e.g. from network/iframe load failures, image loads, or HMR disconnects)
    if (event.reason && (event.reason.isTrusted || event.reason instanceof Event || (typeof event.reason === 'object' && 'isTrusted' in event.reason))) {
      event.preventDefault();
      console.warn("Handled DOM Event promise rejection:", event.reason);
    }
  });

  window.addEventListener('error', (event) => {
    if (event.error && (event.error.isTrusted || event.error instanceof Event || (typeof event.error === 'object' && 'isTrusted' in event.error))) {
      event.preventDefault();
      console.warn("Handled DOM Event error:", event.error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);

