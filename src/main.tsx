import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { BootLogger } from './components/BootLogger.tsx'
import { LoadingFallback } from './components/LoadingFallback.tsx'

console.log('Main.tsx loading...');
console.log('Environment check:', {
  NODE_ENV: import.meta.env.MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING'
});

const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <BootLogger />
          <App />
        </Suspense>
      </ErrorBoundary>
    </React.StrictMode>,
  );
} else {
  console.error('Root element not found!');
}
