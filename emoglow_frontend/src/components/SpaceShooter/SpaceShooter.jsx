import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SpaceShooter.css";

// PUBLIC_INTERFACE
/**
 * SpaceShooter - A minimal dom/canvas hybrid Space Shooter game for React
 * - Keyboard controls: Arrow or WASD to move, Space/Touch to shoot
 * - Responsive (scalable canvas)
 * - Sound effects for shoot/explosion
 * - State: start screen, gameplay, game over, scoring
 * - Bullets, enemy spawn, movement, collision detection
 * - Animated feedback
 */
function SpaceShooter() {
  // Game states
  const [gameState, setGameState] = useState("start"); // start | playing | over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("ss_high_score")) || 0
  );
  const [lives, setLives] = useState(3);

  // Gameplay data (ref for non-reactive obj, to avoid rerenders during animation loop)
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const playerRef = useRef();
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const inputRef = useRef({ left: false, right: false, shoot: false });
  const lastShotRef = useRef(0);
  const touchStartX = useRef(null);

  // Sound refs
  const shootAudioRef = useRef();
  const explosionAudioRef = useRef();

  // Layout
  const [canvasDims, setCanvasDims] = useState({ width: 350, height: 540 });

  // Responsive resize
  useEffect(() => {
    function updateDims() {
      let w = Math.min(window.innerWidth, 420);
      let h = Math.max(390, Math.min(window.innerHeight - 140, 700));
      setCanvasDims({ width: w, height: h });
    }
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  // Init/reset game
  function startGame() {
    setScore(0);
    setLives(3);
    playerRef.current = {
      x: canvasDims.width / 2,
      y: canvasDims.height - 54,
      w: 44,
      h: 22,
      speed: 5.8,
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    inputRef.current = { left: false, right: false, shoot: false };
    setGameState("playing");
    requestAnimationFrame(gameLoop);
  }

  function endGame(finalScore) {
    setGameState("over");
    setHighScore((h) => {
      if (finalScore > h) {
        localStorage.setItem("ss_high_score", String(finalScore));
        return finalScore;
      }
      return h;
    });
    // Stop animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }

  // MAIN GAME LOOP
  function gameLoop(ts) {
    if (gameState !== "playing") return;
    const ctx = canvasRef.current.getContext("2d");
    const { width, height } = canvasDims;

    // Clear
    ctx.clearRect(0, 0, width, height);
    // Starfield bg (animated)
    drawStarfield(ctx, width, height, ts);

    // Move/Draw Player
    const player = playerRef.current;
    if (inputRef.current.left) player.x -= player.speed;
    if (inputRef.current.right) player.x += player.speed;
    player.x = Math.max(player.w / 2, Math.min(width - player.w / 2, player.x));
    drawPlayer(ctx, player);

    // Handle shooting
    if (
      inputRef.current.shoot &&
      ts - lastShotRef.current > 240 && // Shoot rate
      bulletsRef.current.length < 7
    ) {
      bulletsRef.current.push({
        x: player.x,
        y: player.y - player.h / 2,
        r: 5.5,
        vy: -9,
      });
      if (shootAudioRef.current) {
        shootAudioRef.current.currentTime = 0;
        shootAudioRef.current.play();
      }
      lastShotRef.current = ts;
    }

    // Update/Draw Bullets
    bulletsRef.current = bulletsRef.current.filter((b) => b.y > -12);
    for (let bullet of bulletsRef.current) {
      bullet.y += bullet.vy;
      drawBullet(ctx, bullet);
    }

    // Spawn Enemies
    maybeSpawnEnemy(ts, width);

    // Update/Draw Enemies
    enemiesRef.current = enemiesRef.current.filter((e) => !e.dead && e.y < height + 28);
    for (let enemy of enemiesRef.current) {
      enemy.y += enemy.vy;
      enemy.x += enemy.vx;
      drawEnemy(ctx, enemy, ts);

      // Player collision!
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
        setLives((v) => {
          const newLives = v - 1;
          if (newLives <= 0) endGame(score);
          else playExplosion();
          return newLives;
        });
      }
    }

    // Bullet/Enemy collision
    for (let bullet of bulletsRef.current) {
      for (let enemy of enemiesRef.current) {
        if (
          !enemy.dead &&
          circlesOverlap(bullet.x, bullet.y, bullet.r, enemy.x, enemy.y, enemy.r)
        ) {
          enemy.dead = true;
          bullet.y = -99; // Remove bullet off-screen efficiently
          setScore((s) => s + 1);
          playExplosion();
        }
      }
    }

    // Score + lives
    drawUI(ctx, score, highScore, lives, width, height);

    // Animate next frame
    animationRef.current = requestAnimationFrame(gameLoop);
  }

  // STARFIELD BACKGROUND
  const STAR_COUNT = 58;
  let starState = useRef([]);

  function drawStarfield(ctx, w, h, ts) {
    // (Initialize if needed)
    if (starState.current.length !== STAR_COUNT) {
      starState.current = [];
      for (let i = 0; i < STAR_COUNT; i++)
        starState.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speed: Math.random() * 0.9 + 0.8,
          r: Math.random() * 1.1 + 0.3,
        });
    }
    ctx.save();
    ctx.globalAlpha = 0.7;
    for (let s of starState.current) {
      s.y += s.speed;
      if (s.y > h) {
        s.y = 0;
        s.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
      ctx.fillStyle = "#b1eaff";
      ctx.shadowColor = "#43fcf7";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // PLAYER/SHIP RENDER
  function drawPlayer(ctx, player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    // Ship glow
    ctx.beginPath();
    ctx.ellipse(0, 0, player.w / 2 + 11, player.h / 2 + 7, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(66,255,245,0.11)";
    ctx.shadowColor = "#72fafe";
    ctx.shadowBlur = 21;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ship body
    ctx.beginPath();
    ctx.moveTo(0, -player.h / 2); // Nose
    ctx.lineTo(player.w / 2, player.h / 2);
    ctx.lineTo(0, player.h / 4);
    ctx.lineTo(-player.w / 2, player.h / 2);
    ctx.closePath();
    ctx.fillStyle = "#33e4e4";
    ctx.strokeStyle = "#f2adff";
    ctx.lineWidth = 1.7;
    ctx.fill();
    ctx.stroke();
    // Cockpit
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, 2 * Math.PI);
    ctx.fillStyle = "#e7e3fc";
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // BULLET RENDER
  function drawBullet(ctx, bullet) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, 2 * Math.PI);
    // Glow
    ctx.shadowColor = "#b2fff9";
    ctx.shadowBlur = 19;
    ctx.fillStyle = "#37fcec";
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r * 0.57, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.76;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ENEMY LOGIC/RENDER
  function maybeSpawnEnemy(ts, width) {
    // Spawn chance every ~900ms, avoid overcrowding
    if (
      enemiesRef.current.length < 4 &&
      ts % 900 < 15 &&
      Math.random() > 0.43
    ) {
      let x = Math.random() * (width - 50) + 25;
      let speed = Math.random() * 2.1 + 2.1;
      let sway = (Math.random() - 0.5) * 1.4;
      enemiesRef.current.push({
        x,
        y: -28,
        r: 18,
        vy: speed,
        vx: sway,
        pulseSeed: Math.random() * Math.PI * 2,
        dead: false,
        tsHit: 0,
      });
    }
  }

  function drawEnemy(ctx, enemy, ts) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // Animate pulse if hit
    let pulse =
      enemy.dead && enemy.tsHit !== 0
        ? 1 + Math.sin((ts - enemy.tsHit) / 50) * 0.13
        : 1;
    if (enemy.dead && enemy.tsHit === 0) enemy.tsHit = ts;

    // Glow
    ctx.beginPath();
    ctx.arc(0, 0, enemy.r * 1.24 * pulse, 0, 2 * Math.PI);
    ctx.fillStyle = enemy.dead ? "#eb77fa" : "#f6ff76";
    ctx.globalAlpha = enemy.dead ? 0.44 : 0.46;
    ctx.shadowColor = enemy.dead ? "#e192ff" : "#e9fc93";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, enemy.r * pulse, 0, 2 * Math.PI);
    ctx.fillStyle = enemy.dead ? "#eaa5fc" : "#f5d353";
    ctx.strokeStyle = enemy.dead ? "#820360" : "#767221";
    ctx.lineWidth = 3.3;
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.arc(-6.2, -3, 2.5, 0, 2 * Math.PI);
    ctx.arc(6.2, -3, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = enemy.dead ? "#fcfff8" : "#154836";
    ctx.fill();
    ctx.restore();
  }

  // UI/Overlay Render (score/lives)
  function drawUI(ctx, score, highScore, lives, width, height) {
    ctx.save();
    ctx.font = "bold 18px 'Inter', Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.globalAlpha = 0.97;
    ctx.fillText(`Score: ${score}`, 18, 28);
    ctx.font = "bold 16px 'Inter', Arial";
    ctx.fillStyle = "#b2faff";
    ctx.fillText(`High: ${highScore}`, 18, 50);

    // Draw hearts for lives
    for (let i = 0; i < lives; i++) {
      drawHeart(ctx, width - 80 + i * 25, 24, 12, "#fb7474");
    }
    ctx.restore();
  }
  function drawHeart(ctx, x, y, s, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s / 2, y - s / 2, x - s, y + s / 3, x, y + s);
    ctx.bezierCurveTo(x + s, y + s / 3, x + s / 2, y - s / 2, x, y);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.87;
    ctx.shadowColor = "#f9bfa3";
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // --- COLLISION HELPERS ---
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
      ax < bx + bw &&
      ax + aw > bx &&
      ay < by + bh &&
      ay + ah > by
    );
  }
  function circlesOverlap(ax, ay, ar, bx, by, br) {
    const dx = ax - bx,
      dy = ay - by;
    return dx * dx + dy * dy < (ar + br) * (ar + br);
  }

  // SOUND/CUES
  function playExplosion() {
    if (explosionAudioRef.current) {
      explosionAudioRef.current.currentTime = 0;
      explosionAudioRef.current.play();
    }
  }

  // KEYBOARD/CONTROL EVENTS
  useEffect(() => {
    if (gameState !== "playing") return;
    function down(e) {
      if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "A"
      )
        inputRef.current.left = true;
      if (
        e.key === "ArrowRight" ||
        e.key === "d" ||
        e.key === "D"
      )
        inputRef.current.right = true;
      if (e.key === " " || e.key === "Enter") inputRef.current.shoot = true;
    }
    function up(e) {
      if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "A"
      )
        inputRef.current.left = false;
      if (
        e.key === "ArrowRight" ||
        e.key === "d" ||
        e.key === "D"
      )
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

  // TOUCH CONTROLS
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
      touchStartX.current = e.touches[0].clientX;
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

  // Prevent scroll bounce on mobile when pressing canvas
  useEffect(() => {
    function preventScroll(e) {
      if (
        e.target === canvasRef.current &&
        ['touchmove', 'touchstart', 'touchend'].includes(e.type)
      ) {
        e.preventDefault();
      }
    }
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () =>
      window.removeEventListener("touchmove", preventScroll, { passive: false });
  }, []);

  // Game start on space/tap if on start/over screen
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

  // Click the canvas/tap to start/restart
  function handleCanvasClick() {
    if (gameState === "start" || gameState === "over") {
      startGame();
    }
  }

  // CSS glow/animations for game state overlays
  function TitleGlow({ children }) {
    return <div className="spaceshooter-title-glow">{children}</div>;
  }
  function GameButton({ children, onClick, primary }) {
    return (
      <button
        className={
          "spaceshooter-btn" + (primary ? " spaceshooter-btn-main" : "")
        }
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  // MAIN RENDER
  return (
    <div className="spaceshooter-root" style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
      {/* Overlays */}
      {(gameState === "start" || gameState === "over") && (
        <div className="spaceshooter-overlay">
          <TitleGlow>
            <h2>🚀 Space Shooter</h2>
          </TitleGlow>
          {gameState === "start" && (
            <>
              <div className="spaceshooter-tip">
                <kbd>←</kbd>/<kbd>→</kbd> or <kbd>A</kbd>/<kbd>D</kbd> to move<br />
                <kbd>Space</kbd> to shoot<br />
                <span className="spaceshooter-mobile-tip">
                  (Tap left/right to move &amp; shoot)
                </span>
              </div>
              <GameButton onClick={startGame} primary>
                Start Game
              </GameButton>
            </>
          )}
          {gameState === "over" && (
            <>
              <div className="spaceshooter-gamelabel">Game Over!</div>
              <div className="spaceshooter-finalscore">
                <span>Score: </span>
                <strong>{score}</strong>
                <span style={{ marginLeft: 12, color: "#77ffeb" }}>
                  High: {highScore}
                </span>
              </div>
              <GameButton onClick={startGame} primary>
                Play Again
              </GameButton>
            </>
          )}
        </div>
      )}
      <canvas
        tabIndex={-1}
        ref={canvasRef}
        width={canvasDims.width}
        height={canvasDims.height}
        className={`spaceshooter-canvas${
          gameState !== "playing" ? " spaceshooter-canvas-blur" : ""
        }`}
        style={{
          width: "100%",
          maxWidth: 480,
          height: "auto",
          boxShadow: "0 4px 35px #52e4fa22, 0 1.5px 22px 0 #33f8e214",
          borderRadius: 20,
          outline: "none",
        }}
        onClick={handleCanvasClick}
        aria-label="Space Shooter Game Area"
      />
      <audio
        ref={shootAudioRef}
        src="/assets/sounds/laser.wav"
        preload="auto"
        style={{ display: "none" }}
      />
      <audio
        ref={explosionAudioRef}
        src="/assets/sounds/explosion.wav"
        preload="auto"
        style={{ display: "none" }}
      />
      <div>
        <Link className="spaceshooter-back-link" to="/" tabIndex={gameState === "playing" ? -1 : 0}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default SpaceShooter;
