// ...existing code...
// ...existing code...
import React, { useEffect, useRef, useState } from "react";

export const BreakoutGame: React.FC = () => {
  // ...existing UI constants...
  const CANVAS_W = 800;
  const CANVAS_H = 600;
  const PADDLE_W_DEFAULT = 100;
  const PADDLE_H = 15;
  const BALL_R = 12;
  const INIT_BALL_SPEED = 5;
  const MAX_BALL_SPEED = 8;
  const ROWS = 6;
  const COLS = 10;
  const BRICK_GAP = 2;
  const BRICK_TOP_OFFSET = 50;
  const BRICK_H = 25;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  // Add refs for game logic
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const highScoreRef = useRef(parseInt(localStorage.getItem('breakoutHighScore') || '0'));

  const paddleRef = useRef({ x: (CANVAS_W - PADDLE_W_DEFAULT) / 2, w: PADDLE_W_DEFAULT });
  const ballRef = useRef({ x: CANVAS_W / 2, y: CANVAS_H - 80, vx: INIT_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1), vy: -INIT_BALL_SPEED });
  const bricksRef = useRef<any[]>([]);

  function buildBricks() {
    const paddingX = 20;
    const usableW = CANVAS_W - paddingX * 2;
    const bw = Math.floor((usableW - (COLS - 1) * BRICK_GAP) / COLS);
    const bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = paddingX + c * (bw + BRICK_GAP);
        const y = BRICK_TOP_OFFSET + r * (BRICK_H + BRICK_GAP);
        bricks.push({ x, y, w: bw, h: BRICK_H, alive: true, points: (ROWS - r) * 10 });
      }
    }
    bricksRef.current = bricks;
  }

  function resetBall(centerOnPaddle = true) {
    const p = paddleRef.current;
    const x = centerOnPaddle ? p.x + p.w / 2 : CANVAS_W / 2;
    ballRef.current = {
      x,
      y: CANVAS_H - 80,
      vx: INIT_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      vy: -INIT_BALL_SPEED,
    };
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === " " || e.code === "Space") e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function startGame() {
    if (!running) {
      setRunning(true);
    }
  }

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  function pauseGame() {
    setRunning(false);
    cancelAnimationFrame(rafRef.current);
  }

  function resetGame(resetLevel = true) {
    pauseGame();
    scoreRef.current = 0;
    livesRef.current = 3;
    if (resetLevel) {
      levelRef.current = 1;
      setLevel(1);
    }
    setScore(0);
    setLives(3);
    paddleRef.current = { x: (CANVAS_W - PADDLE_W_DEFAULT) / 2, w: PADDLE_W_DEFAULT };
    buildBricks();
    resetBall();
    setGameOver(false);
    setRunning(false);
  }

  useEffect(() => {
    buildBricks();
    resetBall();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loop = () => {
    update();
    draw();
    if (running) rafRef.current = requestAnimationFrame(loop);
  };

  // Space bar start/pause
  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!running && !gameOver) startGame();
        else if (running) pauseGame();
        else if (gameOver) {
          setGameOver(false);
          livesRef.current = 3;
          setLives(3);
          resetBall();
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [running, gameOver]);

  // Sync refs to state for UI
  useEffect(() => {
    setScore(scoreRef.current);
    setLives(livesRef.current);
    setLevel(levelRef.current);
  }, [scoreRef.current, livesRef.current, levelRef.current]);

  // Update highscore
  useEffect(() => {
    if (scoreRef.current > highScoreRef.current) {
      highScoreRef.current = scoreRef.current;
      localStorage.setItem('breakoutHighScore', String(scoreRef.current));
    }
  }, [scoreRef.current]);

  function update() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const speed = 8;
    const p = paddleRef.current;
    if (keysRef.current["arrowleft"] || keysRef.current["a"]) p.x -= speed;
    if (keysRef.current["arrowright"] || keysRef.current["d"]) p.x += speed;
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > CANVAS_W) p.x = CANVAS_W - p.w;
    // Use refs for game logic
    const b = ballRef.current;
    b.x += b.vx;
    b.y += b.vy;
    if (b.x - BALL_R < 0) { b.x = BALL_R; b.vx *= -1; }
    if (b.x + BALL_R > CANVAS_W) { b.x = CANVAS_W - BALL_R; b.vx *= -1; }
    if (b.y - BALL_R < 0) { b.y = BALL_R; b.vy *= -1; }
    if (b.y - BALL_R > CANVAS_H) {
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        setGameOver(true);
        pauseGame();
      } else {
        resetBall();
        draw();
      }
      return;
    }
    if (
      b.x + BALL_R > p.x &&
      b.x - BALL_R < p.x + p.w &&
      b.y + BALL_R > CANVAS_H - 40 &&
      b.y - BALL_R < CANVAS_H - 40 + PADDLE_H
    ) {
      b.vy = -Math.abs(b.vy);
      const hitPos = (b.x - (p.x + p.w / 2)) / (p.w / 2);
      b.vx = clamp(b.vx + hitPos * 2, -MAX_BALL_SPEED, MAX_BALL_SPEED);
      b.y = CANVAS_H - 40 - BALL_R - 0.5;
    }
    const bricks = bricksRef.current;
    for (let i = 0; i < bricks.length; i++) {
      const br = bricks[i];
      if (!br.alive) continue;
      if (rectCircleOverlap(br.x, br.y, br.w, br.h, b.x, b.y, BALL_R)) {
        br.alive = false;
        b.vy *= -1;
        const mag = Math.hypot(b.vx, b.vy);
        const scale = Math.min(MAX_BALL_SPEED / mag, 1.08);
        b.vx *= scale; b.vy *= scale;
        scoreRef.current += br.points;
        setScore(scoreRef.current);
        break;
      }
    }
    if (bricks.every((br) => !br.alive)) {
      levelRef.current += 1;
      setLevel(levelRef.current);
      paddleRef.current.w = Math.max(60, paddleRef.current.w - 8);
      const speedUp = Math.min(MAX_BALL_SPEED, Math.abs(b.vx) + 0.6);
      const dirX = Math.sign(b.vx) || 1;
      const dirY = -1;
      buildBricks();
      ballRef.current = { x: CANVAS_W / 2, y: CANVAS_H - 80, vx: dirX * speedUp, vy: dirY * Math.max(INIT_BALL_SPEED, Math.abs(b.vy) + 0.6) };
    }
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // ...removed duplicate score/lives/level/high score display...
    // Soft, neutral brick colors for eye comfort
    for (const br of bricksRef.current) {
      if (!br.alive) continue;
      const rowIdx = Math.floor((br.y - BRICK_TOP_OFFSET) / (BRICK_H + BRICK_GAP));
      const colors = [
        '#1648b3ff', // light blue
        '#51b454ff', // light green
        '#ec7a0eff', // light orange
        '#9068dbff', // light purple
        '#921212ff', // light gray
        '#bdae2cff'  // pale yellow
      ];
      ctx.fillStyle = colors[rowIdx % colors.length];
      ctx.fillRect(br.x, br.y, br.w, br.h);
    }
    const p = paddleRef.current;
    ctx.fillStyle = "#93c5fd";
    const paddleY = CANVAS_H - 40;
    ctx.fillRect(p.x, paddleY, p.w, PADDLE_H);
    const b = ballRef.current;
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#fca5a5";
    ctx.fill();
    if (!running) {
      ctx.fillStyle = "rgba(11,16,32,0.6)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 32px Inter, system-ui, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Breakout", CANVAS_W / 2, CANVAS_H / 2 - 40);
      ctx.font = "20px Inter, system-ui, Arial";
      ctx.fillText("Press Start to Play (← → or A D)", CANVAS_W / 2, CANVAS_H / 2 - 10);
      if (lives <= 0) ctx.fillText("Game Over – Reset to try again", CANVAS_W / 2, CANVAS_H / 2 + 20);
      ctx.textAlign = "left";
    }
    // Show Game Over overlay
    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#ff6b6b";
      ctx.font = "bold 40px Inter, system-ui, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.font = "20px Inter, system-ui, Arial";
      ctx.fillText(`High Score: ${highScoreRef.current}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
      ctx.fillText("Press Space to Restart", CANVAS_W / 2, CANVAS_H / 2 + 60);
      ctx.textAlign = "left";
    }
  }

  function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
  function rectCircleOverlap(rx: number, ry: number, rw: number, rh: number, cx: number, cy: number, cr: number) {
    const nx = clamp(cx, rx, rx + rw);
    const ny = clamp(cy, ry, ry + rh);
    const dx = cx - nx;
    const dy = cy - ny;
    return dx * dx + dy * dy <= cr * cr;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)', color: '#00ffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚀 BREAKOUT</h1>
      {/* Update the top bar layout for perfect alignment */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px',
        padding: '20px',
        background: 'rgba(0, 255, 255, 0.1)',
        border: '2px solid #00ffff',
        borderRadius: '15px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ffff', display: 'flex', alignItems: 'center' }}>🚀 BREAKOUT</div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          <span>Score: {score}</span>
          <span>Lives: {lives}</span>
          <span>Level: {level}</span>
          <span style={{ color: '#00ffff' }}>High Score: {highScoreRef.current}</span>
        </div>
      </div>
      <div style={{ position: 'relative', border: '3px solid #00ffff', borderRadius: '10px', overflow: 'hidden', width: CANVAS_W, height: CANVAS_H }}>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ display: 'block', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', borderRadius: '7px' }} />
        {/* Game Over overlay */}
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
            <div style={{ color: '#ff6b6b', fontSize: 40, fontWeight: 'bold', marginBottom: 20 }}>Game Over</div>
            <div style={{ color: '#fff', fontSize: 20, marginBottom: 30 }}>High Score: {highScoreRef.current}</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button onClick={() => setGameOver(false)} style={{ padding: '12px 32px', fontSize: 18, background: '#00ffff', color: '#222', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>OK</button>
              <button onClick={() => {
                resetGame(false); // Pass false to not reset level
                startGame();
              }} style={{ padding: '12px 32px', fontSize: 18, background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Start Again</button>
            </div>
          </div>
        )}
        {/* Main game buttons, hidden when gameOver */}
        {!gameOver && (
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: '10px' }}>
            <button onClick={startGame} style={{ padding: '8px 16px', background: 'rgba(0,255,255,0.2)', border: '1px solid #00ffff', color: '#00ffff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'background 0.3s' }}>Start</button>
            <button onClick={pauseGame} style={{ padding: '8px 16px', background: 'rgba(0,255,255,0.2)', border: '1px solid #00ffff', color: '#00ffff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'background 0.3s' }}>Pause</button>
            <button onClick={() => resetGame()} style={{ padding: '8px 16px', background: 'rgba(255,107,107,0.2)', border: '1px solid #ff6b6b', color: '#ff6b6b', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'background 0.3s' }}>Reset</button>
          </div>
        )}
      </div>
      <div style={{ width: '100%', maxWidth: '800px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', marginTop: '20px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#ff6b6b' }}>💎 Power-ups:</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#ccc' }}>
            <span style={{ fontSize: '18px' }}>🔴</span>
            <span>Bigger Paddle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#ccc' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span>Speed Boost</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#ccc' }}>
            <span style={{ fontSize: '18px' }}>❤️</span>
            <span>Extra Life</span>
          </div>
        </div>
      </div>
    </div>
  );
};
