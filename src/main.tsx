import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BootLogger } from './components/BootLogger'
import { LoadingFallback } from './components/LoadingFallback'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <BootLogger />
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
)
