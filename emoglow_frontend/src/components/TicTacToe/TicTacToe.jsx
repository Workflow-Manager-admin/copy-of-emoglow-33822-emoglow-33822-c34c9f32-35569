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

/**
 * Calculate the win line SVG points (x1, y1, x2, y2) for the board (viewBox 0 0 100 100) for any win type.
 * Always computes pixel-aligned midpoints for crisp, sharp rendering.
 */
function getStrikeSVGCoords(strikeIdx) {
  // Padding so line does not touch edges, and always centered in cell.
  // SVG is 0..100 in both axes.
  // Each cell is about 33.33 wide/high; line is centered in each cell.
  const pad = 12;
  const cellPos = (n) => 16.67 + 33.33 * n; // center of 0,1,2
  switch (strikeIdx) {
    case 0: // Row 1
      return { x1: pad, y1: cellPos(0), x2: 100 - pad, y2: cellPos(0) };
    case 1: // Row 2
      return { x1: pad, y1: cellPos(1), x2: 100 - pad, y2: cellPos(1) };
    case 2: // Row 3
      return { x1: pad, y1: cellPos(2), x2: 100 - pad, y2: cellPos(2) };
    case 3: // Col 1
      return { x1: cellPos(0), y1: pad, x2: cellPos(0), y2: 100 - pad };
    case 4: // Col 2
      return { x1: cellPos(1), y1: pad, x2: cellPos(1), y2: 100 - pad };
    case 5: // Col 3
      return { x1: cellPos(2), y1: pad, x2: cellPos(2), y2: 100 - pad };
    case 6: // Diagonal "\"
      return { x1: pad, y1: pad, x2: 100 - pad, y2: 100 - pad };
    case 7: // Diagonal "/"
      return { x1: 100 - pad, y1: pad, x2: pad, y2: 100 - pad };
    default:
      return null;
  }
}

// Square (cell) presentation
function Cell({ value, onClick, isWinning, isDisabled, idx }) {
  // PUBLIC_INTERFACE
  // X/O always bold, centered, and never clipped
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
        // font-size handled via clamp in CSS for true responsiveness/clipping, but fallback here also
        fontSize: "clamp(2rem,8vw,5rem)",
        fontFamily:
          "'Orbitron', 'Poppins', 'Inter', 'Roboto Mono', 'Menlo', 'Consolas', monospace, sans-serif",
        fontWeight: 900,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        // Prevent any possible shrinking bug
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {value && (
        <span
          className={`ttt-cell-val ttt-cell-val-${value}`}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily:
              "'Orbitron', 'Poppins', 'Inter', 'Roboto Mono', 'Menlo', 'Consolas', monospace, sans-serif",
            fontWeight: 900,
            fontSize: "1em", // inherits from cell
            lineHeight: 1,
            margin: "auto",
            padding: 0,
            boxSizing: "border-box",
            userSelect: "none",
            overflow: "hidden",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            letterSpacing: "-0.04em",
          }}
        >
          {value === "X" ? (
            <span
              aria-label="X"
              style={{
                color: "#fff",
                fontFamily: "'Orbitron', 'Poppins', 'Inter', 'Menlo', 'Consolas', monospace",
                fontWeight: 900,
                fontSize: "1em",
                lineHeight: 1,
                filter: "none",
                textShadow: "0 1.5px 6px #ff9800cc",
                WebkitTextStroke: "2px #33e4e4",
              }}
            >
              X
            </span>
          ) : (
            <span
              aria-label="O"
              style={{
                color: "#ff9800",
                fontFamily: "'Orbitron', 'Poppins', 'Inter', 'Menlo', 'Consolas', monospace",
                fontWeight: 900,
                fontSize: "1em",
                lineHeight: 1,
                filter: "none",
                textShadow: "0 1.5px 6px #fff90077",
                WebkitTextStroke: "2.5px #fff",
              }}
            >
              O
            </span>
          )}
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
        {/* SVG Strike-through win line: overlays board, perfectly centered and always sharp */}
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
                  zIndex: 8,
                  overflow: "visible",
                  // No background, fully transparent
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
                    filter: "none",
                    opacity: 1,
                    // No blurred shadow, only solid
                    transition: "all 0.21s cubic-bezier(.41,1.01,.51,.97)",
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
