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

// For compatibility: index (0–7) matches WIN_LINES
/**
 * Calculate the win line's SVG parameters (x1, y1, x2, y2) to overlay on the board.
 * @param {number} strikeIdx - index into WIN_LINES
 * @returns {{x1:number, y1:number, x2:number, y2:number}}
 */
function getStrikeSVGCoords(strikeIdx) {
  // Board is 3x3 grid, SVG is 100x100% (viewBox 0 0 100 100)
  // Each cell: size = 33.333... units
  const cell = (n) => 16.6667 + 33.3333 * n; // Center of cell n (0,1,2)
  switch (strikeIdx) {
    case 0: // Top row
      return { x1: 7, y1: cell(0), x2: 93, y2: cell(0) };
    case 1: // Middle row
      return { x1: 7, y1: cell(1), x2: 93, y2: cell(1) };
    case 2: // Bottom row
      return { x1: 7, y1: cell(2), x2: 93, y2: cell(2) };
    case 3: // Left col
      return { x1: cell(0), y1: 7, x2: cell(0), y2: 93 };
    case 4: // Middle col
      return { x1: cell(1), y1: 7, x2: cell(1), y2: 93 };
    case 5: // Right col
      return { x1: cell(2), y1: 7, x2: cell(2), y2: 93 };
    case 6: // Main diagonal "\"
      return { x1: 10, y1: 10, x2: 90, y2: 90 };
    case 7: // Anti-diagonal "/"
      return { x1: 90, y1: 10, x2: 10, y2: 90 };
    default:
      return null;
  }
}

// Square (cell) presentation
function Cell({ value, onClick, isWinning, isDisabled, idx }) {
  return (
    <button
      className={`ttt-cell${isWinning ? " ttt-cell-win" : ""}`}
      onClick={onClick}
      disabled={!!value || isDisabled}
      aria-label={`Tic Tac Toe cell ${idx + 1}, ${value || "empty"}`}
      tabIndex={0}
      style={{
        padding: 0,
        margin: 0,
      }}
    >
      {value && (
        <span className={`ttt-cell-val ttt-cell-val-${value}`}>
          {/* Render a BOLD EMOJI styled perfectly centered */}
          <span
            style={{
              fontSize: "1em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              fontWeight: 900,
              textShadow:
                value === "X"
                  ? "0 1.5px 11px #41eded29"
                  : "0 1.5px 11px #ffe66f77",
              lineHeight: 1,
              filter:
                value === "X"
                  ? "drop-shadow(0 3px 12px #33e4e41d)"
                  : "drop-shadow(0 4px 16px #ff980025)",
              letterSpacing: "-0.04em",
              margin: 0,
              padding: 0,
              // Prevent overflow
              overflow: "hidden",
              userSelect: "none",
              // Maximize bold/crisp
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            {value === "X" ? (
              <span style={{ color: "#33e4e4" }}>❌</span>
            ) : (
              <span
                style={{
                  color: "#ff9800",
                  WebkitTextStroke: "1.5px #fff900",
                  fontWeight: 900,
                }}
              >
                ⭕
              </span>
            )}
          </span>
        </span>
      )}
    </button>
  );
}

// Result messaging and action
function ResultMessage({ winner, draw, current, onRestart }) {
  let msg, emoji;
  if (winner)
    [msg, emoji] = [
      `Winner: ${winner === "X" ? "❌ X" : "⭕ O"}`,
      winner === "X" ? "🏆" : "🎉",
    ];
  else if (draw) [msg, emoji] = ["It's a draw!", "🤝"];
  else [msg, emoji] = [`${current === "X" ? "❌ X" : "⭕ O"}'s turn`, "🔄"];

  return (
    <div className="ttt-result-area" aria-live="polite" tabIndex={-1}>
      <div
        className={
          winner
            ? "ttt-result-win"
            : draw
            ? "ttt-result-draw"
            : "ttt-result-turn"
        }
      >
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
  const [strikeInfo, setStrikeInfo] = useState({
    winner: null,
    winningLine: null,
    strikeIdx: null,
    draw: false,
  });
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
        className={`ttt-board-wrap${restarting ? " ttt-board-restart" : ""}${strikeInfo.winner ? " ttt-board-finished" : ""}`}
        style={{ position: "relative", overflow: "visible" }}
      >
        {/* SVG Strike line: overlays whole board, perfectly centered */}
        {strikeInfo.winner &&
          typeof strikeInfo.strikeIdx === "number" &&
          (() => {
            const coords = getStrikeSVGCoords(strikeInfo.strikeIdx);
            if (!coords) return null;
            return (
              <svg
                className="ttt-strike-svg"
                viewBox="0 0 100 100"
                style={{
                  position: "absolute",
                  pointerEvents: "none",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 7,
                  overflow: "visible",
                }}
                aria-hidden="true"
                focusable="false"
              >
                <line
                  x1={coords.x1}
                  y1={coords.y1}
                  x2={coords.x2}
                  y2={coords.y2}
                  stroke="#ff9800"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: "drop-shadow(0px 3px 16px #ff980042)",
                    opacity: 0.92,
                    transition: "all 0.41s cubic-bezier(.22,1.11,.53,1)",
                  }}
                />
              </svg>
            );
          })()}
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
