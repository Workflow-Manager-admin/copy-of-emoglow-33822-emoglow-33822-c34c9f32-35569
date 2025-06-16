import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./RockPaperScissors.css";

// Sound assets (Place the sound files win.wav, lost.mp3, draw.mp3 in your public/assets/sounds directory)
const SOUNDS = {
  win: "/assets/sounds/win.wav",
  lose: "/assets/sounds/lost.mp3",
  draw: "/assets/sounds/draw.mp3",
};

// Emojis for buttons
const ICONS = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

const MOVES = ["rock", "paper", "scissors"];
const DIFFICULTY_AI = {
  Easy: () => MOVES[Math.floor(Math.random() * 3)],
  Medium: (lastPlayerMove) => {
    // Predictive: counter player's last move 50% of time
    if (!lastPlayerMove || Math.random() < 0.5) return MOVES[Math.floor(Math.random() * 3)];
    // Counter logic
    if (lastPlayerMove === "rock") return "paper";
    if (lastPlayerMove === "paper") return "scissors";
    if (lastPlayerMove === "scissors") return "rock";
    return MOVES[Math.floor(Math.random() * 3)];
  },
  Hard: (playerHistory) => {
    // Tracks frequency & counters the most-played move
    if (playerHistory.length < 2) return MOVES[Math.floor(Math.random() * 3)];
    const freq = { rock: 0, paper: 0, scissors: 0 };
    playerHistory.forEach((m) => freq[m]++);
    const most = Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b));
    // Counter move
    if (most === "rock") return "paper";
    if (most === "paper") return "scissors";
    if (most === "scissors") return "rock";
    return MOVES[Math.floor(Math.random() * 3)];
  },
};

// Result colors & classes
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
  const [feedbackClass, setFeedbackClass] = useState(""); // For animated feedback
  const [playerHistory, setPlayerHistory] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for sound effects
  const audioRef = useRef({
    win: null,
    lose: null,
    draw: null,
  });

  // Determine result for player's move vs opponent
  //   Returns "win", "lose", or "draw"
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

  // Called when user clicks a move button
  const handlePlayerMove = (move) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPlayerMove(move);

    // Select opponent move based on difficulty
    let opponent;
    if (difficulty === "Easy") opponent = DIFFICULTY_AI.Easy();
    else if (difficulty === "Medium")
      opponent = DIFFICULTY_AI.Medium(playerMove || null);
    else opponent = DIFFICULTY_AI.Hard(playerHistory);

    setOpponentMove(opponent);

    const r = computeResult(move, opponent);
    setResult(r);

    // For animated result feedback
    setFeedbackClass("rps-animate-result");

    // Update score and round after feedback animation
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
          opponent: opponent,
          result: r,
        },
      ]);
      setPlayerHistory((h) => [...h, move]);
      // Play sound
      playSound(r);
      setIsAnimating(false);
    }, 1050);

    // Remove feedback animation after end
    setTimeout(() => {
      setFeedbackClass("");
    }, 1200);
  };

  // Play win/lose/draw sound
  // PUBLIC_INTERFACE
  function playSound(result) {
    if (audioRef.current[result]) {
      audioRef.current[result].pause();
      audioRef.current[result].currentTime = 0;
      audioRef.current[result].play();
    }
  }

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

  // For buttons: animation if selected AND for result feedback
  const getButtonClass = (move) =>
    `rps-move-btn${
      playerMove === move && feedbackClass
        ? ` rps-btn-selected rps-btn-press`
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

  // Scoreboard
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

  // Tracker of last 3 rounds
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

      {/* Difficulty Selector */}
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

      {/* Animated result area */}
      <div className="rps-result-area">{renderResultArea()}</div>
      {renderHistory()}

      {/* Game move buttons */}
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

      {/* Reset */}
      <button className="rps-reset-btn" onClick={handleReset} disabled={isAnimating}>
        Reset Game
      </button>

      {/* Back link */}
      <div style={{ marginTop: "1.2rem" }}>
        <Link className="rps-back-link" to="/">
          ← Back to Home
        </Link>
      </div>

      {/* Audio Sound Players */}
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
