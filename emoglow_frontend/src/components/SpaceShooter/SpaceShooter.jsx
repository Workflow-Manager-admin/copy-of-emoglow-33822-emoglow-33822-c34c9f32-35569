import React from "react";
import { Link } from "react-router-dom";
import "./SpaceShooter.css";

// PUBLIC_INTERFACE
function SpaceShooter() {
  return (
    <div className="spaceshooter-root">
      <h2>Space Shooter</h2>
      <p>Get ready to blast through space! (Game coming soon!)</p>
      <Link className="spaceshooter-back-link" to="/">← Back to Home</Link>
    </div>
  );
}

export default SpaceShooter;
