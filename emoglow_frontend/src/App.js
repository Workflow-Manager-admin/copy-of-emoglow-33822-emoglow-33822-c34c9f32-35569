import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import './tailwind.preset.css'; // Tailwind base - ensure imported if present

// Sub-app stubs
import MindMeltAI from './apps/MindMeltAI';
import ClassCrushr from './apps/ClassCrushr';
import SplitMate from './apps/SplitMate';
import FocusFlow from './apps/FocusFlow';
import Footer from './components/Footer';

const BRAND_SYMBOL = (
  <motion.span
    className="devsuite-logo"
    whileHover={{ rotate: [0, 6, -4, 0], scale: 1.15 }}
    transition={{ type: 'spring', stiffness: 250, damping: 15 }}
    style={{
      fontWeight: 900,
      color: 'var(--base-light)',
      fontSize: '2.1rem',
      marginRight: '0.5rem',
      textShadow: '0 2px 8px var(--base-light, #00ffff44)',
    }}
  >
    ⚡
  </motion.span>
);

// Theme localStorage keys and helpers
const THEME_KEY = 'devsuite-theme';

function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem(THEME_KEY) || 'light'
  );
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [theme]);
  return [theme, setTheme];
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      className="relative border rounded-full px-3 py-[6px] flex items-center bg-gradient-to-tr from-slate-50 to-neutral-200 dark:from-neutral-950 dark:to-gray-700 shadow-md"
      style={{ minWidth: 54 }}
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      tabIndex={0}
    >
      <span
        className={`transition-all duration-200 rounded-full mr-2 w-5 h-5 border-2
           ${theme === 'light'
            ? 'bg-yellow-300 border-yellow-400 shadow-inner'
            : 'border-gray-500'
           }`}
      />
      <span className="block text-xs font-semibold">{theme === 'light' ? 'Light' : 'Dark'}</span>
      <span
        className={`ml-2 w-5 h-5 border-2 rounded-full flex items-center justify-center
          ${theme === 'dark'
            ? 'border-gray-100 shadow-[0_1px_8px_rgb(200,200,255,0.08)]'
            : 'border-gray-500'
          }`}
      >
        {theme === 'dark'
          ? <span className="w-2 h-2 rounded-full border border-gray-200" />
          : <span className="w-2 h-2 bg-gray-800 rounded-full" />
        }
      </span>
    </button>
  );
}

// Navigation routes configuration
const navLinks = [
  { label: 'MindMelt AI', to: '/mindmelt' },
  { label: 'ClassCrushr', to: '/classcrushr' },
  { label: 'SplitMate', to: '/splitmate' },
  { label: 'FocusFlow', to: '/focusflow' },
];

function Navbar({ theme, setTheme }) {
  const location = useLocation();
  return (
    <nav className="sticky top-0 left-0 w-full z-40 bg-[rgb(16,23,40,0.96)] border-b border-slate-800 shadow backdrop-blur-md transition">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-2 sm:px-8">
        <Link
          className="flex items-center gap-2 select-none hover:opacity-95 group"
          to="/"
          aria-label="DevSuite Home"
        >
          {BRAND_SYMBOL}
          <span
            className="font-bold text-xl tracking-tight transition-all group-hover:tracking-widest"
            style={{
              fontFamily: "'Inter', 'Montserrat', sans-serif",
              letterSpacing: '0.03em',
              color: 'var(--base-light)',
            }}
          >
            DevSuite
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ul className="hidden sm:flex gap-3 font-medium text-base">
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <Link
                  className={`px-3 py-[5px] rounded-md transition hover:bg-slate-700/30 ${
                    location.pathname.startsWith(to) ? 'bg-slate-800 text-cyan-200' : 'text-slate-200'
                  }`}
                  to={to}
                  tabIndex={0}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </nav>
  );
}

// Page transition wrapper for Framer Motion
function AnimatedRoutes({ theme }) {
  const location = useLocation();
  return (
    <AnimatePresence initial={false} mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage theme={theme} />} />
        <Route path="/mindmelt/*" element={<MindMeltAI theme={theme} />} />
        <Route path="/classcrushr/*" element={<ClassCrushr theme={theme} />} />
        <Route path="/splitmate/*" element={<SplitMate theme={theme} />} />
        <Route path="/focusflow/*" element={<FocusFlow theme={theme} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// Premium-pixel feel landing
function LandingPage({ theme }) {
  return (
    <motion.section
      className="flex flex-col items-center justify-center min-h-[88vh] py-16 bg-gradient-to-tr from-cyan-900 via-slate-900 to-indigo-800 dark:from-neutral-900 dark:via-black dark:to-zinc-800"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, ease: [0.3, 0.7, 0.3, 1], delay: 0.24 }}
    >
      <motion.h1
        className="font-extrabold text-4xl md:text-6xl gradient-text bg-clip-text text-transparent bg-gradient-to-tr from-cyan-300 to-orange-400 text-center drop-shadow-lg mb-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.54, duration: 0.8, type: "spring", bounce: 0.22 }}
      >
        Welcome to DevSuite
      </motion.h1>
      <motion.p
        className="max-w-xl text-lg md:text-2xl text-slate-100/90 dark:text-zinc-300 mb-8 text-center font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.88, duration: 0.8 }}
      >
        Four productivity super-apps. One beautiful workspace.<br />
        <span className="text-cyan-200 font-semibold">
          MindMelt AI • ClassCrushr • SplitMate • FocusFlow
        </span>
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.14, duration: 0.4, type: "spring", stiffness: 240 }}
        className="flex gap-6"
      >
        <Link
          to="/mindmelt"
          className="btn btn-large text-lg shadow-lg hover:scale-105 transform-gpu transition ring-2 ring-cyan-400/30"
          style={{
            background: 'linear-gradient(92deg,var(--base-light),#ff980096)',
            color: '#171933',
            borderRadius: 16,
            fontWeight: 600,
            padding: "15px 32px"
          }}
        >
          Get Started
        </Link>
      </motion.div>
      <div className="mt-16 text-slate-300/85 text-sm">
        <span>Made with <span className="text-orange-400">React</span>, <span className="text-cyan-400">Tailwind CSS</span> & <span className="text-yellow-400">Framer Motion</span>
        </span>
      </div>
    </motion.section>
  );
}

function App() {
  const [theme, setTheme] = useTheme();

  // root-level flex and bg for premium premium feel
  return (
    <Router>
      <div
        className={`min-h-screen flex flex-col bg-gradient-to-br from-white via-[rgb(230,245,255,0.93)] to-slate-50 dark:from-[rgb(10,15,21,0.96)] dark:via-slate-900 dark:to-zinc-900 transition-colors duration-200`}
        style={{ fontFamily: "'Inter','Montserrat','sans-serif'", transition: 'background 0.25s' }}
      >
        <Navbar theme={theme} setTheme={setTheme} />
        <main className="flex-1 w-full mx-auto relative overflow-x-hidden">
          <AnimatedRoutes theme={theme} />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
