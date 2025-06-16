import React, { useState, useEffect, useRef } from "react";
import "./Minesweeper.css";
import { Link } from "react-router-dom";

// --- Game Config Presets (Easy, Medium, Hard) ---
const PRESETS = [
  { label: "Easy", rows: 8, cols: 8, mines: 10 },
  { label: "Medium", rows: 12, cols: 18, mines: 36 },
  { label: "Hard", rows: 16, cols: 30, mines: 99 }
];

// Emojis for face button states
const FACE = {
  normal: "🙂",
  pressed: "😮",
  win: "😎",
  lose: "💀"
};

/**
 * Initialize a new grid.
 */
function initGrid(rows, cols, mines, firstClick) {
  // Prepare grid (remains entirely covered for now)
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r,
      c,
      isMine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
      exploded: false,
    }))
  );
  // Place mines
  let placed = 0;
  const forbidden = new Set();
  if (firstClick) {
    // First click protection area (no mine at first cell or its neighbors)
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = firstClick.r + dr, nc = firstClick.c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
          forbidden.add(nr + "," + nc);
      }
  }
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!grid[r][c].isMine && !forbidden.has(`${r},${c}`)) {
      grid[r][c].isMine = true;
      placed++;
    }
  }
  // Calculate adjacent mine counts
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nr = r + dr, nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            grid[nr][nc].isMine
          )
            count++;
        }
      grid[r][c].adjacent = count;
    }
  return grid;
}

/**
 * Deep clones a grid.
 */
function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * Reveals a cell (and floods out adjacent empties).
 */
function revealGrid(grid, row, col) {
  const rows = grid.length, cols = grid[0].length;
  const queue = [[row, col]];
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  while (queue.length) {
    const [r, c] = queue.pop();
    if (
      r < 0 ||
      r >= rows ||
      c < 0 ||
      c >= cols ||
      seen[r][c] ||
      grid[r][c].flagged ||
      grid[r][c].revealed
    )
      continue;
    grid[r][c].revealed = true;
    seen[r][c] = true;
    if (grid[r][c].adjacent === 0 && !grid[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr || dc) queue.push([r + dr, c + dc]);
    }
  }
  return grid;
}

/**
 * Format time as m:ss
 */
