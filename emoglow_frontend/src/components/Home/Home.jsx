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
        <Link className="home-tile" to="/rock-paper-scissors">
          <span role="img" aria-label="rock-paper-scissors" className="home-tile-emoji">✊✋✌️</span>
          <span className="home-tile-label">Rock Paper Scissors</span>
          <span className="home-tile-desc">Outsmart the bot!</span>
        </Link>
        <Link className="home-tile" to="/tic-tac-toe">
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
