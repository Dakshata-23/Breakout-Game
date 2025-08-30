import { GameState, GameAction, Paddle, Ball, Brick, PowerUp, Particle } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';

const createInitialPaddle = (): Paddle => ({
  width: GAME_CONFIG.paddle.width,
  height: GAME_CONFIG.paddle.height,
  x: (GAME_CONFIG.canvas.width - GAME_CONFIG.paddle.width) / 2,
  y: GAME_CONFIG.canvas.height - 30,
  speed: GAME_CONFIG.paddle.speed,
  color: GAME_CONFIG.paddle.color
});

const createInitialBall = (): Ball => ({
  radius: GAME_CONFIG.ball.radius,
  x: GAME_CONFIG.canvas.width / 2,
  y: GAME_CONFIG.canvas.height - 50,
  dx: 0,
  dy: 0,
  speed: GAME_CONFIG.ball.speed,
  color: GAME_CONFIG.ball.color
});

const createBricks = (): Brick[] => {
  const bricks: Brick[] = [];
  const { brick } = GAME_CONFIG;
  
  for (let row = 0; row < brick.rows; row++) {
    for (let col = 0; col < brick.cols; col++) {
      const x = col * (brick.width + brick.padding) + brick.padding;
      const y = row * (brick.height + brick.padding) + brick.padding + 50;
      
      bricks.push({
        x,
        y,
        width: brick.width,
        height: brick.height,
        color: brick.colors[row % brick.colors.length],
        hit: false
      });
    }
  }
  
  return bricks;
};

const loadHighScore = (): number => {
  return parseInt(localStorage.getItem('breakoutHighScore') || '0');
};

export const initialState: GameState = {
  score: 0,
  lives: 3,
  level: 1,
  highScore: loadHighScore(),
  gameRunning: false,
  gamePaused: false,
  ballLaunched: false,
  paddle: createInitialPaddle(),
  ball: createInitialBall(),
  bricks: createBricks(),
  powerUps: [],
  particles: []
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameRunning: true,
        ballLaunched: false,
        ball: createInitialBall()
      };
      
    case 'LAUNCH_BALL':
      if (!state.ballLaunched) {
        return {
          ...state,
          ballLaunched: true,
          ball: {
            ...state.ball,
            dx: (Math.random() - 0.5) * 4,
            dy: -state.ball.speed
          }
        };
      }
      return state;
      
    case 'RESET_BALL':
      return {
        ...state,
        ballLaunched: false,
        ball: createInitialBall()
      };
      
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: action.payload
      };
      
    case 'UPDATE_LIVES':
      return {
        ...state,
        lives: action.payload
      };
      
    case 'UPDATE_LEVEL':
      return {
        ...state,
        level: action.payload
      };
      
    case 'NEXT_LEVEL':
      const newHighScore = state.score > state.highScore ? state.score : state.highScore;
      if (newHighScore > state.highScore) {
        localStorage.setItem('breakoutHighScore', newHighScore.toString());
      }
      
      return {
        ...state,
        level: state.level + 1,
        highScore: newHighScore,
        ball: {
          ...createInitialBall(),
          speed: state.ball.speed + 0.5
        },
        bricks: createBricks(),
        ballLaunched: false
      };
      
    case 'GAME_OVER':
      const finalHighScore = state.score > state.highScore ? state.score : state.highScore;
      if (finalHighScore > state.highScore) {
        localStorage.setItem('breakoutHighScore', finalHighScore.toString());
      }
      
      return {
        ...state,
        gameRunning: false,
        highScore: finalHighScore
      };
      
    case 'ADD_POWER_UP':
      return {
        ...state,
        powerUps: [...state.powerUps, action.payload]
      };
      
    case 'REMOVE_POWER_UP':
      return {
        ...state,
        powerUps: state.powerUps.filter((_, index) => index !== action.payload)
      };
      
    case 'UPDATE_POWER_UP':
      // Use id property if available, else update all matching by position
      if ('x' in action.payload && 'y' in action.payload) {
        return {
          ...state,
          powerUps: state.powerUps.map((powerUp, index) =>
            powerUp.x === (action.payload as any).x && powerUp.y === (action.payload as any).y
              ? { ...powerUp, ...action.payload }
              : powerUp
          )
        };
      } else {
        // fallback: update all
        return {
          ...state,
          powerUps: state.powerUps.map((powerUp) => ({ ...powerUp, ...action.payload }))
        };
      }
      
    case 'ADD_PARTICLE':
      return {
        ...state,
        particles: [...state.particles, action.payload]
      };
      
    case 'REMOVE_PARTICLE':
      return {
        ...state,
        particles: state.particles.filter((_, index) => index !== action.payload)
      };
      
    case 'UPDATE_PARTICLE':
      // Use x/y if available, else update all
      if ('x' in action.payload && 'y' in action.payload) {
        return {
          ...state,
          particles: state.particles.map((particle, index) =>
            particle.x === (action.payload as any).x && particle.y === (action.payload as any).y
              ? { ...particle, ...action.payload }
              : particle
          )
        };
      } else {
        // fallback: update all
        return {
          ...state,
          particles: state.particles.map((particle) => ({ ...particle, ...action.payload }))
        };
      }
      
    case 'REMOVE_BRICK':
      return {
        ...state,
        bricks: state.bricks.filter((_, index) => index !== action.payload)
      };
      
    case 'UPDATE_PADDLE':
      return {
        ...state,
        paddle: { ...state.paddle, ...action.payload }
      };
      
    case 'UPDATE_BALL':
      return {
        ...state,
        ball: { ...state.ball, ...action.payload }
      };
      
    default:
      return state;
  }
};
