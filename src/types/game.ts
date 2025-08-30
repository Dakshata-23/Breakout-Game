export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  paddle: {
    width: number;
    height: number;
    speed: number;
    color: string;
  };
  ball: {
    radius: number;
    speed: number;
    color: string;
  };
  brick: {
    width: number;
    height: number;
    padding: number;
    rows: number;
    cols: number;
    colors: string[];
  };
  powerUp: {
    width: number;
    height: number;
    speed: number;
    types: string[];
  };
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
  color: string;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hit: boolean;
}

export interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: string;
  color: string;
  icon: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  decay: number;
  size: number;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  highScore: number;
  gameRunning: boolean;
  gamePaused: boolean;
  ballLaunched: boolean;
  paddle: Paddle;
  ball: Ball;
  bricks: Brick[];
  powerUps: PowerUp[];
  particles: Particle[];
}

export type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'LAUNCH_BALL' }
  | { type: 'UPDATE_GAME' }
  | { type: 'GAME_OVER' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'RESET_BALL' }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'UPDATE_LIVES'; payload: number }
  | { type: 'UPDATE_LEVEL'; payload: number }
  | { type: 'ADD_POWER_UP'; payload: PowerUp }
  | { type: 'REMOVE_POWER_UP'; payload: number }
  | { type: 'UPDATE_POWER_UP'; payload: Partial<PowerUp> }
  | { type: 'ADD_PARTICLE'; payload: Particle }
  | { type: 'REMOVE_PARTICLE'; payload: number }
  | { type: 'UPDATE_PARTICLE'; payload: Partial<Particle> }
  | { type: 'REMOVE_BRICK'; payload: number }
  | { type: 'UPDATE_PADDLE'; payload: Partial<Paddle> }
  | { type: 'UPDATE_BALL'; payload: Partial<Ball> };
