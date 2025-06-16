import React from "react";
import { Link } from "react-router-dom";
import "./RockPaperScissors.css";

// PUBLIC_INTERFACE
function RockPaperScissors() {
  return (
    <div className="rps-root">
      <h2>Rock Paper Scissors</h2>
      <p>This is where you'll play Rock Paper Scissors. (Game coming soon!)</p>
      <Link className="rps-back-link" to="/">← Back to Home</Link>
    </div>
  );
}

export default RockPaperScissors;
