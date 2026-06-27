import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
}

const EMOJIS = ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🍍', '🥝'];

export function MemoryGame({ lang, onExit }: Props) {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [idx1, idx2] = newFlipped;
      if (newCards[idx1].emoji === newCards[idx2].emoji) {
        setTimeout(() => {
          setCards(prev => {
            const copy = [...prev];
            copy[idx1].isMatched = true;
            copy[idx2].isMatched = true;
            return copy;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const copy = [...prev];
            copy[idx1].isFlipped = false;
            copy[idx2].isFlipped = false;
            return copy;
          });
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isWon = cards.length > 0 && cards.every(c => c.isMatched);

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between">
        <button onClick={onExit} className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center font-bold font-mono">
          {lang === 'ar' ? `الحركات: ${moves}` : `Moves: ${moves}`}
        </div>
        <button onClick={initGame} className="p-2 text-neutral-600 dark:text-neutral-300">
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {isWon ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-green-500">
              {lang === 'ar' ? 'لقد فزت!' : 'You Won!'}
            </h2>
            <p className="text-neutral-500">{lang === 'ar' ? `بـ ${moves} حركة` : `in ${moves} moves`}</p>
            <button onClick={initGame} className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow mt-4">
              {lang === 'ar' ? 'العب مجدداً' : 'Play Again'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md w-full">
            {cards.map((card, idx) => (
              <div 
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-5xl cursor-pointer transition-all duration-300 transform preserve-3d ${card.isFlipped || card.isMatched ? 'bg-white dark:bg-neutral-800 rotate-y-180 shadow-md border-2 border-neutral-200 dark:border-neutral-700' : 'bg-blue-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]'}`}
              >
                <div className={`${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                  {card.emoji}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
