import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Language, ThemeMode } from '../types';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
}

export function SpaceInvadersGame({ lang, theme, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Game state refs for animation loop
  const gameState = useRef({
    player: { x: 150, y: 350, width: 30, height: 15, speed: 5, dx: 0 },
    bullets: [] as { x: number, y: number, width: number, height: number, speed: number }[],
    invaders: [] as { x: number, y: number, width: number, height: number, alive: boolean }[],
    invaderDir: 1,
    invaderSpeed: 1,
    lastTime: 0
  });

  const initGame = () => {
    const invaders = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        invaders.push({
          x: 30 + col * 40,
          y: 30 + row * 30,
          width: 20,
          height: 15,
          alive: true
        });
      }
    }
    
    gameState.current = {
      player: { x: 150, y: 350, width: 30, height: 15, speed: 5, dx: 0 },
      bullets: [],
      invaders,
      invaderDir: 1,
      invaderSpeed: 1,
      lastTime: performance.now()
    };
    
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = (time: number) => {
      const state = gameState.current;
      const deltaTime = time - state.lastTime;
      
      if (!isPlaying || gameOver) return;
      
      // Update player
      state.player.x += state.player.dx;
      if (state.player.x < 0) state.player.x = 0;
      if (state.player.x + state.player.width > canvas.width) state.player.x = canvas.width - state.player.width;

      // Update bullets
      state.bullets.forEach(b => b.y -= b.speed);
      state.bullets = state.bullets.filter(b => b.y > 0);

      // Update invaders
      let hitWall = false;
      state.invaders.forEach(inv => {
        if (!inv.alive) return;
        inv.x += state.invaderSpeed * state.invaderDir;
        if (inv.x <= 0 || inv.x + inv.width >= canvas.width) {
          hitWall = true;
        }
      });

      if (hitWall) {
        state.invaderDir *= -1;
        state.invaders.forEach(inv => {
          inv.y += 10;
        });
        state.invaderSpeed += 0.2; // Increase difficulty
      }

      // Check collisions
      state.bullets.forEach((b, bIdx) => {
        state.invaders.forEach((inv, iIdx) => {
          if (!inv.alive) return;
          if (
            b.x < inv.x + inv.width &&
            b.x + b.width > inv.x &&
            b.y < inv.y + inv.height &&
            b.y + b.height > inv.y
          ) {
            inv.alive = false;
            state.bullets.splice(bIdx, 1);
            setScore(s => s + 10);
          }
        });
      });

      // Check game over
      let allDead = true;
      state.invaders.forEach(inv => {
        if (inv.alive) {
          allDead = false;
          if (inv.y + inv.height >= state.player.y) {
            setGameOver(true);
            setIsPlaying(false);
          }
        }
      });
      
      if (allDead && state.invaders.length > 0) {
        // Level up - just spawn more for now
        setIsPlaying(false);
        setGameOver(true); // You win
      }

      // Draw
      ctx.fillStyle = '#0f172a'; // dark bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw player
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
      ctx.fillRect(state.player.x + 10, state.player.y - 5, 10, 5);

      // Draw bullets
      ctx.fillStyle = '#fde047';
      state.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
      });

      // Draw invaders
      ctx.fillStyle = '#a3e635';
      state.invaders.forEach(inv => {
        if (inv.alive) {
          ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
        }
      });

      state.lastTime = time;
      animationFrameId = requestAnimationFrame(render);
    };

    if (isPlaying) {
      gameState.current.lastTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    } else {
       // Draw static
       ctx.fillStyle = '#0f172a';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameState.current.player.dx = -gameState.current.player.speed;
      if (e.key === 'ArrowRight') gameState.current.player.dx = gameState.current.player.speed;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        if (isPlaying && !gameOver) {
          gameState.current.bullets.push({
            x: gameState.current.player.x + gameState.current.player.width / 2 - 2,
            y: gameState.current.player.y,
            width: 4,
            height: 10,
            speed: 7
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') gameState.current.player.dx = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, gameOver]);

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Space Invaders</h2>
        <div className="text-sm font-bold text-blue-500">Score: {score}</div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative bg-neutral-200 dark:bg-neutral-900 p-2 rounded-xl shadow-2xl border-4 border-neutral-300 dark:border-neutral-800">
          <canvas 
            ref={canvasRef} 
            width={350} 
            height={400} 
            className="bg-slate-900 rounded"
          />
          
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
              {gameOver && <div className="text-white text-2xl font-bold mb-4 text-center">Game Over<br/><span className="text-lg text-blue-400">Score: {score}</span></div>}
              <button 
                onClick={initGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {gameOver ? 'Play Again' : 'Start Mission'}
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile controls */}
        <div className="mt-8 flex gap-4 sm:hidden">
          <button 
            onTouchStart={() => gameState.current.player.dx = -gameState.current.player.speed}
            onTouchEnd={() => gameState.current.player.dx = 0}
            className="w-16 h-16 bg-neutral-300 dark:bg-neutral-700 rounded-full flex items-center justify-center select-none"
          >
            ⇦
          </button>
          <button 
            onTouchStart={() => {
              if (isPlaying && !gameOver) {
                gameState.current.bullets.push({
                  x: gameState.current.player.x + gameState.current.player.width / 2 - 2,
                  y: gameState.current.player.y,
                  width: 4,
                  height: 10,
                  speed: 7
                });
              }
            }}
            className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center select-none font-bold"
          >
            FIRE
          </button>
          <button 
            onTouchStart={() => gameState.current.player.dx = gameState.current.player.speed}
            onTouchEnd={() => gameState.current.player.dx = 0}
            className="w-16 h-16 bg-neutral-300 dark:bg-neutral-700 rounded-full flex items-center justify-center select-none"
          >
            ⇨
          </button>
        </div>
      </div>
    </div>
  );
}
