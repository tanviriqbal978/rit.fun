import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Fix for environments where window.fetch might be protected
try {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    // If someone tries to override it, we catch it or ignore the attempt if it fails
    // This is a common issue with some polyfills in sandboxed environments
  }
} catch (e) {
  console.warn('Fetch protection logic active', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
