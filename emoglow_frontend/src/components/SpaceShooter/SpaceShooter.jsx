import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./SpaceShooter.css";

/**
 * SpaceShooter: A minimal shooting game.
 * - Ship at bottom: left/right keys/touch/buttons
 * - Shoot bullets with SPACE/tap
 * - Random falling enemies
 * - Bullet/enemy collision
 * - Ship/enemy collision (game over)
 * - Score UI (top)
 * - Only black, white, orange: #111, #fff, #ff9800
 * - Fully responsive for desktop & mobile
 */
// PUBLIC_INTERFACE
function SpaceShooter() {
  // --- GAME STATE ---
  const [gameState, setGameState] = useState("start"); // start | playing | over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    Number(localStorage.getItem("ss_high_score")) || 0
  );
  const [canvasDims, setCanvasDims] = useState({ width: 370, height: 560 });

  // --- REFS (no rerender) ---
  const canvasRef = useRef();
  const animationRef = useRef();
  const playerRef = useRef();
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const inputRef = useRef({ left: false, right: false, shoot: false });
  const lastShotRef = useRef(0);

  // Touch controls
  const touchStartRef = useRef(null);
  const touchLeftRef = useRef(false);
  const touchRightRef = useRef(false);

  // --- RESPONSIVE CANVAS ---
  useEffect(() => {
    function resize() {
      const w = Math.min(420, window.innerWidth - 24);
      const h = Math.max(350, Math.min(window.innerHeight - 160, 640));
      setCanvasDims({ width: w, height: h });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // --- GAME INITIALIZATION & RESET ---
  function startGame() {
    setScore(0);
    playerRef.current = {
      x: canvasDims.width / 2,
      y: canvasDims.height - 46,
      w: 44,
      h: 20,
      speed: 7,
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    inputRef.current = { left: false, right: false, shoot: false };
    setGameState("playing");
    animationRef.current = requestAnimationFrame(gameLoop);
  }

  function gameOver(finalScore) {
    setGameState("over");
    setHighScore((prev) => {
      if (finalScore > prev) {
        localStorage.setItem("ss_high_score", String(finalScore));
        return finalScore;
      }
      return prev;
    });
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }

  // --- MAIN GAME LOOP ---
  function gameLoop(ts) {
    if (gameState !== "playing") return;
    const ctx = canvasRef.current.getContext("2d");
    const { width, height } = canvasDims;
    // ========== LOGIC ==========
    // clear
    ctx.clearRect(0, 0, width, height);
    drawBG(ctx, width, height);

    // Player move input
    const player = playerRef.current;
    if (inputRef.current.left) player.x -= player.speed;
    if (inputRef.current.right) player.x += player.speed;
    player.x = Math.max(player.w / 2, Math.min(width - player.w / 2, player.x));
    drawPlayer(ctx, player);

    // Bullets: shoot
    if (
      inputRef.current.shoot &&
      ts - lastShotRef.current > 222 &&
      bulletsRef.current.length < 8
    ) {
      bulletsRef.current.push({
        x: player.x,
        y: player.y - player.h / 2,
        r: 6.5,
        vy: -9,
      });
      lastShotRef.current = ts;
    }
    // Bullets: update, draw, filter
    bulletsRef.current = bulletsRef.current.filter((b) => b.y > -13);
    for (let bullet of bulletsRef.current) {
      bullet.y += bullet.vy;
      drawBullet(ctx, bullet);
    }

    // Enemies: spawn
    maybeSpawnEnemy(ts, width);
    // Enemies: move, draw, filter
    enemiesRef.current = enemiesRef.current.filter((e) => !e.dead && e.y < height + 30);
    for (let enemy of enemiesRef.current) {
      enemy.y += enemy.vy;
      enemy.x += enemy.vx;
      drawEnemy(ctx, enemy, ts);

      // Collision with ship: end game
      if (
        !enemy.dead &&
        rectsOverlap(
          enemy.x - enemy.r,
          enemy.y - enemy.r,
          enemy.r * 2,
          enemy.r * 2,
          player.x - player.w / 2,
          player.y - player.h / 2,
          player.w,
          player.h
        )
      ) {
        enemy.dead = true;
        setTimeout(() => gameOver(score), 80);
        return;
      }
    }

    // Bullets collide with enemies
    for (let bullet of bulletsRef.current) {
      for (let enemy of enemiesRef.current) {
        if (
          !enemy.dead &&
          circlesOverlap(bullet.x, bullet.y, bullet.r, enemy.x, enemy.y, enemy.r)
        ) {
          enemy.dead = true;
          bullet.y = -91; // remove bullet
          setScore((s) => s + 1);
        }
      }
    }

    // Score UI
    drawScoreUI(ctx, score, highScore, width);

    // Next frame
    animationRef.current = requestAnimationFrame(gameLoop);
  }

  // --- BACKGROUND, SHIP, BULLET, ENEMY, SCORE UI ---
  function drawBG(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, w, h);
    // Sparse white/orange dots
    for (let i = 0; i < 38; i++) {
      ctx.beginPath();
      const col = i % 4 === 0 ? "#ff9800" : "#fff";
      ctx.arc(
        ((i * 41.36 + w / 3) % w) + (i % 2) * 12,
        ((i * 97.8 + h / 7) % h),
        Math.random() * (col === "#fff" ? 1.2 : 1.6) + 0.7,
        0,
        2 * Math.PI
      );
      ctx.globalAlpha = col === "#fff" ? 0.33 : 0.15 + Math.random() * 0.15;
      ctx.fillStyle = col;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawPlayer(ctx, player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    // Body (white + orange outline)
    ctx.beginPath();
    ctx.moveTo(0, -player.h / 2);
    ctx.lineTo(player.w / 2, player.h / 2);
    ctx.lineTo(0, player.h / 5);
    ctx.lineTo(-player.w / 2, player.h / 2);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    // Cabin highlight
    ctx.beginPath();
    ctx.arc(0, 0, 6.6, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff9800";
    ctx.globalAlpha = 0.46;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawBullet(ctx, bullet) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff9800";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 7;
    ctx.globalAlpha = 0.89;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function maybeSpawnEnemy(ts, width) {
    // Spawn one at a random interval, random speed
    if (
      enemiesRef.current.length < 5 &&
      ts % 865 < 14 &&
      Math.random() > 0.41
    ) {
      let x = Math.random() * (width - 42) + 21;
      let speed = Math.random() * 1.7 + 2.5;
      let sway = (Math.random() - 0.5) * 1.0;
      enemiesRef.current.push({
        x,
        y: -30,
        r: 20,
        vy: speed,
        vx: sway,
        dead: false,
      });
    }
  }

  function drawEnemy(ctx, enemy, ts) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    // Outer (orange) glow if dead
    if (enemy.dead) {
      ctx.beginPath();
      ctx.arc(0, 0, enemy.r * 1.2, 0, 2 * Math.PI);
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#ff9800";
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    // Enemy: white circle, orange ring
    ctx.beginPath();
    ctx.arc(0, 0, enemy.r, 0, 2 * Math.PI);
    ctx.fillStyle = enemy.dead ? "#fff" : "#fff";
    ctx.globalAlpha = enemy.dead ? 0.6 : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ff9800";
    ctx.stroke();
    // Eyes: orange "angry" eyes when alive, closed when dead
    ctx.strokeStyle = "#ff9800";
    if (!enemy.dead) {
      ctx.beginPath();
      ctx.arc(-8, -4, 3, Math.PI * 1.12, Math.PI * 2 - 0.12);
      ctx.arc(8, -4, 3, Math.PI * 1.12, Math.PI * 2 - 0.12);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = "#ff9800";
      ctx.stroke();
    } else {
      // Dead: X eyes
      ctx.save();
      ctx.rotate(-0.13 + 0.08 * Math.sin(ts / 180));
      for (let dx of [-7, 7]) {
        ctx.beginPath();
        ctx.moveTo(dx - 2, -6);
        ctx.lineTo(dx + 2, -2);
        ctx.moveTo(dx + 2, -6);
        ctx.lineTo(dx - 2, -2);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "#ff9800";
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawScoreUI(ctx, score, highScore, width) {
    ctx.save();
    ctx.font = "bold 18px Inter, Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.globalAlpha = 0.95;
    ctx.fillText(`Score: `, 19, 30);
    ctx.fillStyle = "#ff9800";
    ctx.fillText(String(score), 75, 30);
    ctx.font = "bold 16px Inter, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Best: ${highScore}`, width - 116, 30);
    ctx.restore();
  }

  // --- COLLISION HELPERS ---
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }
  function circlesOverlap(ax, ay, ar, bx, by, br) {
    let dx = ax - bx,
      dy = ay - by;
    return dx * dx + dy * dy < (ar + br) * (ar + br);
  }

  // --- KEYBOARD CONTROLS (LEFT/RIGHT/SPACE) ---
  useEffect(() => {
    if (gameState !== "playing") return;

    function down(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        inputRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        inputRef.current.right = true;
      if (e.key === " " || e.key === "Enter") inputRef.current.shoot = true;
    }
    function up(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        inputRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        inputRef.current.right = false;
      if (e.key === " " || e.key === "Enter") inputRef.current.shoot = false;
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line
  }, [gameState]);

  // --- TOUCH CONTROLS ---
  useEffect(() => {
    if (gameState !== "playing") return;
    function onTouchStart(e) {
      if (!canvasRef.current) return;
      for (let t of e.touches) {
        let rect = canvasRef.current.getBoundingClientRect();
        let x = t.clientX - rect.left;
        if (x < canvasDims.width / 2) inputRef.current.left = true;
        else inputRef.current.right = true;
      }
      inputRef.current.shoot = true;
    }
    function onTouchEnd() {
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.shoot = false;
    }
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line
  }, [gameState, canvasDims.width]);

  // --- Prevent passive scroll when playing on mobile ---
  useEffect(() => {
    function preventScroll(e) {
      if (
        e.target === canvasRef.current &&
        ["touchmove", "touchstart", "touchend"].includes(e.type)
      ) {
        e.preventDefault();
      }
    }
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () =>
      window.removeEventListener("touchmove", preventScroll, { passive: false });
  }, []);

  // --- Space, Enter, tap = start/restart, if not playing ---
  useEffect(() => {
    function handler(e) {
      if (
        (e.key === " " || e.key === "Enter") &&
        (gameState === "start" || gameState === "over")
      ) {
        startGame();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [gameState, canvasDims.width, canvasDims.height]);

  // --- Canvas tap/click to begin ---
  function handleCanvasClick() {
    if (gameState === "start" || gameState === "over") {
      startGame();
    }
  }

  // --- ON-SCREEN BUTTONS (for mobile/small) ---
  function OnScreenButtons() {
    // Show only for mobile or very small screens (width < 500)
    if (window.innerWidth > 600) return null;
    return (
      <div
        style={{
          display: "flex",
          gap: 18,
          justifyContent: "center",
          marginTop: 10,
        }}
        aria-label="Mobile controls"
      >
        <button
          className="spaceshooter-btn"
          style={{
            fontSize: 22,
            background: "#111",
            color: "#fff",
            border: "2px solid #ff9800",
            width: 53,
          }}
          tabIndex={gameState === "playing" ? 0 : -1}
          aria-label="Move Left"
          onPointerDown={() => (inputRef.current.left = true)}
          onPointerUp={() => (inputRef.current.left = false)}
          onPointerLeave={() => (inputRef.current.left = false)}
        >
          ←
        </button>
        <button
          className="spaceshooter-btn"
          style={{
            fontSize: 22,
            background: "#ff9800",
            color: "#111",
            width: 53,
            border: "2px solid #ff9800",
            fontWeight: "bold",
          }}
          tabIndex={gameState === "playing" ? 0 : -1}
          aria-label="Shoot"
          onPointerDown={() => (inputRef.current.shoot = true)}
          onPointerUp={() => (inputRef.current.shoot = false)}
          onPointerLeave={() => (inputRef.current.shoot = false)}
        >
          ⦿
        </button>
        <button
          className="spaceshooter-btn"
          style={{
            fontSize: 22,
            background: "#111",
            color: "#fff",
            border: "2px solid #ff9800",
            width: 53,
          }}
          tabIndex={gameState === "playing" ? 0 : -1}
          aria-label="Move Right"
          onPointerDown={() => (inputRef.current.right = true)}
          onPointerUp={() => (inputRef.current.right = false)}
          onPointerLeave={() => (inputRef.current.right = false)}
        >
          →
        </button>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div
      className="spaceshooter-root"
      style={{
        maxWidth: 500,
        margin: "0 auto",
        paddingBottom: 40,
        background: "#111",
        color: "#fff",
      }}
    >
      {/* Overlay for start/game over */}
      {(gameState === "start" || gameState === "over") && (
        <div className="spaceshooter-overlay" style={{ background: "#111" }}>
          <div
            style={{
              fontWeight: 700,
              color: "#ff9800",
              fontSize: 32,
              marginBottom: 4,
            }}
          >
            🚀 Space Shooter
          </div>
          {gameState === "start" && (
            <>
              <div
                style={{
                  color: "#fff",
                  marginBottom: 24,
                  fontSize: "1.13rem",
                  lineHeight: 1.41,
                }}
              >
                <kbd
                  style={{
                    background: "#ff9800",
                    color: "#111",
                    borderRadius: 6,
                    border: "1.2px solid #ff9800",
                    padding: "0 7px",
                    fontWeight: 600,
                  }}
                >
                  ←
                </kbd>
                /
                <kbd
                  style={{
                    background: "#ff9800",
                    color: "#111",
                    borderRadius: 6,
                    border: "1.2px solid #ff9800",
                    padding: "0 7px",
                    fontWeight: 600,
                  }}
                >
                  →
                </kbd>{" "}
                to move <br />
                <kbd
                  style={{
                    background: "none",
                    color: "#ff9800",
                    border: "1.1px solid #ff9800",
                    padding: "0 9px",
                    borderRadius: 6,
                  }}
                >
                  SPACE
                </kbd>{" "}
                to shoot <br />
                <span style={{ color: "#ff9800", fontSize: 15 }}>
                  (Tap or use buttons on mobile)
                </span>
              </div>
              <button
                className="spaceshooter-btn spaceshooter-btn-main"
                style={{
                  background: "#ff9800",
                  color: "#111",
                  border: "none",
                  fontWeight: 700,
                }}
                onClick={startGame}
                autoFocus
              >
                Start Game
              </button>
            </>
          )}
          {gameState === "over" && (
            <>
              <div
                style={{
                  fontSize: 23,
                  color: "#fff",
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                GAME OVER!
              </div>
              <div
                style={{
                  marginBottom: 19,
                  color: "#ff9800",
                  fontSize: "1.13rem",
                  fontWeight: 500,
                }}
              >
                Score: <b style={{ color: "#fff" }}>{score}</b>
                <span style={{ marginLeft: 16, color: "#fff" }}>
                  Best: {highScore}
                </span>
              </div>
              <button
                className="spaceshooter-btn spaceshooter-btn-main"
                style={{
                  background: "#ff9800",
                  color: "#111",
                  border: "none",
                  fontWeight: 700,
                }}
                onClick={startGame}
              >
                Play Again
              </button>
            </>
          )}
        </div>
      )}
      <canvas
        tabIndex={-1}
        ref={canvasRef}
        width={canvasDims.width}
        height={canvasDims.height}
        className={`spaceshooter-canvas${gameState !== "playing" ? " spaceshooter-canvas-blur" : ""}`}
        style={{
          width: "92vw",
          maxWidth: 420,
          height: canvasDims.height,
          boxShadow: "0 4px 18px #ff980024, 0 1.5px 11px 0 #fff2",
          borderRadius: 16,
          outline: "none",
          border: "2px solid #ff9800",
          background: "#111",
          display: "block",
        }}
        onClick={handleCanvasClick}
        aria-label="Space Shooter Game Area"
      />
      {gameState === "playing" && (
        <OnScreenButtons />
      )}
      <div>
        <Link
          className="spaceshooter-back-link"
          style={{
            color: "#ff9800",
            background: "none",
            fontWeight: 600,
            fontSize: "1.09em",
            borderRadius: 7,
          }}
          to="/"
          tabIndex={gameState === "playing" ? -1 : 0}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default SpaceShooter;
