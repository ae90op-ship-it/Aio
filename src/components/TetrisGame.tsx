import React, { useEffect, useState, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { X, ArrowLeft, ArrowRight, ArrowDown, RotateCw, ChevronsDown } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Tetromino shapes
const TETROMINOS = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
];

export function TetrisGame({ lang, onExit }: Props) {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const [piece, setPiece] = useState({ shape: TETROMINOS[0], x: 3, y: 0 });

  const checkCollision = (shape: number[][], x: number, y: number) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    const newBoard = board.map(row => [...row]);
    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && piece.y + r >= 0) {
          newBoard[piece.y + r][piece.x + c] = 1;
        }
      });
    });

    let linesCleared = 0;
    const finalBoard = newBoard.filter(row => {
      if (row.every(cell => cell)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (finalBoard.length < BOARD_HEIGHT) {
      finalBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    setBoard(finalBoard);
    if (linesCleared > 0) setScore(s => s + linesCleared * 100);

    const nextShape = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    if (checkCollision(nextShape, 3, 0)) {
      setGameOver(true);
    } else {
      setPiece({ shape: nextShape, x: 3, y: 0 });
    }
  };

  const moveDown = useCallback(() => {
    if (gameOver) return;
    if (!checkCollision(piece.shape, piece.x, piece.y + 1)) {
      setPiece(p => ({ ...p, y: p.y + 1 }));
    } else {
      mergePiece();
    }
  }, [piece, board, gameOver]);

  const hardDrop = () => {
    if (gameOver) return;
    let newY = piece.y;
    while (!checkCollision(piece.shape, piece.x, newY + 1)) {
      newY++;
    }
    setPiece(p => ({ ...p, y: newY }));
    // Force merge on next tick by running moveDown
  };

  const moveLeft = () => {
    if (gameOver) return;
    if (!checkCollision(piece.shape, piece.x - 1, piece.y)) setPiece(p => ({ ...p, x: p.x - 1 }));
  };

  const moveRight = () => {
    if (gameOver) return;
    if (!checkCollision(piece.shape, piece.x + 1, piece.y)) setPiece(p => ({ ...p, x: p.x + 1 }));
  };

  const rotate = () => {
    if (gameOver) return;
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    if (!checkCollision(rotated, piece.x, piece.y)) setPiece(p => ({ ...p, shape: rotated }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowDown') moveDown();
      if (e.key === 'ArrowUp') rotate();
      if (e.key === ' ') hardDrop();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [piece, board, gameOver, moveDown]);

  useEffect(() => {
    const timer = setInterval(moveDown, 500);
    return () => clearInterval(timer);
  }, [moveDown]);

  const displayBoard = board.map(row => [...row]);
  if (!gameOver) {
    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && piece.y + r >= 0 && piece.y + r < BOARD_HEIGHT) {
          displayBoard[piece.y + r][piece.x + c] = 2; // 2 represents active piece
        }
      });
    });
  }

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-lg mx-auto p-4 md:p-6 text-white font-mono bg-black">
      <div className="w-full flex justify-between items-center mb-4 border-b border-neutral-800 pb-4">
        <h2 className="text-xl text-blue-400 font-bold">TETRIS</h2>
        <div className="text-neutral-400">Score: <span className="text-white font-bold">{score}</span></div>
        <button onClick={onExit} className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-neutral-900 border-4 border-neutral-800 p-2 rounded-lg relative mb-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            <h3 className="text-red-500 font-bold text-2xl mb-2">GAME OVER</h3>
            <p className="mb-4">Final Score: {score}</p>
            <button onClick={() => {
              setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
              setScore(0);
              setGameOver(false);
              setPiece({ shape: TETROMINOS[0], x: 3, y: 0 });
            }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded">Play Again</button>
          </div>
        )}
        {displayBoard.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div 
                key={`${y}-${x}`} 
                className={`w-5 h-5 sm:w-6 sm:h-6 border-[0.5px] border-neutral-900/50 ${cell === 2 ? 'bg-blue-500 shadow-[0_0_10px_blue]' : cell === 1 ? 'bg-neutral-500' : 'bg-neutral-800'}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* On-Screen Touch Controls */}
      <div className="w-full max-w-[300px] grid grid-cols-3 gap-3 mb-6 touch-manipulation">
        <button onClick={moveLeft} className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg border border-neutral-700">
          <ArrowLeft className="w-8 h-8 text-neutral-300" />
        </button>
        <button onClick={rotate} className="p-4 bg-blue-600/20 hover:bg-blue-600/40 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg border border-blue-500/50">
          <RotateCw className="w-8 h-8 text-blue-400" />
        </button>
        <button onClick={moveRight} className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg border border-neutral-700">
          <ArrowRight className="w-8 h-8 text-neutral-300" />
        </button>
        
        <div className="col-span-3 grid grid-cols-2 gap-3 mt-1">
          <button onClick={moveDown} className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg border border-neutral-700">
            <ArrowDown className="w-8 h-8 text-neutral-300" />
          </button>
          <button onClick={hardDrop} className="p-4 bg-red-500/20 hover:bg-red-500/40 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg border border-red-500/50">
            <ChevronsDown className="w-8 h-8 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
