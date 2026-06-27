import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { ArrowLeft } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
}

export function SpaceGame({ lang, onExit }: Props) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Basic game state
  const state = useRef({
    player: { x: 150, y: 450, w: 30, h: 30 },
    bullets: [] as {x: number, y: number}[],
    enemies: [] as {x: number, y: number, alive: boolean}[],
    keys: { left: false, right: false, space: false },
    lastShot: 0
  });

  useEffect(() => {
    // Init enemies
    for(let i=0; i<5; i++) {
      for(let j=0; j<3; j++) {
        state.current.enemies.push({ x: 40 + i*50, y: 30 + j*40, alive: true });
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if(e.code === 'ArrowLeft') state.current.keys.left = true;
      if(e.code === 'ArrowRight') state.current.keys.right = true;
      if(e.code === 'Space') state.current.keys.space = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if(e.code === 'ArrowLeft') state.current.keys.left = false;
      if(e.code === 'ArrowRight') state.current.keys.right = false;
      if(e.code === 'Space') state.current.keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId: number;
    let enemyDir = 1;

    const loop = (time: number) => {
      if(gameOver) return;

      const s = state.current;
      
      // Move player
      if(s.keys.left) s.player.x -= 5;
      if(s.keys.right) s.player.x += 5;
      s.player.x = Math.max(0, Math.min(300 - s.player.w, s.player.x));

      // Shoot
      if(s.keys.space && time - s.lastShot > 300) {
        s.bullets.push({ x: s.player.x + s.player.w/2 - 2, y: s.player.y });
        s.lastShot = time;
      }

      // Move bullets
      s.bullets.forEach(b => b.y -= 7);
      s.bullets = s.bullets.filter(b => b.y > 0);

      // Move enemies
      let moveDown = false;
      s.enemies.forEach(e => {
        if(!e.alive) return;
        e.x += enemyDir * 1;
        if(e.x > 280 || e.x < 10) moveDown = true;
      });

      if(moveDown) {
        enemyDir *= -1;
        s.enemies.forEach(e => {
          if(!e.alive) return;
          e.x += enemyDir * 2;
          e.y += 20;
          if(e.y > 400) setGameOver(true);
        });
      }

      // Collisions
      s.bullets.forEach(b => {
        s.enemies.forEach(e => {
          if(e.alive && b.y < e.y + 20 && b.y > e.y && b.x > e.x && b.x < e.x + 20) {
            e.alive = false;
            b.y = -100;
            setScore(prev => prev + 10);
          }
        });
      });

      // Draw
      const canvas = canvasRef.current;
      if(canvas) {
        const ctx = canvas.getContext('2d');
        if(ctx) {
          ctx.fillStyle = '#000';
          ctx.fillRect(0,0,300,500);

          // Player
          ctx.fillStyle = '#0f0';
          ctx.fillRect(s.player.x, s.player.y, s.player.w, s.player.h);

          // Bullets
          ctx.fillStyle = '#ff0';
          s.bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

          // Enemies
          ctx.fillStyle = '#f00';
          s.enemies.forEach(e => {
            if(e.alive) ctx.fillRect(e.x, e.y, 20, 20);
          });
        }
      }

      // Win check
      if(s.enemies.every(e => !e.alive)) {
        setGameOver(true);
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver]);

  return (
    <div className="flex flex-col h-full bg-black w-full relative items-center justify-center font-mono">
      <header className="absolute top-0 w-full p-4 flex items-center justify-between z-10">
        <button onClick={onExit} className="p-2 bg-neutral-900 rounded-full text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white text-xl">Score: {score}</div>
      </header>
      
      <div className="relative">
        <canvas ref={canvasRef} width={300} height={500} className="border border-neutral-800 bg-black shadow-[0_0_20px_rgba(0,255,0,0.1)]" />
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
            <h2 className="text-3xl text-green-500 mb-2">GAME OVER</h2>
            <p className="mb-4">Score: {score}</p>
            <button onClick={onExit} className="px-6 py-2 border border-green-500 hover:bg-green-500/20 text-green-500 uppercase tracking-widest transition-colors">
              Exit
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onPointerDown={() => state.current.keys.left = true} 
          onPointerUp={() => state.current.keys.left = false}
          className="w-16 h-16 bg-neutral-900 border border-neutral-800 text-white rounded-lg active:bg-neutral-800 flex items-center justify-center select-none"
        >
          &larr;
        </button>
        <button 
          onPointerDown={() => state.current.keys.space = true} 
          onPointerUp={() => state.current.keys.space = false}
          className="w-16 h-16 bg-green-900/50 border border-green-500 text-green-500 rounded-full active:bg-green-600 active:text-white flex items-center justify-center select-none"
        >
          FIRE
        </button>
        <button 
          onPointerDown={() => state.current.keys.right = true} 
          onPointerUp={() => state.current.keys.right = false}
          className="w-16 h-16 bg-neutral-900 border border-neutral-800 text-white rounded-lg active:bg-neutral-800 flex items-center justify-center select-none"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
