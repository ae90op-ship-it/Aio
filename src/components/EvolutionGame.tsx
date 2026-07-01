import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins, Zap } from 'lucide-react';
import { Language, ThemeMode } from '../types';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
}

const UPGRADES = [
  { id: 1, name: 'Cell Division', baseCost: 10, cps: 1, icon: '🦠' },
  { id: 2, name: 'Mitochondria', baseCost: 50, cps: 5, icon: '⚡' },
  { id: 3, name: 'Multicellular', baseCost: 200, cps: 15, icon: '🧬' },
  { id: 4, name: 'Nervous System', baseCost: 1000, cps: 50, icon: '🧠' },
  { id: 5, name: 'Spinal Cord', baseCost: 5000, cps: 200, icon: '🦴' },
  { id: 6, name: 'Eyesight', baseCost: 15000, cps: 600, icon: '👁️' },
  { id: 7, name: 'Fins', baseCost: 50000, cps: 2000, icon: '🐟' },
  { id: 8, name: 'Lungs', baseCost: 150000, cps: 5000, icon: '🫁' },
  { id: 9, name: 'Legs', baseCost: 500000, cps: 15000, icon: '🦎' },
  { id: 10, name: 'Warm Blood', baseCost: 2000000, cps: 50000, icon: '🩸' },
  { id: 11, name: 'Opposable Thumbs', baseCost: 5000000, cps: 120000, icon: '👍' },
  { id: 12, name: 'Fire Mastery', baseCost: 15000000, cps: 350000, icon: '🔥' },
  { id: 13, name: 'Agriculture', baseCost: 50000000, cps: 1000000, icon: '🌾' },
  { id: 14, name: 'Writing', baseCost: 200000000, cps: 4000000, icon: '✍️' },
  { id: 15, name: 'Steam Engine', baseCost: 1000000000, cps: 15000000, icon: '🚂' },
  { id: 16, name: 'Electricity', baseCost: 5000000000, cps: 60000000, icon: '💡' },
  { id: 17, name: 'Computers', baseCost: 25000000000, cps: 250000000, icon: '💻' },
  { id: 18, name: 'Internet', baseCost: 100000000000, cps: 1000000000, icon: '🌐' },
  { id: 19, name: 'AI Superintelligence', baseCost: 500000000000, cps: 5000000000, icon: '🤖' },
  { id: 20, name: 'Galactic Empire', baseCost: 2500000000000, cps: 25000000000, icon: '🌌' },
];

export function EvolutionGame({ lang, theme, onBack }: Props) {
  const [dna, setDna] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [purchases, setPurchases] = useState<Record<number, number>>({});
  
  const getCost = (upgradeId: number, baseCost: number) => {
    const count = purchases[upgradeId] || 0;
    return Math.floor(baseCost * Math.pow(1.15, count));
  };

  const currentCps = UPGRADES.reduce((total, upg) => {
    return total + (purchases[upg.id] || 0) * upg.cps;
  }, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentCps > 0) {
        setDna(prev => prev + currentCps);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentCps]);

  const handleManualClick = () => {
    setDna(prev => prev + clickPower);
  };

  const buyUpgrade = (upg: typeof UPGRADES[0]) => {
    const cost = getCost(upg.id, upg.baseCost);
    if (dna >= cost) {
      setDna(prev => prev - cost);
      setPurchases(prev => ({
        ...prev,
        [upg.id]: (prev[upg.id] || 0) + 1
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 w-full relative font-sans">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Infinite Evolution
        </h2>
        <div className="w-9" />
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Clicker Area */}
        <div className="md:w-1/3 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm z-10">
          <div className="text-center mb-8">
            <h3 className="text-lg text-neutral-500 dark:text-neutral-400 font-medium mb-2 uppercase tracking-widest text-xs">Total DNA</h3>
            <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
              <Coins className="w-8 h-8" />
              {Math.floor(dna).toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-mono">
              {currentCps.toLocaleString()} DNA / sec
            </div>
          </div>
          
          <button 
            onClick={handleManualClick}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 hover:from-blue-500 hover:to-indigo-700 active:scale-95 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center text-6xl text-white select-none relative overflow-hidden group"
          >
            <span className="relative z-10">🧬</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white group-active:animate-none"></div>
          </button>
        </div>

        {/* Upgrades Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-100 dark:bg-neutral-950">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {UPGRADES.map(upg => {
              const cost = getCost(upg.id, upg.baseCost);
              const count = purchases[upg.id] || 0;
              const canAfford = dna >= cost;
              const isUnlocked = upg.id === 1 || (purchases[upg.id - 1] || 0) > 0;
              
              if (!isUnlocked && cost > dna * 5) return null; // Hide too advanced upgrades
              
              return (
                <button
                  key={upg.id}
                  onClick={() => buyUpgrade(upg)}
                  disabled={!canAfford}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    canAfford 
                      ? 'bg-white dark:bg-neutral-800 border-blue-200 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-700 shadow-sm cursor-pointer active:scale-[0.98]' 
                      : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="text-4xl">{upg.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 dark:text-white text-lg leading-tight">{upg.name}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">+{upg.cps.toLocaleString()} DNA/s</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${canAfford ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>
                      {cost.toLocaleString()}
                    </div>
                    {count > 0 && (
                      <div className="text-xs font-mono bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-full inline-block mt-1">
                        Lvl {count}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
