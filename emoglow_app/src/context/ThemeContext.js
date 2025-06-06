import React, { createContext, useContext, useEffect, useState } from "react";

// PUBLIC_INTERFACE
export const ThemeContext = createContext();

/**
 * ThemeProvider to supply global light/dark theme state with support for system preference and local storage.
 */
export function ThemeProvider({ children }) {
  // Prefer localStorage or system theme, fallback to "light"
  const initialTheme = () =>
    localStorage.getItem("theme") ||
    (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle between light and dark theme
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useTheme() {
  return useContext(ThemeContext);
}
