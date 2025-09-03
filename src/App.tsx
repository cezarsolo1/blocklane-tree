import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Wizard } from './pages/Wizard';
import { AddressCheck } from './pages/AddressCheck';
import { AuthPage } from './pages/AuthPage';
import { AuthProvider } from './modules/auth/AuthProvider';
import { RequireAuth } from './components/RequireAuth';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route 
              path="/address-check" 
              element={
                <RequireAuth>
                  <AddressCheck />
                </RequireAuth>
              } 
            />
            <Route 
              path="/wizard" 
              element={
                <RequireAuth>
                  <Wizard />
                </RequireAuth>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
