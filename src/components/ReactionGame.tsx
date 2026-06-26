import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  lang: Language;
  onExit: () => void;
}

type GameState = 'IDLE' | 'WAITING' | 'CLICK_NOW' | 'RESULT' | 'TOO_EARLY';

export function ReactionGame({ lang, onExit }: Props) {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('bestReactionTime');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startGame = () => {
    setGameState('WAITING');
    setReactionTime(null);
    
    // Random wait between 2 to 6 seconds
    const waitTime = Math.floor(Math.random() * 4000) + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('CLICK_NOW');
      startTimeRef.current = performance.now();
    }, waitTime);
  };

  const handleClick = () => {
    if (gameState === 'IDLE' || gameState === 'RESULT' || gameState === 'TOO_EARLY') {
      startGame();
    } else if (gameState === 'WAITING') {
      // Clicked too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('TOO_EARLY');
    } else if (gameState === 'CLICK_NOW') {
      const time = Math.floor(performance.now() - startTimeRef.current);
      setReactionTime(time);
      setGameState('RESULT');
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('bestReactionTime', time.toString());
      }
    }
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'IDLE': return 'bg-blue-500';
      case 'WAITING': return 'bg-red-500';
      case 'CLICK_NOW': return 'bg-green-500';
      case 'RESULT': return 'bg-blue-500';
      case 'TOO_EARLY': return 'bg-blue-600';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center w-full h-full max-w-lg mx-auto text-white cursor-pointer transition-colors duration-100 select-none ${getBackgroundColor()}`}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onExit(); }} 
        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white z-10 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-4 left-4 text-white/80 font-mono">
        Best: {bestTime ? `${bestTime}ms` : '---'}
      </div>

      <motion.div 
        key={gameState}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-8 pointer-events-none"
      >
        {gameState === 'IDLE' && (
          <>
            <h1 className="text-4xl font-bold mb-4">Reaction Time Test</h1>
            <p className="text-xl">When the red box turns green, click as quickly as you can.</p>
            <p className="mt-8 font-bold animate-pulse">Click anywhere to start.</p>
          </>
        )}

        {gameState === 'WAITING' && (
          <h1 className="text-5xl font-bold">Wait for green...</h1>
        )}

        {gameState === 'CLICK_NOW' && (
          <h1 className="text-6xl font-bold">CLICK!</h1>
        )}

        {gameState === 'RESULT' && (
          <>
            <h1 className="text-5xl font-bold mb-4">{reactionTime} ms</h1>
            <p className="text-xl">Click to keep trying.</p>
          </>
        )}

        {gameState === 'TOO_EARLY' && (
          <>
            <h1 className="text-4xl font-bold mb-4">Too soon!</h1>
            <p className="text-xl">Click to try again.</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
