import React from "react";
import { Link } from "react-router-dom";
import "./TicTacToe.css";

// PUBLIC_INTERFACE
function TicTacToe() {
  return (
    <div className="tictactoe-root">
      <h2>Tic Tac Toe</h2>
      <p>Try your wits in Tic Tac Toe! (Game coming soon!)</p>
      <Link className="tictactoe-back-link" to="/">← Back to Home</Link>
    </div>
  );
}

export default TicTacToe;
