import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ColorProvider } from './contexts/ColorContext';
import { Web3ModalProvider } from './providers/Web3ModalProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Portfolio from './pages/Portfolio';
import Spot from './pages/Spot';
import Perpetuals from './pages/Perpetuals';
import Orders from './pages/Orders';
import Tracker from './pages/Tracker';
import StrategyBuilder from './pages/StrategyBuilder';
import TokenPage from './pages/TokenPage';
import ProTerminal from './pages/ProTerminal';
import './App.css';

function App() {
  return (
    <Web3ModalProvider>
      <ColorProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/strategy-builder" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/spot" element={<Spot />} />
                <Route path="/perpetuals" element={<Perpetuals />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/strategy-builder" element={<StrategyBuilder />} />
                <Route path="/token/:address" element={<TokenPage />} />
                <Route path="/pro-terminal" element={<ProTerminal />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ColorProvider>
    </Web3ModalProvider>
  );
}

export default App;
