import React, { useState, useRef, useEffect } from 'react';
import { Language, ThemeMode } from '../types';
import { evaluate } from 'mathjs';
import { ArrowLeft, Save, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
  onSaveNote?: (title: string, data: any) => void;
  onSecretCode?: (code: string) => void;
}

export function CalculatorApp({ lang, theme, onBack, onSaveNote, onSecretCode }: Props) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const [history, setHistory] = useState<{ input: string, result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
  }, [input, result]);

  const handleInput = (val: string) => {
    setInput(prev => prev + val);
    setIsShift(false);
    setIsAlpha(false);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setIsShift(false);
    setIsAlpha(false);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (input === '2580') {
      setShowHistory(true);
      setInput('');
      return;
    }

    if (onSecretCode && (input === '00' || input === '1122' || input === '1111' || input === '2222' || input === '3333')) {
      onSecretCode(input);
      return;
    }
    
    try {
      if (!input) return;
      // Sanitize input for mathjs
      let mathInput = input
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√\(/g, 'sqrt(');
        
      const res = evaluate(mathInput);
      setResult(String(res));
      setHistory(prev => [...prev, { input, result: String(res) }]);
    } catch (e) {
      setResult('Syntax ERROR');
    }
  };

  const handleSave = () => {
    if (onSaveNote && (input || result)) {
      onSaveNote(lang === 'ar' ? 'حساب رياضي' : 'Calculation', `Input: ${input}\nResult: ${result}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-full transition-colors"
            title={lang === 'ar' ? 'السجل' : 'History'}
          >
            <History className="w-5 h-5" />
          </button>
          {onSaveNote && (
            <button
              onClick={handleSave}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-blue-900/30 rounded-full transition-colors"
              title={lang === 'ar' ? 'حفظ كملاحظة' : 'Save as Note'}
            >
              <Save className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-xl mx-auto w-full gap-4 items-center justify-center">
        
        {/* Calculator Body */}
        <div className="w-full bg-neutral-200 dark:bg-neutral-800 p-4 sm:p-6 rounded-[2rem] shadow-2xl border-4 border-neutral-300 dark:border-neutral-700 flex flex-col gap-6">
          
          {/* Brand/Model */}
          <div className="flex justify-between items-center px-2">
            <span className="font-bold tracking-widest text-neutral-800 dark:text-neutral-300 italic text-lg">CASIO</span>
            <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">fx-991EX</span>
          </div>

          {/* Screen */}
          <div className="bg-[#9ea79a] p-4 rounded-xl shadow-inner border-[6px] border-neutral-300 dark:border-neutral-700 flex flex-col min-h-[120px] max-h-[160px]">
            {/* Status indicators */}
            <div className="flex gap-2 text-[10px] font-mono text-neutral-800 mb-1 font-bold h-4">
              {isShift && <span>S</span>}
              {isAlpha && <span>A</span>}
              <span className="ml-auto">MATH</span>
            </div>
            
            {/* Scrollable Math Display */}
            <div 
              ref={displayRef}
              className="flex-1 overflow-y-auto font-mono text-xl sm:text-2xl text-neutral-900 leading-relaxed break-all scrollbar-hide flex flex-col justify-between"
            >
              <div className="text-left w-full pb-2">
                {input}
                <span className="animate-pulse">_</span>
              </div>
              <div className={`text-right w-full text-2xl sm:text-3xl font-bold ${result === 'Syntax ERROR' ? 'text-red-800' : 'text-neutral-900'}`}>
                {result}
              </div>
            </div>
          </div>

          {/* Keypad */}
          <div className="flex flex-col gap-4">
            
            {/* Top row controls */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-2">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold mb-1">SOLVE</span>
                <button onClick={() => setIsShift(!isShift)} className={`w-full py-2 rounded-full text-xs font-bold transition-all ${isShift ? 'bg-yellow-400 text-neutral-900' : 'bg-neutral-700 dark:bg-neutral-600 text-white shadow-md active:scale-95'}`}>SHIFT</button>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-red-500 font-bold mb-1">d/dx</span>
                <button onClick={() => setIsAlpha(!isAlpha)} className={`w-full py-2 rounded-full text-xs font-bold transition-all ${isAlpha ? 'bg-red-400 text-neutral-900' : 'bg-neutral-700 dark:bg-neutral-600 text-white shadow-md active:scale-95'}`}>ALPHA</button>
              </div>
              <div className="col-span-2 flex justify-center items-center">
                {/* D-PAD placeholder */}
                <div className="w-16 h-16 rounded-full bg-neutral-700 dark:bg-neutral-600 shadow-md border-2 border-neutral-600 dark:border-neutral-500 relative flex items-center justify-center">
                  <div className="absolute top-1 text-[8px] text-white">▲</div>
                  <div className="absolute bottom-1 text-[8px] text-white">▼</div>
                  <div className="absolute left-1 text-[8px] text-white">◀</div>
                  <div className="absolute right-1 text-[8px] text-white">▶</div>
                  <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-neutral-700 shadow-inner"></div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold mb-1">SETUP</span>
                <button className="w-full py-2 rounded-full text-xs font-bold bg-neutral-700 dark:bg-neutral-600 text-white shadow-md active:scale-95">MODE</button>
              </div>
            </div>

            {/* Scientific Functions */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3 text-xs sm:text-sm">
              {['x⁻¹', '√(', 'x²', 'x^', 'log(', 'ln('].map(btn => (
                <button key={btn} onClick={() => handleInput(btn)} className="bg-neutral-800 dark:bg-neutral-700 text-white py-2 rounded shadow-md active:scale-95 font-medium">{btn}</button>
              ))}
              {['(-)', '°\'\"', 'x⁻¹', 'sin(', 'cos(', 'tan('].map(btn => (
                <button key={btn} onClick={() => handleInput(btn)} className="bg-neutral-800 dark:bg-neutral-700 text-white py-2 rounded shadow-md active:scale-95 font-medium">{btn}</button>
              ))}
              {['STO', 'ENG', '(', ')', 'S⇔D', 'M+'].map(btn => (
                <button key={btn} onClick={() => handleInput(btn)} className="bg-neutral-800 dark:bg-neutral-700 text-white py-2 rounded shadow-md active:scale-95 font-medium">{btn}</button>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-2">
              <div className="col-span-3 grid grid-cols-3 gap-2 sm:gap-4">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', 'EXP'].map(btn => (
                  <button key={btn} onClick={() => handleInput(btn)} className="bg-neutral-100 dark:bg-neutral-300 text-neutral-900 py-3 rounded shadow-md active:scale-95 text-lg font-bold">{btn}</button>
                ))}
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-2 sm:gap-4">
                <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded shadow-md active:scale-95 font-bold">DEL</button>
                <button onClick={handleClear} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded shadow-md active:scale-95 font-bold">AC</button>
                <button onClick={() => handleInput('×')} className="bg-neutral-400 dark:bg-neutral-500 text-neutral-900 dark:text-white py-3 rounded shadow-md active:scale-95 text-lg font-bold">×</button>
                <button onClick={() => handleInput('÷')} className="bg-neutral-400 dark:bg-neutral-500 text-neutral-900 dark:text-white py-3 rounded shadow-md active:scale-95 text-lg font-bold">÷</button>
                <button onClick={() => handleInput('+')} className="bg-neutral-400 dark:bg-neutral-500 text-neutral-900 dark:text-white py-3 rounded shadow-md active:scale-95 text-lg font-bold">+</button>
                <button onClick={() => handleInput('-')} className="bg-neutral-400 dark:bg-neutral-500 text-neutral-900 dark:text-white py-3 rounded shadow-md active:scale-95 text-lg font-bold">-</button>
                <button onClick={() => handleInput('Ans')} className="bg-neutral-100 dark:bg-neutral-300 text-neutral-900 py-3 rounded shadow-md active:scale-95 font-bold text-sm">Ans</button>
                <button onClick={handleCalculate} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded shadow-md active:scale-95 text-xl font-bold">=</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm z-50 flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {lang === 'ar' ? 'سجل العمليات' : 'History'}
              </h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {history.length === 0 ? (
                <div className="text-center text-neutral-500 mt-10">
                  {lang === 'ar' ? 'لا يوجد سجل بعد' : 'No history yet'}
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <div className="text-sm text-neutral-500 mb-1">{h.input}</div>
                    <div className="text-lg font-bold text-neutral-900 dark:text-white text-right">= {h.result}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
