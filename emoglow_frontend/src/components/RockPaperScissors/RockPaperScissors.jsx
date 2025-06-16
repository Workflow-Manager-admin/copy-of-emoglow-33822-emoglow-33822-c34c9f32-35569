import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./RockPaperScissors.css";

/**
 * Sound effects for the game.
 * Use plain root-relative paths for assets (compatible with Create React App public/ directory).
 */
const SOUNDS = {
  win: "/assets/sounds/win.wav",
  lose: "/assets/sounds/loss.wav",
  draw: "/assets/sounds/draw.wav",
};

// Unicode/emoji for game buttons
const ICONS = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

const MOVES = ["rock", "paper", "scissors"];

// AI logic for each difficulty
const DIFFICULTY_AI = {
  Easy: () => MOVES[Math.floor(Math.random() * 3)],
  Medium: (lastPlayerMove) => {
    // Predictive: counter player last move 50% of the time, else random
    if (!lastPlayerMove || Math.random() < 0.5) return MOVES[Math.floor(Math.random() * 3)];
    if (lastPlayerMove === "rock") return "paper";
    if (lastPlayerMove === "paper") return "scissors";
    if (lastPlayerMove === "scissors") return "rock";
    return MOVES[Math.floor(Math.random() * 3)];
  },
  Hard: (playerHistory) => {
    // Track player history; counter the most played
    if (playerHistory.length < 2) return MOVES[Math.floor(Math.random() * 3)];
    const freq = { rock: 0, paper: 0, scissors: 0 };
    playerHistory.forEach((m) => freq[m]++);
    const most = Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b));
    // Counter the most frequent move
    if (most === "rock") return "paper";
    if (most === "paper") return "scissors";
    if (most === "scissors") return "rock";
    return MOVES[Math.floor(Math.random() * 3)];
  },
};

// Result for display: text label and result className
const RESULT = {
  win: { label: "You Win!", className: "rps-result-win" },
  lose: { label: "You Lose", className: "rps-result-lose" },
  draw: { label: "Draw", className: "rps-result-draw" },
};

