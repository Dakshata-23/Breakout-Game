import React, { useRef, useEffect } from 'react';
import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';

interface GameCanvasProps {
  gameState: GameState;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw paddle
    const paddleGradient = ctx.createLinearGradient(
      gameState.paddle.x, 
      gameState.paddle.y, 
      gameState.paddle.x, 
      gameState.paddle.y + gameState.paddle.height
    );
    paddleGradient.addColorStop(0, gameState.paddle.color);
    paddleGradient.addColorStop(1, '#008080');
    
    ctx.fillStyle = paddleGradient;
    ctx.shadowColor = gameState.paddle.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(
      gameState.paddle.x, 
      gameState.paddle.y, 
      gameState.paddle.width, 
      gameState.paddle.height
    );
    ctx.shadowBlur = 0;

    // Draw ball
    const ballGradient = ctx.createRadialGradient(
      gameState.ball.x, gameState.ball.y, 0,
      gameState.ball.x, gameState.ball.y, gameState.ball.radius
    );
    ballGradient.addColorStop(0, '#fff');
    ballGradient.addColorStop(0.5, gameState.ball.color);
    ballGradient.addColorStop(1, darkenColor(gameState.ball.color, 0.5));
    
    ctx.fillStyle = ballGradient;
    ctx.shadowColor = gameState.ball.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a bright center highlight
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(gameState.ball.x - 2, gameState.ball.y - 2, gameState.ball.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Draw bricks
    gameState.bricks.forEach(brick => {
      const brickGradient = ctx.createLinearGradient(
        brick.x, brick.y, 
        brick.x, brick.y + brick.height
      );
      brickGradient.addColorStop(0, brick.color);
      brickGradient.addColorStop(1, darkenColor(brick.color, 0.3));
      
      ctx.fillStyle = brickGradient;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      
      // Border
      ctx.strokeStyle = darkenColor(brick.color, 0.5);
      ctx.lineWidth = 2;
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      
      // Highlight
      ctx.fillStyle = lightenColor(brick.color, 0.3);
      ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 4);
    });

    // Draw power-ups
    gameState.powerUps.forEach(powerUp => {
      ctx.fillStyle = powerUp.color;
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      
      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      
      // Icon
      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(
        powerUp.icon, 
        powerUp.x + powerUp.width / 2, 
        powerUp.y + powerUp.height / 2 + 7
      );
      
      // Glow effect
      ctx.shadowColor = powerUp.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      ctx.shadowBlur = 0;
    });

    // Draw particles (smaller, faded, not ball-like)
    gameState.particles.forEach(particle => {
      ctx.globalAlpha = Math.max(0.2, particle.life * 0.5); // More faded
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(1, particle.size * 0.5), 0, Math.PI * 2); // Smaller
      ctx.fill();
      ctx.globalAlpha = 1;
    });

  }, [gameState]);

  const darkenColor = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const lightenColor = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R) * 0x10000 +
      (G > 255 ? 255 : G) * 0x100 +
      (B > 255 ? 255 : B)).toString(16).slice(1);
  };

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.canvas.width}
      height={GAME_CONFIG.canvas.height}
      style={{
        display: 'block',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
        borderRadius: '7px'
      }}
    />
  );
};
