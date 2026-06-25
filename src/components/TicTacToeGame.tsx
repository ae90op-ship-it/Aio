import React, { useState } from 'react';
import { Language, ThemeMode } from '../types';
import { translations } from '../i18n';
import { X, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  lang: Language;
  onExit: () => void;
}

export function TicTacToeGame({ lang, onExit }: Props) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const handleClick = (i: number) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 text-neutral-900 dark:text-neutral-200">
      <div className="w-full max-w-sm flex justify-between items-center mb-8 border-b border-neutral-300 dark:border-neutral-800 pb-4">
        <h2 className="text-2xl font-bold text-blue-500">XO Game</h2>
        <button onClick={onExit} className="p-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6 text-xl font-semibold">
        {winner ? (
          <span className="text-green-500">Winner: {winner}</span>
        ) : isDraw ? (
          <span className="text-yellow-500">Draw!</span>
        ) : (
          <span>Next Player: <span className={xIsNext ? 'text-blue-500' : 'text-red-500'}>{xIsNext ? 'X' : 'O'}</span></span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 bg-neutral-300 dark:bg-neutral-800 p-3 rounded-2xl">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(i)}
            className="w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center text-4xl sm:text-5xl font-bold transition-colors shadow-sm"
          >
            {cell && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cell === 'X' ? 'text-blue-500' : 'text-red-500'}
              >
                {cell}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-[0_4px_15px_rgba(37,99,235,0.2)]"
      >
        <RotateCcw className="w-5 h-5" />
        Reset Game
      </button>
    </div>
  );
}