// PUBLIC_INTERFACE
function RockPaperScissors() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [playerMove, setPlayerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [round, setRound] = useState(1);
  const [feedbackClass, setFeedbackClass] = useState("");
  const [playerHistory, setPlayerHistory] = useState([]);
  const [gameHistory, setGameHistory] = useState([]); // [{round, player, opponent, result}]
  const [isAnimating, setIsAnimating] = useState(false); // To prevent input spam during animation

  // Sound effects refs
  const audioRef = useRef({
    win: null,
    lose: null,
    draw: null,
  });

  // PUBLIC_INTERFACE
  function computeResult(p, o) {
    if (p === o) return "draw";
    if (
      (p === "rock" && o === "scissors") ||
      (p === "scissors" && o === "paper") ||
      (p === "paper" && o === "rock")
    )
      return "win";
    return "lose";
  }

  // Player chooses move (button click):
  const handlePlayerMove = (move) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPlayerMove(move);

    // Select bot move
    let botMove;
    if (difficulty === "Easy") botMove = DIFFICULTY_AI.Easy();
    else if (difficulty === "Medium") botMove = DIFFICULTY_AI.Medium(playerMove || null);
    else botMove = DIFFICULTY_AI.Hard(playerHistory);

    setOpponentMove(botMove);

    const r = computeResult(move, botMove);
    setResult(r);

    // Animated feedback result
    setFeedbackClass("rps-animate-result");

    // Score/History update after animation delay
    setTimeout(() => {
      setScore((s) => ({
        player: s.player + (r === "win" ? 1 : 0),
        opponent: s.opponent + (r === "lose" ? 1 : 0),
      }));
      setRound((val) => val + 1);
      setGameHistory((hist) => [
        ...hist,
        {
          round,
          player: move,
          opponent: botMove,
          result: r,
        },
      ]);
      setPlayerHistory((h) => [...h, move]);
      playSound(r);
      setIsAnimating(false);
    }, 1050);

    // Remove animation class after bounce
    setTimeout(() => {
      setFeedbackClass("");
    }, 1200);
  };

  // Play win/loss/draw sound
  // PUBLIC_INTERFACE
  function playSound(res) {
    if (audioRef.current[res]) {
      audioRef.current[res].pause(); // If still playing, reset
      audioRef.current[res].currentTime = 0;
      audioRef.current[res].play();
    }
  }

  // Reset game
  const handleReset = () => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    setScore({ player: 0, opponent: 0 });
    setRound(1);
    setPlayerHistory([]);
    setGameHistory([]);
    setFeedbackClass("");
    setIsAnimating(false);
  };

  // Large animated move buttons, feedback on selection
  const getButtonClass = (move) =>
    `rps-move-btn${
      playerMove === move && feedbackClass
        ? " rps-btn-selected rps-btn-press"
        : ""
    }`;

  // Animated result feedback area
  function renderResultArea() {
    if (!result) return <div className="rps-placeholder">Pick your move!</div>;

    return (
      <div className={`rps-result ${RESULT[result].className} ${feedbackClass}`}>
        <div className="rps-result-emoji">
          {result === "win" && "🎉"}
          {result === "lose" && "😅"}
          {result === "draw" && "🤝"}
        </div>
        <div className="rps-result-label">{RESULT[result].label}</div>
        <div className="rps-move-summary">
          You: <span className="rps-icon">{ICONS[playerMove]}</span> &nbsp;vs.&nbsp;{" "}
          Bot: <span className="rps-icon">{ICONS[opponentMove]}</span>
        </div>
      </div>
    );
  }

  // Scoreboard and round counter
  function renderScoreboard() {
    return (
      <div className="rps-scoreboard">
        <div>
          <span className="rps-score-title">Score</span>
          <span className="rps-score-value rps-score-player">
            {score.player}
          </span>
          <span className="rps-score-divider">-</span>
          <span className="rps-score-value rps-score-bot">
            {score.opponent}
          </span>
        </div>
        <span className="rps-round-badge">Round {round}</span>
      </div>
    );
  }

  // Tracker of the last 3 rounds, animated colored chips
  function renderHistory() {
    if (!gameHistory.length) return null;
    return (
      <div className="rps-history">
        Last rounds:{" "}
        {gameHistory
          .slice(-3)
          .reverse()
          .map((h, idx) => (
            <span
              key={idx}
              className={`rps-history-item rps-hist-${h.result}`}
              title={`${h.player} vs ${h.opponent}: ${h.result}`}
            >
              {RESULT[h.result].label}
            </span>
          ))}
      </div>
    );
  }

  return (
    <div className="rps-root">
      <h2 className="rps-title">Rock Paper Scissors</h2>

      {/* Difficulty selector */}
      <div className="rps-difficulty">
        <label htmlFor="rps-diff" className="rps-diff-label">
          Difficulty:
        </label>
        <select
          id="rps-diff"
          className="rps-diff-select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={isAnimating}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      {/* Scoreboard */}
      {renderScoreboard()}

      {/* Animated result */}
      <div className="rps-result-area">{renderResultArea()}</div>
      {renderHistory()}

      {/* Move buttons */}
      <div className="rps-move-buttons">
        {MOVES.map((move) => (
          <button
            key={move}
            className={getButtonClass(move)}
            onClick={() => handlePlayerMove(move)}
            disabled={isAnimating}
            aria-label={move.charAt(0).toUpperCase() + move.slice(1)}
          >
            <span className="rps-move-emoji">{ICONS[move]}</span>
            <span className="rps-move-name">
              {move.charAt(0).toUpperCase() + move.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {/* Reset button */}
      <button className="rps-reset-btn" onClick={handleReset} disabled={isAnimating}>
        Reset Game
      </button>

      {/* Back to home link */}
      <div style={{ marginTop: "1.2rem" }}>
        <Link className="rps-back-link" to="/">
          ← Back to Home
        </Link>
      </div>

      {/* Audio assets */}
      <audio
        ref={(el) => (audioRef.current.win = el)}
        src={SOUNDS.win}
        preload="auto"
      />
      <audio
        ref={(el) => (audioRef.current.lose = el)}
        src={SOUNDS.lose}
        preload="auto"
      />
      <audio
        ref={(el) => (audioRef.current.draw = el)}
        src={SOUNDS.draw}
        preload="auto"
      />
    </div>
  );
}

export default RockPaperScissors;
