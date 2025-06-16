import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import "./App.css";
import Home from "./components/Home/Home";
import RockPaperScissors from "./components/RockPaperScissors/RockPaperScissors";
import TicTacToe from "./components/TicTacToe/TicTacToe";
import Minesweeper from "./components/Minesweeper/Minesweeper";

/**
 * Public/brand navigation links for all pages
 */
const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/minesweeper", label: "Minesweeper" },
  { to: "/rock-paper-scissors", label: "Rock Paper Scissors" },
  { to: "/tic-tac-toe", label: "Tic Tac Toe" },
];

const App = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileNav = () => setMobileNavOpen((o) => !o);

  // Close menu after nav
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <Router>
      <div className="app" tabIndex={-1}>
        <nav className="navbar" role="navigation" aria-label="Main">
          <div className="container navbar-content">
            <Link to="/" className="logo" tabIndex={0} aria-label="Goofy Creations Home">
              <span className="logo-symbol" aria-hidden="true" style={{ color: "#ff9800" }}>💣</span>
              <span className="logo-title" style={{ color: "#ff9800" }}>Goofy Creations</span>
            </Link>
            <button
              className="navbar-burger"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="navbar-menu"
              onClick={toggleMobileNav}
            >
              <span />
              <span />
              <span />
            </button>
            <ul
              id="navbar-menu"
              className={`navbar-menu${mobileNavOpen ? " open" : ""}`}
              role="menubar"
            >
              {NAV_LINKS.map((link) => (
                <li key={link.to} role="none">
                  <NavLink
                    to={link.to}
                    end={!!link.exact}
                    className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}
                    tabIndex={mobileNavOpen || window.innerWidth > 900 ? 0 : -1}
                    onClick={closeMobileNav}
                    role="menuitem"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <main className="main-content" aria-label="App main content">
          <div className="container page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/minesweeper" element={<Minesweeper />} />
              <Route path="/rock-paper-scissors" element={<RockPaperScissors />} />
              <Route path="/tic-tac-toe" element={<TicTacToe />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
