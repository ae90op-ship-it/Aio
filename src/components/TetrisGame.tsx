import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Language, ThemeMode } from '../types';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Tetromino shapes
const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
};

type TetrominoType = keyof typeof TETROMINOS;
const getRandomTetromino = () => {
  const keys = Object.keys(TETROMINOS) as TetrominoType[];
  return TETROMINOS[keys[Math.floor(Math.random() * keys.length)]];
};

const createEmptyBoard = () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export function TetrisGame({ lang, theme, onBack }: Props) {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(getRandomTetromino());
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const checkCollision = (piece: number[][], x: number, y: number, currentBoard: any[][]) => {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c]) {
          const newY = y + r;
          const newX = x + c;
          if (
            newY >= BOARD_HEIGHT ||
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            (newY >= 0 && currentBoard[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    const newBoard = board.map(row => [...row]);
    let gameEnded = false;
    currentPiece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          if (pos.y + r <= 0) {
            gameEnded = true;
          } else {
            newBoard[pos.y + r][pos.x + c] = currentPiece.color;
          }
        }
      });
    });

    if (gameEnded) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    // Clear lines
    let linesCleared = 0;
    const finalBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (finalBoard.length < BOARD_HEIGHT) {
      finalBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (linesCleared > 0) {
      setScore(s => s + linesCleared * 100);
    }

    setBoard(finalBoard);
    setCurrentPiece(getRandomTetromino());
    setPos({ x: 3, y: 0 });
  };

  const moveDown = useCallback(() => {
    if (gameOver || !isPlaying) return;
    if (!checkCollision(currentPiece.shape, pos.x, pos.y + 1, board)) {
      setPos(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      mergePiece();
    }
  }, [pos, currentPiece, board, gameOver, isPlaying]);

  useEffect(() => {
    let dropInterval: any;
    if (isPlaying) {
      dropInterval = setInterval(moveDown, 500);
    }
    return () => clearInterval(dropInterval);
  }, [moveDown, isPlaying]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver || !isPlaying) return;
    if (e.key === 'ArrowLeft') {
      if (!checkCollision(currentPiece.shape, pos.x - 1, pos.y, board)) {
        setPos(prev => ({ ...prev, x: prev.x - 1 }));
      }
    } else if (e.key === 'ArrowRight') {
      if (!checkCollision(currentPiece.shape, pos.x + 1, pos.y, board)) {
        setPos(prev => ({ ...prev, x: prev.x + 1 }));
      }
    } else if (e.key === 'ArrowDown') {
      moveDown();
    } else if (e.key === 'ArrowUp') {
      // Rotate
      const rotated = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
      );
      if (!checkCollision(rotated, pos.x, pos.y, board)) {
        setCurrentPiece({ ...currentPiece, shape: rotated });
      }
    }
  }, [pos, currentPiece, board, gameOver, isPlaying, moveDown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setPos({ x: 3, y: 0 });
    setCurrentPiece(getRandomTetromino());
  };

  // Render combined board
  const renderBoard = board.map(row => [...row]);
  if (isPlaying) {
    currentPiece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && pos.y + r >= 0 && pos.y + r < BOARD_HEIGHT) {
          renderBoard[pos.y + r][pos.x + c] = currentPiece.color;
        }
      });
    });
  }

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Tetris</h2>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">Score: {score}</div>
        
        <div className="bg-neutral-200 dark:bg-neutral-800 p-2 rounded-xl shadow-2xl relative">
          <div className="grid grid-rows-20 gap-px bg-neutral-300 dark:bg-neutral-900 border border-neutral-400 dark:border-neutral-700" style={{ gridTemplateRows: 'repeat(20, minmax(0, 1fr))' }}>
            {renderBoard.map((row, y) => (
              <div key={y} className="flex gap-px">
                {row.map((cell, x) => (
                  <div 
                    key={x} 
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${cell ? cell : 'bg-white dark:bg-neutral-800'}`} 
                  />
                ))}
              </div>
            ))}
          </div>
          
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
              {gameOver && <div className="text-white text-2xl font-bold mb-4 text-center">Game Over<br/><span className="text-lg">Score: {score}</span></div>}
              <button 
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {gameOver ? 'Play Again' : 'Start Game'}
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile controls */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden">
          <div />
          <button onClick={() => handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))} className="p-4 bg-neutral-300 dark:bg-neutral-700 rounded-lg flex items-center justify-center">⇧</button>
          <div />
          <button onClick={() => handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))} className="p-4 bg-neutral-300 dark:bg-neutral-700 rounded-lg flex items-center justify-center">⇦</button>
          <button onClick={() => handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))} className="p-4 bg-neutral-300 dark:bg-neutral-700 rounded-lg flex items-center justify-center">⇩</button>
          <button onClick={() => handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))} className="p-4 bg-neutral-300 dark:bg-neutral-700 rounded-lg flex items-center justify-center">⇨</button>
        </div>
      </div>
    </div>
  );
}
