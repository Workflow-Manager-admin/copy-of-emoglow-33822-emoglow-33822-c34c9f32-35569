import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

// PUBLIC_INTERFACE
function Home() {
  return (
    <div className="home-root">
      <h1 className="home-title">Goofy Creations</h1>
      <p className="home-subtitle">Choose your game adventure!</p>
      <div className="home-tiles">
        <Link className="home-tile" to="/rock-paper-scissors">
          <span role="img" aria-label="rock-paper-scissors">✊✋✌️</span>
          <span>Rock Paper Scissors</span>
        </Link>
        <Link className="home-tile" to="/space-shooter">
          <span role="img" aria-label="space shooter">🚀</span>
          <span>Space Shooter</span>
        </Link>
        <Link className="home-tile" to="/tic-tac-toe">
          <span role="img" aria-label="tic tac toe">❌⭕</span>
          <span>Tic Tac Toe</span>
        </Link>
      </div>
    </div>
  );
}

export default Home;
