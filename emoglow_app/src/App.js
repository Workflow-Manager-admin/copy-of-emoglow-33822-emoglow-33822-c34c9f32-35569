import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import "./index.css";
import navStyles from "./components/NavBar.module.css";
import NavBar from "./components/NavBar";

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
        className={navStyles.animatedRoutes}
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

// Theme toggle switch - using NavBar.module.css for all classes, no inline style
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      className={navStyles.themeToggle}
      onClick={toggleTheme}
      type="button"
    >
      {/* Light */}
      <span
        className={`${navStyles.themeToggleLight}${theme === "light" ? ` ${navStyles.selected}` : ""}`}
        tabIndex={-1}
      >
        <span className={navStyles.icon} style={{ background: "#f7d06c" }}></span>
      </span>
      {/* Dark */}
      <span
        className={`${navStyles.themeToggleDark}${theme === "dark" ? ` ${navStyles.selected}` : ""}`}
        tabIndex={-1}
      >
        <span className={navStyles.icon} style={{ background: "#0c2638" }}></span>
      </span>
    </button>
  );
}



/**
 * PUBLIC_INTERFACE
 * Main App component with ThemeProvider, Router, global layout, and Navbar.
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className={navStyles.app}>
          <NavBar />
          <main className={navStyles.mainContent}>
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;