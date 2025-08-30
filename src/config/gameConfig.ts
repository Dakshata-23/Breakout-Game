import { GameConfig } from '../types/game';

export const GAME_CONFIG: GameConfig = {
  canvas: {
    width: 800,
    height: 600
  },
  paddle: {
    width: 100,
    height: 15,
    speed: 8,
    color: '#00ffff'
  },
  ball: {
    radius: 12,
    speed: 5,
    color: '#ff6b6b'
  },
  brick: {
    width: 80,
    height: 25,
    padding: 2,
    rows: 6,
    cols: 10,
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
  },
  powerUp: {
    width: 30,
    height: 30,
    speed: 2,
    types: ['bigger', 'speed', 'life']
  }
};
