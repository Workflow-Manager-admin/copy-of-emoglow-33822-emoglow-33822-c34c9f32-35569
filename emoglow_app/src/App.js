import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import "./index.css";

// Screens
import Home from "./screens/Home";
import MoodInput from "./screens/MoodInput";
import Quote from "./screens/Quote";
import Tracker from "./screens/Tracker";
import Task from "./screens/Task";
import Settings from "./screens/Settings";

// Simple navigation items for all routes
const navLinks = [
  { to: "/mindmelt", label: "Home" },
  { to: "/mindmelt/mood-input", label: "Mood" },
  { to: "/mindmelt/quote", label: "Quote" },
  { to: "/mindmelt/tracker", label: "Tracker" },
  { to: "/mindmelt/task", label: "Task" },
  { to: "/mindmelt/settings", label: "Settings" },
];

// Animated route wrapper with Framer Motion
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.5 }}
        className="flex-1"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/mindmelt" element={<Home />} />
          <Route path="/mindmelt/mood-input" element={<MoodInput />} />
          <Route path="/mindmelt/quote" element={<Quote />} />
          <Route path="/mindmelt/tracker" element={<Tracker />} />
          <Route path="/mindmelt/task" element={<Task />} />
          <Route path="/mindmelt/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// Theme toggle switch
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      className="bg-gray-200 dark:bg-zinc-800 rounded-full px-2 flex items-center h-8 transition-colors"
      style={{ minWidth: 56, borderRadius: 9999, border: "1px solid #e5e5e5" }}
      onClick={toggleTheme}
    >
      <span
        className={
          "inline-flex items-center justify-center w-6 h-6 transition-all" +
          (theme === "light" ? " bg-white rounded-full shadow mr-2 border" : " border border-gray-400 mr-1")
        }
      >
        <span className="w-3 h-3 inline-block rounded-full bg-yellow-400"></span>
      </span>
      <span
        className={
          "inline-flex items-center justify-center w-6 h-6 transition-all" +
          (theme === "dark" ? " border rounded-full ml-2 ring-2 ring-blue-900" : " border-gray-400 ml-2")
        }
      >
        <span className="w-3 h-3 inline-block rounded-full bg-zinc-900"></span>
      </span>
    </button>
  );
}

function Navbar() {
  return (
    <nav className="navbar sticky top-0 z-20" role="navigation">
      <div className="container flex items-center justify-between w-full">
        <div className="logo flex items-center gap-2">
          <span className="logo-symbol">💧</span>
          MindMelt AI
        </div>
        <div className="flex items-center gap-3">
          {navLinks.map((l) => (
            <Link
              to={l.to}
              key={l.to}
              className="btn btn-sm px-3 py-1 font-medium"
              style={{ background: "none", color: "inherit", boxShadow: "none" }}
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app flex flex-col min-h-screen bg-mood-gradient dark:bg-mood-dark">
          <Navbar />
          <main className="flex-1 w-full flex flex-col justify-center">
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;