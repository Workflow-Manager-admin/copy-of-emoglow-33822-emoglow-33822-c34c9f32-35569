import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./TicTacToe.css";

// Win combinations for a 3x3 Tic Tac Toe board
const WIN_LINES = [
  [0, 1, 2], // Rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // Columns
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // Diagonals
  [2, 4, 6],
];

// For striking line CSS classes
const STRIKE_CLASSES = [
  "strike-row-0", // Top row
  "strike-row-1",
  "strike-row-2",
  "strike-col-0", // Left col
  "strike-col-1",
  "strike-col-2",
  "strike-diag-main", // \ diagonal
  "strike-diag-anti", // / diagonal
];

// Square (cell) presentation
function Cell({ value, onClick, isWinning, isDisabled, idx }) {
  return (
    <button
      className={`ttt-cell${isWinning ? " ttt-cell-win" : ""}`}
      onClick={onClick}
      disabled={!!value || isDisabled}
      aria-label={`Tic Tac Toe cell ${idx + 1}, ${value || "empty"}`}
      tabIndex={0}
    >
      {value && (
        <span className={`ttt-cell-val ttt-cell-val-${value}`}>
          {value === "X" ? "❌" : "⭕"}
        </span>
      )}
    </button>
  );
}

// Result messaging and action
function ResultMessage({ winner, draw, current, onRestart, strikeClass }) {
  let msg, emoji;
  if (winner)
    [msg, emoji] = [
      `Winner: ${winner === "X" ? "❌ X" : "⭕ O"}`,
      winner === "X" ? "🏆" : "🎉",
    ];
  else if (draw)
    [msg, emoji] = ["It's a draw!", "🤝"];
  else
    [msg, emoji] = [`${current === "X" ? "❌ X" : "⭕ O"}'s turn`, "🔄"];

  return (
    <div
      className="ttt-result-area"
      aria-live="polite"
      tabIndex={-1}
    >
      <div className={winner ? "ttt-result-win" : draw ? "ttt-result-draw" : "ttt-result-turn"}>
        <span className="ttt-result-emoji">{emoji}</span>
        <span className="ttt-result-msg">{msg}</span>
      </div>
      {(winner || draw) && (
        <button className="ttt-restart-btn" onClick={onRestart}>
          <span className="ttt-restart-emoji">🔁</span>
          New Game
        </button>
      )}
    </div>
  );
}

// Detect winner and return winner + strike index, or check for draw
function getGameStatus(squares) {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], winningLine: WIN_LINES[i], strikeIdx: i };
    }
  }
  // Draw if all filled
  if (squares.every(Boolean)) {
    return { draw: true };
  }
  // Game ongoing
  return {};
}

// PUBLIC_INTERFACE
function TicTacToe() {
  // X is always first
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [strikeInfo, setStrikeInfo] = useState({ winner: null, winningLine: null, strikeIdx: null, draw: false });
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    setStrikeInfo(getGameStatus(squares));
  }, [squares]);

  // PUBLIC_INTERFACE
  // Handle cell click logic & animation/lock
  function handleClick(idx) {
    if (strikeInfo.winner || strikeInfo.draw || squares[idx]) return;
    const next = squares.slice();
    next[idx] = isXNext ? "X" : "O";
    setSquares(next);
    setIsXNext(!isXNext);
  }

  // PUBLIC_INTERFACE
  // Handle smooth game restart animation
  function handleRestart() {
    setRestarting(true);
    setTimeout(() => {
      setSquares(Array(9).fill(null));
      setIsXNext(Math.random() < 0.5); // Randomize start for next game
      setStrikeInfo({});
      setRestarting(false);
    }, 380); // CSS fade-out anim must match this
  }

  // Highlight winning line cells
  const winningSquares = strikeInfo.winningLine || [];

  return (
    <div className="tictactoe-root">

      <h2 className="ttt-title">Tic Tac Toe</h2>

      <div
        className={`ttt-board-wrap${restarting ? " ttt-board-restart" : ""}${
          strikeInfo.winner ? " ttt-board-finished" : ""
        }`}
      >
        {/* Animated strike line if winner */}
        {strikeInfo.winner && (
          <div className={`ttt-strike ${STRIKE_CLASSES[strikeInfo.strikeIdx]}`} />
        )}
        <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
          {Array(9)
            .fill(0)
            .map((_, idx) => (
              <Cell
                key={idx}
                value={squares[idx]}
                isWinning={winningSquares.includes(idx)}
                idx={idx}
                onClick={() => handleClick(idx)}
                isDisabled={!!strikeInfo.winner || !!strikeInfo.draw || restarting}
              />
            ))}
        </div>
      </div>
      <ResultMessage
        winner={strikeInfo.winner}
        draw={strikeInfo.draw}
        current={isXNext ? "X" : "O"}
        onRestart={handleRestart}
      />
      <Link className="tictactoe-back-link" to="/">
        ← Back to Home
      </Link>
    </div>
  );
}

export default TicTacToe;
