import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import navStyles from "./NavBar.module.css";
import { useTheme } from "../context/ThemeContext";

// Navigation link config
const navLinks = [
  { to: "/mindmelt", label: "Home" },
  { to: "/mindmelt/mood-input", label: "Mood" },
  { to: "/mindmelt/quote", label: "Quote" },
  { to: "/mindmelt/tracker", label: "Tracker" },
  { to: "/mindmelt/task", label: "Task" },
  { to: "/mindmelt/settings", label: "Settings" },
];

// PUBLIC_INTERFACE
/** 
 * Theme toggle button (Apple-styled pill switch)
 */
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
        <span className={navStyles.icon} style={{ background: "#f7d06c" }} />
      </span>
      {/* Dark */}
      <span
        className={`${navStyles.themeToggleDark}${theme === "dark" ? ` ${navStyles.selected}` : ""}`}
        tabIndex={-1}
      >
        <span className={navStyles.icon} style={{ background: "#0c2638" }} />
      </span>
    </button>
  );
}

/**
 * PUBLIC_INTERFACE
 * Fully modular, responsive NavBar (Apple-inspired): logo hover morph, hamburger menu for mobile, modular classNames,
 * seamless CSS variable usage, and smooth text-to-logo frosted morph.
 */
export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoHover, setLogoHover] = useState(false);

  const location = useLocation();
  const navMenuRef = useRef();

  // Hide menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Accessibility - close menu on Escape
  React.useEffect(() => {
    function handleKey(e) {
      if (!mobileMenuOpen) return;
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mobileMenuOpen]);

  // Lock body scroll if menu open (mobile)
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <nav className={navStyles.navbar} role="navigation" aria-label="Main navigation">
      <div className={navStyles.navbarContainer}>
        {/* Logo: morph to symbol on hover/focus */}
        <Link
          to={"/mindmelt"}
          className={navStyles.logo}
          tabIndex={0}
          aria-label="MindMelt AI Home"
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          onFocus={() => setLogoHover(true)}
          onBlur={() => setLogoHover(false)}
        >
          <span
            className={`${navStyles.logoSymbol} ${logoHover ? navStyles.logoMorph : ""}`}
            aria-hidden="true"
          >
            💧
          </span>
          <span
            className={`${navStyles.logoText} ${logoHover ? navStyles.logoFadeOut : ""}`}
            aria-hidden={logoHover ? "true" : "false"}
          >
            MindMelt AI
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={navStyles.navLinks} aria-label="Site links">
          <div className={navStyles.linksDesktop}>
            {navLinks.map((l) => (
              <Link
                to={l.to}
                key={l.to}
                className={`${navStyles.navLink} ${location.pathname === l.to ? navStyles.active : ""}`}
                aria-current={location.pathname === l.to ? "page" : undefined}
                tabIndex={0}
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>

        {/* Hamburger Button (mobile only, semantic and animated) */}
        <button
          className={`${navStyles.hamburger} ${mobileMenuOpen ? navStyles.hamburgerActive : ""}`}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="navbar-mobile-menu"
          onClick={() => setMobileMenuOpen(m => !m)}
        >
          <span className={navStyles.hamburgerBox}>
            <span className={navStyles.hamburgerInner} />
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu, animated */}
      <div
        className={`${navStyles.mobileMenu} ${mobileMenuOpen ? navStyles.mobileMenuOpen : ""}`}
        id="navbar-mobile-menu"
        ref={navMenuRef}
        tabIndex={-1}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={navStyles.mobileMenuList}>
          {navLinks.map((l) => (
            <Link
              to={l.to}
              key={l.to}
              className={`${navStyles.navLink} ${location.pathname === l.to ? navStyles.active : ""}`}
              aria-current={location.pathname === l.to ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              tabIndex={mobileMenuOpen ? 0 : -1}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: "10px" }}>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Menu scrim/overlay for mobile */}
      <div
        className={`${navStyles.menuScrim} ${mobileMenuOpen ? navStyles.menuScrimShow : ""}`}
        tabIndex={-1}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />
    </nav>
  );
}
