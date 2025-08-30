import React from 'react';
import { GameState } from '../types/game';

interface GameOverlayProps {
  gameState: GameState;
  onStartGame: () => void;
  onLaunchBall: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ 
  gameState, 
  onStartGame, 
  onLaunchBall 
}) => {
  if (gameState.gameRunning && gameState.ballLaunched) {
    return null;
  }

  const getOverlayContent = () => {
    if (!gameState.gameRunning) {
      return {
        title: '🚀 BREAKOUT',
        message: 'Press SPACE to start',
        showHighScore: true
      };
    }

    if (!gameState.ballLaunched) {
      return {
        title: 'LEVEL ' + gameState.level,
        message: 'Press SPACE to launch ball',
        showHighScore: false
      };
    }

    return {
      title: 'GAME OVER',
      message: `Final Score: ${gameState.score}${gameState.score > gameState.highScore ? ' - NEW HIGH SCORE! 🏆' : ''}`,
      showHighScore: true
    };
  };

  const content = getOverlayContent();

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#00ffff',
        padding: '40px',
        background: 'rgba(0, 255, 255, 0.1)',
        border: '2px solid #00ffff',
        borderRadius: '15px',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '900',
          marginBottom: '20px',
          textShadow: '0 0 15px #00ffff',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>{content.title}</h2>
        <p style={{ fontSize: '20px', marginBottom: '15px', color: '#fff' }}>{content.message}</p>
        
        <div style={{
          margin: '30px 0',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ margin: '8px 0', fontSize: '16px', color: '#ccc' }}>🎮 Controls:</p>
          <p style={{ margin: '8px 0', fontSize: '16px', color: '#ccc' }}>← → Arrow Keys or A/D to move paddle</p>
          <p style={{ margin: '8px 0', fontSize: '16px', color: '#ccc' }}>SPACE to launch ball</p>
        </div>
        
        {content.showHighScore && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid #ffd700',
            borderRadius: '10px'
          }}>
            <p style={{ color: '#ffd700', fontWeight: '700' }}>🏆 High Score: {gameState.highScore}</p>
          </div>
        )}
        
        <div style={{ marginTop: '24px' }}>
          {!gameState.gameRunning && (
            <button 
              onClick={onStartGame}
              style={{
                padding: '12px 24px',
                background: 'rgba(0, 255, 255, 0.2)',
                border: '1px solid #00ffff',
                color: '#00ffff',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginRight: '16px'
              }}
            >
              Start Game
            </button>
          )}
          
          {gameState.gameRunning && !gameState.ballLaunched && (
            <button 
              onClick={onLaunchBall}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid #ff6b6b',
                color: '#ff6b6b',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Launch Ball
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