function formatTime(secs) {
  if (secs === 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// PUBLIC_INTERFACE
function Minesweeper() {
  // Core state
  const [presetIdx, setPresetIdx] = useState(0);
  const { rows, cols, mines } = PRESETS[presetIdx];
  const [grid, setGrid] = useState(() => initGrid(rows, cols, mines));
  const [mineCount, setMineCount] = useState(mines);
  const [firstClick, setFirstClick] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing"); // playing|win|lose
  const [face, setFace] = useState(FACE.normal);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Accessibility: which cell is focused (for keyboard navigation)
  const gridRef = useRef(null);

  // Start & stop timer
  useEffect(() => {
    if (!firstClick || gameStatus !== "playing") {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [firstClick, gameStatus]);

  // Reset when difficulty changes
  useEffect(() => {
    setGrid(initGrid(rows, cols, mines));
    setMineCount(mines);
    setFirstClick(false);
    setGameStatus("playing");
    setFace(FACE.normal);
    setTimer(0);
    clearInterval(timerRef.current);
  }, [presetIdx]);

  // Keyboard navigation
  useEffect(() => {
    const keyDown = (e) => {
      if (
        gridRef.current &&
        document.activeElement === gridRef.current &&
        gameStatus === "playing"
      ) {
        let { r, c } = gridRef.current.dataset;
        r = Number(r);
        c = Number(c);
        if (["ArrowUp", "w", "W"].includes(e.key) && r > 0) gridRef.current = focusCell(r - 1, c);
        else if (["ArrowDown", "s", "S"].includes(e.key) && r < rows - 1) gridRef.current = focusCell(r + 1, c);
        else if (["ArrowLeft", "a", "A"].includes(e.key) && c > 0) gridRef.current = focusCell(r, c - 1);
        else if (["ArrowRight", "d", "D"].includes(e.key) && c < cols - 1) gridRef.current = focusCell(r, c + 1);
        else if ([" "].includes(e.key)) handleCellClick(r, c);
        else if (e.key.toLowerCase() === "f") handleRightClick(r, c);
        else if (["Enter"].includes(e.key)) handleCellClick(r, c);
      }
    };
    document.addEventListener("keydown", keyDown);
    return () => document.removeEventListener("keydown", keyDown);
    // eslint-disable-next-line
  }, [grid, gameStatus, rows, cols]);
  function focusCell(r, c) {
    const btn = document.getElementById(`ms-cell-${r}-${c}`);
    if (btn) btn.focus();
    return btn;
  }

  /**
   * Handle left click. If first, make sure mine never at this cell or neighbors.
   */
  function handleCellClick(row, col) {
    if (gameStatus !== "playing") return;
    setFace(FACE.pressed);
    if (!firstClick) {
      const newGrid = initGrid(rows, cols, mines, { r: row, c: col });
      const afterReveal = cloneGrid(newGrid);
      revealGrid(afterReveal, row, col);
      setFirstClick(true);
      setGrid(afterReveal);
      setFace(FACE.normal);
      return;
    }
    const cell = grid[row][col];
    if (cell.revealed || cell.flagged) return;
    const newGrid = cloneGrid(grid);

    // Hit mine: lose!
    if (cell.isMine) {
      newGrid[row][col].revealed = true;
      newGrid[row][col].exploded = true;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (newGrid[r][c].isMine) newGrid[r][c].revealed = true;
      setGrid(newGrid);
      setFace(FACE.lose);
      setGameStatus("lose");
      clearInterval(timerRef.current);
      return;
    }
    // Reveal normal cell (flood – auto-blank region)
    revealGrid(newGrid, row, col);

    // Check win
    let win = false;
    if (
      newGrid.flat().filter((c) => !c.isMine && c.revealed).length ===
      rows * cols - mines
    ) {
      win = true;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (newGrid[r][c].isMine) newGrid[r][c].flagged = true;
      setFace(FACE.win);
      setGameStatus("win");
      clearInterval(timerRef.current);
    } else {
      setFace(FACE.normal);
    }
    setGrid(newGrid);
    if (!win) setGameStatus("playing");
  }

  /**
   * Handle right click (flag/unflag).
   */
  function handleRightClick(row, col, e) {
    if (e) e.preventDefault();
    if (gameStatus !== "playing" || !firstClick) return;
    const newGrid = cloneGrid(grid);
    const cell = newGrid[row][col];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    setMineCount(
      mines - newGrid.flat().filter((c) => c.flagged).length
    );
    setGrid(newGrid);
  }

  // Face button/restart
  function restartGame() {
    setGrid(initGrid(rows, cols, mines));
    setMineCount(mines);
    setFirstClick(false);
    setGameStatus("playing");
    setFace(FACE.normal);
    setTimer(0);
    clearInterval(timerRef.current);
    if (gridRef.current) gridRef.current.blur();
  }

  // Track focused cell for accessibility
  function handleFocus(e, r, c) {
    gridRef.current = e.target;
    e.target.dataset.r = r;
    e.target.dataset.c = c;
  }

  // Accessibility: Labels for screen readers
  function cellLabel(cell) {
    if (cell.revealed && cell.isMine)
      return cell.exploded
        ? "Exploded mine"
        : "Revealed mine";
    if (cell.revealed)
      return cell.adjacent > 0
        ? cell.adjacent + " adjacent mine" + (cell.adjacent > 1 ? "s" : "")
        : "Empty";
    if (cell.flagged) return "Flagged";
    return "Hidden";
  }

  // Render the board grid
  function renderBoard() {
    return (
      <div
        className="ms-board"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        }}
        role="grid"
        aria-label="Minesweeper board"
        tabIndex={-1}
      >
        {grid.map((rowArr, r) =>
          rowArr.map((cell, c) => (
            <button
              id={`ms-cell-${r}-${c}`}
              key={`cell-${r}-${c}`}
              className={
                "ms-cell" +
                (cell.revealed
                  ? cell.isMine
                    ? cell.exploded
                      ? " ms-cell-exploded"
                      : " ms-cell-mine"
                    : " ms-cell-revealed"
                  : "") +
                (cell.flagged ? " ms-cell-flagged" : "") +
                (!cell.revealed && !cell.flagged ? " ms-cell-covered" : "")
              }
              tabIndex={0}
              aria-label={cellLabel(cell) + ` at row ${r + 1} col ${c + 1}`}
              aria-pressed={cell.revealed}
              data-row={r}
              data-col={c}
              data-mine={cell.isMine}
              data-flag={cell.flagged}
              data-adjacent={cell.adjacent}
              onClick={(e) => handleCellClick(r, c)}
              onContextMenu={(e) => handleRightClick(r, c, e)}
              onKeyDown={(e) => {
                if (["f", "F"].includes(e.key)) {
                  handleRightClick(r, c, e);
                } else if (
                  [" ", "Enter"].includes(e.key) &&
                  !cell.revealed
                ) {
                  handleCellClick(r, c);
                }
              }}
              onFocus={(e) => handleFocus(e, r, c)}
              disabled={gameStatus !== "playing" && !cell.revealed}
            >
              {/* Value or symbol */}
              {cell.revealed ? (
                cell.isMine ? (
                  cell.exploded ? (
                    <span aria-label="Mine exploded" className="ms-mine">💥</span>
                  ) : (
                    <span aria-label="Mine" className="ms-mine">💣</span>
                  )
                ) : cell.adjacent > 0 ? (
                  <span
                    className={`ms-num ms-num-${cell.adjacent}`}
                    aria-label={`Number ${cell.adjacent}`}
                  >
                    {cell.adjacent}
                  </span>
                ) : null
              ) : cell.flagged ? (
                <span aria-label="Flag" className="ms-flag">🚩</span>
              ) : null}
            </button>
          ))
        )}
      </div>
    );
  }

  // Scoreboard, face button, timer
  function renderHeader() {
    return (
      <div className="ms-head">
        <div className="ms-head-section ms-head-mines" aria-label="Mines left">
          <span className="ms-head-label">Mines</span>
          <span className="ms-head-value" aria-live="polite">
            {Math.max(mineCount, 0)}
          </span>
        </div>
        <button
          className="ms-face"
          aria-label={
            gameStatus === "playing"
              ? "Restart game"
              : "Restart game (previously " +
                (gameStatus === "win" ? "won" : "lost") + ")"
          }
          onClick={restartGame}
          tabIndex={0}
        >
          {face}
        </button>
        <div className="ms-head-section ms-head-timer" aria-label="Elapsed time">
          <span className="ms-head-label">Time</span>
          <span className="ms-head-value" aria-live="polite">
            {formatTime(timer)}
          </span>
        </div>
      </div>
    );
  }

  // Difficulty mode dropdown
  function renderPresetSelect() {
    return (
      <div className="ms-preset">
        <label htmlFor="ms-preset-select" className="ms-preset-label">
          Difficulty:
        </label>
        <select
          id="ms-preset-select"
          value={presetIdx}
          className="ms-preset-select"
          onChange={(e) => setPresetIdx(Number(e.target.value))}
          disabled={firstClick}
        >
          {PRESETS.map((preset, idx) => (
            <option key={preset.label} value={idx}>
              {preset.label} ({preset.rows}x{preset.cols}, {preset.mines} mines)
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Result banner for win/lose
  function renderResult() {
    if (gameStatus === "win")
      return (
        <div className="ms-result ms-win">
          <span role="img" aria-label="You win!" className="ms-result-emoji">
            🎉
          </span>
          You win!
        </div>
      );
    if (gameStatus === "lose")
      return (
        <div className="ms-result ms-lose">
          <span role="img" aria-label="Game over" className="ms-result-emoji">
            💥
          </span>
          Game over!
        </div>
      );
    return null;
  }

  return (
    <div className="minesweeper-root">
      <h2 className="ms-title">Minesweeper</h2>
      {renderPresetSelect()}
      <div className="ms-game-area">
        {renderHeader()}
        {renderBoard()}
        {renderResult()}
      </div>
      <div className="ms-instructions">
        <strong>How to play:</strong> Uncover all the safe cells without hitting a mine.<br />
        <span role="img" aria-label="flag">🚩</span> Flag suspected mines with right-click or F key.<br />
        <kbd>Tab</kbd> + <kbd>Arrows</kbd> to navigate board, <kbd>Space</kbd>/<kbd>Enter</kbd> to reveal, <kbd>F</kbd> to flag.<br />
        Press face button to restart.
      </div>
      <Link className="ms-back-link" to="/" style={{ marginTop: "1.7rem" }}>
        ← Back to Home
      </Link>
    </div>
  );
}

export default Minesweeper;
