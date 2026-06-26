import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { X, Zap, ChevronUp, Cpu, Battery } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  onExit: () => void;
}

export function EvolutionGame({ lang, onExit }: Props) {
  const [points, setPoints] = useState(() => {
    return parseInt(localStorage.getItem('evoPoints') || '0', 10);
  });
  const [clickPower, setClickPower] = useState(() => {
    return parseInt(localStorage.getItem('evoClickPower') || '1', 10);
  });
  const [autoPower, setAutoPower] = useState(() => {
    return parseInt(localStorage.getItem('evoAutoPower') || '0', 10);
  });
  const [clickUpgrades, setClickUpgrades] = useState(() => {
    return parseInt(localStorage.getItem('evoClickUpgrades') || '0', 10);
  });
  const [autoUpgrades, setAutoUpgrades] = useState(() => {
    return parseInt(localStorage.getItem('evoAutoUpgrades') || '0', 10);
  });

  const [clickEffects, setClickEffects] = useState<{id: number, x: number, y: number}[]>([]);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('evoPoints', points.toString());
    localStorage.setItem('evoClickPower', clickPower.toString());
    localStorage.setItem('evoAutoPower', autoPower.toString());
    localStorage.setItem('evoClickUpgrades', clickUpgrades.toString());
    localStorage.setItem('evoAutoUpgrades', autoUpgrades.toString());
  }, [points, clickPower, autoPower, clickUpgrades, autoUpgrades]);

  // Auto points loop
  useEffect(() => {
    if (autoPower === 0) return;
    const interval = setInterval(() => {
      setPoints(p => p + autoPower);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoPower]);

  const handleMainClick = (e: React.MouseEvent) => {
    setPoints(p => p + clickPower);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newEffect = { id: Date.now() + Math.random(), x, y };
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
  };

  const buyClickUpgrade = () => {
    const cost = Math.floor(10 * Math.pow(1.5, clickUpgrades));
    if (points >= cost) {
      setPoints(p => p - cost);
      setClickPower(p => p + 1);
      setClickUpgrades(u => u + 1);
    }
  };

  const buyAutoUpgrade = () => {
    const cost = Math.floor(50 * Math.pow(1.5, autoUpgrades));
    if (points >= cost) {
      setPoints(p => p - cost);
      setAutoPower(p => p + 2);
      setAutoUpgrades(u => u + 1);
    }
  };

  const clickCost = Math.floor(10 * Math.pow(1.5, clickUpgrades));
  const autoCost = Math.floor(50 * Math.pow(1.5, autoUpgrades));

  return (
    <div className="flex flex-col h-full bg-neutral-900 w-full max-w-lg mx-auto shadow-2xl relative text-neutral-200">
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 z-10">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-lg text-white">Infinite Evolution</h2>
        </div>
        <button onClick={onExit} className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-10 flex-shrink-0">
        <h1 className="text-5xl font-mono font-bold text-white mb-2">{Math.floor(points).toLocaleString()}</h1>
        <p className="text-neutral-400 font-mono text-sm">Energy Points</p>
        <div className="flex gap-4 mt-2 text-sm text-neutral-500 font-mono">
          <span className="flex items-center gap-1"><ChevronUp className="w-4 h-4"/> {clickPower}/click</span>
          <span className="flex items-center gap-1"><Battery className="w-4 h-4"/> {autoPower}/sec</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMainClick}
          className="relative w-48 h-48 bg-blue-600 rounded-full shadow-[0_0_50px_rgba(37,99,235,0.4)] border-4 border-blue-400 flex items-center justify-center group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-400 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <Zap className="w-20 h-20 text-white relative z-10" />
          
          <AnimatePresence>
            {clickEffects.map(effect => (
              <motion.div
                key={effect.id}
                initial={{ opacity: 1, y: effect.y - 20, x: effect.x, scale: 0.5 }}
                animate={{ opacity: 0, y: effect.y - 100, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-yellow-300 font-bold font-mono pointer-events-none z-20"
                style={{ left: 0, top: 0 }}
              >
                +{clickPower}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="bg-neutral-950 p-4 rounded-t-3xl border-t border-neutral-800 flex-shrink-0">
        <h3 className="text-neutral-500 font-bold text-sm mb-3 uppercase tracking-wider">Upgrades</h3>
        <div className="space-y-3">
          <button 
            onClick={buyClickUpgrade}
            disabled={points < clickCost}
            className={`w-full p-3 rounded-xl flex items-center justify-between border ${points >= clickCost ? 'bg-neutral-900 border-neutral-700 hover:border-blue-500 cursor-pointer' : 'bg-neutral-900/50 border-neutral-800 opacity-50 cursor-not-allowed'} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg"><ChevronUp className="w-5 h-5"/></div>
              <div className="text-left">
                <div className="font-bold text-white">Enhanced Click</div>
                <div className="text-xs text-neutral-500">+{1} per click • Level {clickUpgrades}</div>
              </div>
            </div>
            <div className="font-mono font-bold text-yellow-500">{clickCost} EP</div>
          </button>

          <button 
            onClick={buyAutoUpgrade}
            disabled={points < autoCost}
            className={`w-full p-3 rounded-xl flex items-center justify-between border ${points >= autoCost ? 'bg-neutral-900 border-neutral-700 hover:border-blue-500 cursor-pointer' : 'bg-neutral-900/50 border-neutral-800 opacity-50 cursor-not-allowed'} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 text-green-400 rounded-lg"><Cpu className="w-5 h-5"/></div>
              <div className="text-left">
                <div className="font-bold text-white">Auto Generator</div>
                <div className="text-xs text-neutral-500">+{2} per sec • Level {autoUpgrades}</div>
              </div>
            </div>
            <div className="font-mono font-bold text-yellow-500">{autoCost} EP</div>
          </button>
        </div>
      </div>
    </div>
  );
}
