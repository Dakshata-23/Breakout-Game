import { useEffect, useRef, useCallback } from 'react';
import { GameState, GameAction, PowerUp, Particle } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';

export const useGameEngine = (
  state: GameState,
  dispatch: React.Dispatch<GameAction>
) => {
  const animationRef = useRef<number | undefined>(undefined);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef<GameState>(state);
  
  // Keep state ref updated
  stateRef.current = state;

  const createPowerUp = useCallback((x: number, y: number): PowerUp => {
    const type = GAME_CONFIG.powerUp.types[Math.floor(Math.random() * GAME_CONFIG.powerUp.types.length)];
    const getColor = () => {
      switch (type) {
        case 'bigger': return '#ff6b6b';
        case 'speed': return '#4ecdc4';
        case 'life': return '#ff9ff3';
        default: return '#fff';
      }
    };
    const getIcon = () => {
      switch (type) {
        case 'bigger': return '🔴';
        case 'speed': return '⚡';
        case 'life': return '❤️';
        default: return '💎';
      }
    };

    return {
      x,
      y,
      width: GAME_CONFIG.powerUp.width,
      height: GAME_CONFIG.powerUp.height,
      speed: GAME_CONFIG.powerUp.speed,
      type,
      color: getColor(),
      icon: getIcon()
    };
  }, []);

  const createParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      const particle: Particle = {
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color,
        life: 1,
        decay: 0.02,
        size: Math.random() * 4 + 2
      };
      dispatch({ type: 'ADD_PARTICLE', payload: particle });
    }
  }, [dispatch]);

  const checkCollisions = useCallback(() => {
    const currentState = stateRef.current;
    
    // Ball-Paddle collision
    if (currentState.ballLaunched && 
        currentState.ball.y + currentState.ball.radius > currentState.paddle.y &&
        currentState.ball.x > currentState.paddle.x && 
        currentState.ball.x < currentState.paddle.x + currentState.paddle.width) {
      
      dispatch({
        type: 'UPDATE_BALL',
        payload: {
          dy: -Math.abs(currentState.ball.dy),
          dx: ((currentState.ball.x - currentState.paddle.x) / currentState.paddle.width - 0.5) * 8
        }
      });
      
      createParticles(currentState.ball.x, currentState.ball.y, '#00ffff');
    }

    // Ball-Brick collisions
    let brickHit = false;
    for (let i = currentState.bricks.length - 1; i >= 0; i--) {
      if (brickHit) break;
      const brick = currentState.bricks[i];
      if (
        currentState.ballLaunched &&
        currentState.ball.x + currentState.ball.radius > brick.x &&
        currentState.ball.x - currentState.ball.radius < brick.x + brick.width &&
        currentState.ball.y + currentState.ball.radius > brick.y &&
        currentState.ball.y - currentState.ball.radius < brick.y + brick.height
      ) {
        dispatch({ type: 'REMOVE_BRICK', payload: i });
        dispatch({ type: 'UPDATE_SCORE', payload: currentState.score + 10 });
        createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
        // Only allow one power-up/ball spawn per collision
        if (Math.random() < 0.05) {
          const powerUp = createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
          dispatch({ type: 'ADD_POWER_UP', payload: powerUp });
        }
        dispatch({
          type: 'UPDATE_BALL',
          payload: { dy: -currentState.ball.dy }
        });
        brickHit = true;
      }
    }

    // Paddle-PowerUp collisions
    for (let i = currentState.powerUps.length - 1; i >= 0; i--) {
      const powerUp = currentState.powerUps[i];
      if (currentState.paddle.x < powerUp.x + powerUp.width &&
          currentState.paddle.x + currentState.paddle.width > powerUp.x &&
          currentState.paddle.y < powerUp.y + powerUp.height &&
          currentState.paddle.y + currentState.paddle.height > powerUp.y) {
        
        // Apply power-up effect
        switch (powerUp.type) {
          case 'bigger':
            dispatch({
              type: 'UPDATE_PADDLE',
              payload: { width: Math.min(currentState.paddle.width * 1.5, 200) }
            });
            setTimeout(() => {
              dispatch({
                type: 'UPDATE_PADDLE',
                payload: { width: GAME_CONFIG.paddle.width }
              });
            }, 10000);
            break;
          case 'speed':
            dispatch({
              type: 'UPDATE_BALL',
              payload: { speed: currentState.ball.speed * 1.5 }
            });
            setTimeout(() => {
              dispatch({
                type: 'UPDATE_BALL',
                payload: { speed: GAME_CONFIG.ball.speed }
              });
            }, 8000);
            break;
          case 'life':
            dispatch({ type: 'UPDATE_LIVES', payload: currentState.lives + 1 });
            break;
        }
        
        dispatch({ type: 'REMOVE_POWER_UP', payload: i });
        createParticles(powerUp.x, powerUp.y, '#ffd700');
      }
    }

    // Ball out of bounds
    if (currentState.ball.y > GAME_CONFIG.canvas.height) {
      dispatch({ type: 'UPDATE_LIVES', payload: currentState.lives - 1 });
      
      if (currentState.lives <= 1) {
        dispatch({ type: 'GAME_OVER' });
      } else {
        dispatch({ type: 'RESET_BALL' });
      }
    }
  }, [dispatch, createPowerUp, createParticles]);

  const updateGame = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.gameRunning) return;

    // Update paddle position based on keys
    if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) {
      const newX = Math.max(0, currentState.paddle.x - currentState.paddle.speed);
      dispatch({ type: 'UPDATE_PADDLE', payload: { x: newX } });
    }
    if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) {
      const newX = Math.min(
        GAME_CONFIG.canvas.width - currentState.paddle.width,
        currentState.paddle.x + currentState.paddle.speed
      );
      dispatch({ type: 'UPDATE_PADDLE', payload: { x: newX } });
    }

         // Update ball position
     if (currentState.ballLaunched) {
       const newX = currentState.ball.x + currentState.ball.dx;
       const newY = currentState.ball.y + currentState.ball.dy;

       // Wall collisions
       let finalX = newX;
       let finalY = newY;
       let finalDx = currentState.ball.dx;
       let finalDy = currentState.ball.dy;

       // Left and right wall collisions
       if (newX - currentState.ball.radius <= 0) {
         finalX = currentState.ball.radius;
         finalDx = -currentState.ball.dx;
       } else if (newX + currentState.ball.radius >= GAME_CONFIG.canvas.width) {
         finalX = GAME_CONFIG.canvas.width - currentState.ball.radius;
         finalDx = -currentState.ball.dx;
       }

       // Top wall collision
       if (newY - currentState.ball.radius <= 0) {
         finalY = currentState.ball.radius;
         finalDy = -currentState.ball.dy;
       }

       dispatch({
         type: 'UPDATE_BALL',
         payload: { x: finalX, y: finalY, dx: finalDx, dy: finalDy }
       });
     } else {
       // Ball follows paddle when not launched
       dispatch({
         type: 'UPDATE_BALL',
         payload: { x: currentState.paddle.x + currentState.paddle.width / 2 }
       });
     }

    // Update power-ups
    // Remove power-ups that reach the bottom, update others
    currentState.powerUps.forEach((powerUp, index) => {
      const newY = powerUp.y + powerUp.speed;
      if (newY + powerUp.height >= GAME_CONFIG.canvas.height) {
        dispatch({ type: 'REMOVE_POWER_UP', payload: index });
      } else {
        dispatch({
          type: 'UPDATE_POWER_UP',
          payload: { ...powerUp, y: newY }
        });
      }
    });

      // Update particles
      currentState.particles.forEach((particle, index) => {
        const newX = particle.x + particle.vx;
        const newY = particle.y + particle.vy;
        const newVx = particle.vx * 0.98;
        const newVy = particle.vy * 0.98;
        const newLife = particle.life - particle.decay;
        const newSize = particle.size * 0.98;

        if (newLife <= 0) {
          dispatch({ type: 'REMOVE_PARTICLE', payload: index });
        } else {
          // Update particle
          dispatch({
            type: 'UPDATE_PARTICLE',
            payload: { 
              ...particle, 
              x: newX, 
              y: newY, 
              vx: newVx, 
              vy: newVy, 
              life: newLife, 
              size: newSize 
            }
          });
        }
      });

    checkCollisions();

    // Check win condition
    if (currentState.bricks.length === 0) {
      dispatch({ type: 'NEXT_LEVEL' });
    }
  }, [dispatch, checkCollisions]);

  const gameLoop = useCallback(() => {
    updateGame();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame]);

  useEffect(() => {
    if (state.gameRunning) {
      gameLoop();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.gameRunning, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      
      if (e.code === 'Space') {
        e.preventDefault();
        const currentState = stateRef.current;
        if (!currentState.gameRunning) {
          dispatch({ type: 'START_GAME' });
        } else if (!currentState.ballLaunched) {
          dispatch({ type: 'LAUNCH_BALL' });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch]);

  return {
    keys: keysRef.current
  };
};
