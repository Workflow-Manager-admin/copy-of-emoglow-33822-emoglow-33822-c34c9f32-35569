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
      className="theme-toggle"
      style={{
        minWidth: 56,
        borderRadius: 9999,
        border: "1px solid #e5e5e5",
        display: "flex",
        alignItems: "center",
        background: "var(--base-dark)",
        padding: "2px 8px",
        height: 32,
        cursor: "pointer",
        transition: "background 0.1s"
      }}
      onClick={toggleTheme}
    >
      {/* Light */}
      <span
        className="theme-toggle-light"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: theme === "light" ? "#fff" : "transparent",
          boxShadow: theme === "light" ? "0 2px 8px #0002" : "none",
          marginRight: 5,
          border: theme === "light" ? "2px solid #bbeffd" : "1px solid #bbb",
          transition: "all .28s cubic-bezier(.4,0,.2,1)"
        }}
      >
        <span style={{
          width: 12,
          height: 12,
          display: "inline-block",
          borderRadius: "50%",
          background: "#f7d06c"
        }}></span>
      </span>
      {/* Dark */}
      <span
        className="theme-toggle-dark"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: theme === "dark" ? "2px solid #003266" : "1px solid #bbb",
          background: theme === "dark" ? "#011326" : "transparent",
          marginLeft: 5,
          transition: "all .28s cubic-bezier(.4,0,.2,1)"
        }}
      >
        <span style={{
          width: 12,
          height: 12,
          display: "inline-block",
          borderRadius: "50%",
          background: "#0c2638"
        }}></span>
      </span>
    </button>
  );
}

function Navbar() {
  return (
    <nav className="navbar" role="navigation">
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
      }}>
        <div className="logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="logo-symbol">💧</span>
          MindMelt AI
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {navLinks.map((l) => (
            <Link
              to={l.to}
              key={l.to}
              className="btn btn-nav"
              style={{
                background: "none",
                color: "inherit",
                fontWeight: 500,
                fontSize: "1rem",
                borderRadius: 3,
                padding: "8px 14px",
                marginRight: 0,
                transition: "background .14s"
              }}
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