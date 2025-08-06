import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { ColorProvider } from './contexts/ColorContext';
import { SolanaWalletProvider } from './providers/SolanaWalletProvider';
import { TransactionProvider } from './contexts/TransactionContext';
import Header from './components/Header';
import Footer from './components/Footer';
import TransactionStatus from './components/TransactionStatus';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Perpetuals from './pages/Perpetuals';
import Tracker from './pages/Tracker';
import TokenPage from './pages/TokenPage';
import Orders from './pages/Orders';
import Portfolio from './pages/Portfolio';
import Spot from './pages/Spot';
import ProTerminal from './pages/ProTerminal';
import StrategyBuilder from './pages/StrategyBuilder';

// Mobile Bottom Navigation Component
const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  const navItems = [
    { name: 'Strategy', path: '/strategy-builder', icon: '/assets/icons/WatchlistStar.png' },
    { name: 'Terminal', path: '/pro-terminal', icon: '/assets/icons/PhoneIcon.png' },
    { name: 'Discover', path: '/discover', icon: '/assets/icons/PriceLogic.png' },
    { name: 'Insights', path: '/tracker', icon: '/assets/icons/SearchIcon.png' },
    { name: 'Perpetuals', path: '/perpetuals', icon: '/assets/icons/PNLIcon.png' },
    { name: 'Portfolio', path: '/portfolio', icon: '/assets/icons/WalletIcon.png' },
  ];

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          title={item.name}
        >
          <span className="mobile-nav-icon">
            <img src={item.icon} alt={item.name} style={{ width: '24px', height: '24px' }} />
          </span>
        </Link>
      ))}
    </div>
  );
};

function App() {
  // Removed GitHub Pages SPA redirect script to fix URL infinite loop issue
  
  return (
    <ColorProvider>
      <SolanaWalletProvider>
        <TransactionProvider>
          <Router>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/discover" replace />} />
                  <Route path="/pro-terminal" element={<ProTerminal />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/perpetuals" element={<Perpetuals />} />
                  <Route path="/tracker" element={<Tracker />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/token/:id" element={<TokenPage />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/spot" element={<Spot />} />
                  <Route path="/strategy-builder" element={<StrategyBuilder />} />
                </Routes>
              </main>
              <Footer />
              <MobileBottomNav />
              <TransactionStatus />
            </div>
          </Router>
        </TransactionProvider>
      </SolanaWalletProvider>
    </ColorProvider>
  );
}

export default App;
