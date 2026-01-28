
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, Activity, Database } from 'lucide-react';
import Home from './components/Home';
import CsvPage from './components/CsvPage';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-white/10">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="text-red-500 fill-red-500 heartbeat-pulse" />
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            CardioXAI
          </span>
        </Link>

        <div className="hidden md:flex gap-1 bg-white/5 p-1 rounded-xl">
          <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:bg-white/5 ${location.pathname === '/' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>
            <Activity size={16} /> Individual Analysis
          </Link>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          to="/"
          className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/5 transition-colors"
        >
          New Prediction
        </Link>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen pb-20">
        <Navigation />

        <main className="max-w-6xl mx-auto px-4 mt-4 md:mt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/csv" element={<CsvPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/5 py-10 text-center">
          <p className="text-slate-600 text-sm">
            &copy; 2024 CardioXAI Project • Explainable AI for Precision Medicine
          </p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
