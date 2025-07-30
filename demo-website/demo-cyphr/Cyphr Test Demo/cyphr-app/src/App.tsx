import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ColorProvider } from './contexts/ColorContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Perpetuals from './pages/Perpetuals';
import Tracker from './pages/Tracker';
import TokenPage from './pages/TokenPage';
import Orders from './pages/Orders';
import Portfolio from './pages/Portfolio';
import Spot from './pages/Spot';

function App() {
  return (
    <ColorProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/discover" replace />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/perpetuals" element={<Perpetuals />} />
              <Route path="/tracker" element={<Tracker />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/token/:id" element={<TokenPage />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/spot" element={<Spot />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ColorProvider>
  );
}

export default App;
