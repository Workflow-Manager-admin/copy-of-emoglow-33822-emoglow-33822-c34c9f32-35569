import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

// PUBLIC_INTERFACE
function Home() {
  return (
    <div className="home-root">
      <section className="home-header">
        <div className="home-logo">
          <span role="img" aria-label="gaming emoji" className="home-logo-emoji">
            🎲
          </span>
          <span className="home-site-title">Goofy Creations</span>
        </div>
        <div className="home-subtitle-box">
          <p className="home-subtitle">
            Mini-games for every mood! <span className="home-sparkle">✨</span>
          </p>
          <p className="home-site-desc">
            Play quick &amp; fun games—challenge yourself or just take a break!
          </p>
        </div>
      </section>
      <nav className="home-tiles" aria-label="Main site navigation">
        {/* Minesweeper Tile */}
        <Link
          className="home-tile"
          to="/minesweeper"
          tabIndex={0}
          aria-label="Minesweeper mini-game"
        >
          <span role="img" aria-label="minesweeper" className="home-tile-emoji">💣</span>
          <span className="home-tile-label">Minesweeper</span>
          <span className="home-tile-desc">Find all safe spots—avoid the orange mines!</span>
        </Link>
        {/* Rock Paper Scissors Tile */}
        <Link
          className="home-tile"
          to="/rock-paper-scissors"
          tabIndex={0}
          aria-label="Rock Paper Scissors mini-game"
        >
          <span role="img" aria-label="rock-paper-scissors" className="home-tile-emoji">✊✋✌️</span>
          <span className="home-tile-label">Rock Paper Scissors</span>
          <span className="home-tile-desc">Outsmart the bot!</span>
        </Link>
        {/* Tic Tac Toe Tile */}
        <Link
          className="home-tile"
          to="/tic-tac-toe"
          tabIndex={0}
          aria-label="Tic Tac Toe mini-game"
        >
          <span role="img" aria-label="tic tac toe" className="home-tile-emoji">❌⭕</span>
          <span className="home-tile-label">Tic Tac Toe</span>
          <span className="home-tile-desc">Classic duel!</span>
        </Link>
      </nav>
      <footer className="home-footer">
        <span>Made with <span role="img" aria-label="lightning">⚡</span> for fun. &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default Home;
