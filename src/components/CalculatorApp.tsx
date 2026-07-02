import React, { useState, useRef, useEffect } from 'react';
import { Language, ThemeMode } from '../types';
import { evaluate } from 'mathjs';
import { ArrowLeft, Save, History, Trash2 } from 'lucide-react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
  onSaveNote?: (title: string, data: any) => void;
  onSecretCode?: (code: string) => void;
}

interface HistoryItem {
  equation: string;
  result: string;
}

export function CalculatorApp({ lang, theme, onBack, onSaveNote, onSecretCode }: Props) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
  }, [input, result]);

  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history, showHistory]);

  const handleInput = (val: string) => {
    // Prevent multiple leading zeros or multiple operators
    const operators = ['+', '-', '*', '/'];
    if (input === '' && operators.includes(val)) return;
    
    // Replace visual operators with math operators for input state
    const mathVal = val === '×' ? '*' : val === '÷' ? '/' : val;
    setInput(prev => prev + mathVal);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    // Check for Arabic numbers conversion if needed for intercept
    const normalizedInput = input.replace(/٢/g, '2').replace(/٥/g, '5').replace(/٨/g, '8').replace(/٠/g, '0');
    
    if (normalizedInput === '2580') {
      setShowHistory(true);
      setInput('');
      setResult('');
      return;
    }
    
    if (onSecretCode && (input === '00' || input === '1122' || input === '1111' || input === '2222' || input === '3333')) {
      onSecretCode(input);
      return;
    }
    
    try {
      if (!input) return;
      const res = evaluate(input);
      const resStr = String(res);
      setResult(resStr);
      
      const newItem = { equation: input.replace(/\*/g, '×').replace(/\//g, '÷'), result: resStr };
      setHistory(prev => [...prev, newItem]);
    } catch (e) {
      setResult('Error');
    }
  };

  const handleSave = () => {
    if (onSaveNote && (input || result)) {
      onSaveNote(lang === 'ar' ? 'حساب رياضي' : 'Calculation', `Input: ${input.replace(/\*/g, '×').replace(/\//g, '÷')}\nResult: ${result}`);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const renderVisualInput = (str: string) => {
    return str.replace(/\*/g, '×').replace(/\//g, '÷');
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}
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

      <div className="flex-1 flex overflow-hidden">
        {/* Main Calculator Area */}
        <div className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-8 transition-all ${showHistory ? 'hidden md:flex' : 'flex'}`}>
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            
            {/* Display */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col items-end justify-end h-40 border-b border-neutral-100 dark:border-neutral-800">
              <div 
                ref={displayRef}
                className="w-full text-right text-neutral-500 dark:text-neutral-400 text-xl font-medium tracking-wider mb-2 truncate"
              >
                {renderVisualInput(input) || (result ? 'Ans' : '')}
              </div>
              <div className={`w-full text-right text-4xl sm:text-5xl font-light tracking-tight truncate ${result === 'Error' ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>
                {result || renderVisualInput(input) || '0'}
              </div>
            </div>

            {/* Keypad */}
            <div className="p-6 bg-white dark:bg-neutral-900 grid grid-cols-4 gap-4">
              <button onClick={handleClear} className="col-span-2 py-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-red-500 font-semibold text-lg transition-colors">AC</button>
              <button onClick={handleDelete} className="py-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-red-500 font-semibold text-lg transition-colors">⌫</button>
              <button onClick={() => handleInput('/')} className="py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-2xl transition-colors">÷</button>

              <button onClick={() => handleInput('7')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">7</button>
              <button onClick={() => handleInput('8')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">8</button>
              <button onClick={() => handleInput('9')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">9</button>
              <button onClick={() => handleInput('*')} className="py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-2xl transition-colors">×</button>

              <button onClick={() => handleInput('4')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">4</button>
              <button onClick={() => handleInput('5')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">5</button>
              <button onClick={() => handleInput('6')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">6</button>
              <button onClick={() => handleInput('-')} className="py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-2xl transition-colors">−</button>

              <button onClick={() => handleInput('1')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">1</button>
              <button onClick={() => handleInput('2')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">2</button>
              <button onClick={() => handleInput('3')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">3</button>
              <button onClick={() => handleInput('+')} className="py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-2xl transition-colors">+</button>

              <button onClick={() => handleInput('0')} className="col-span-2 py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors text-left pl-10">0</button>
              <button onClick={() => handleInput('.')} className="py-4 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-2xl transition-colors">.</button>
              <button onClick={handleCalculate} className="py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-2xl shadow-md shadow-blue-500/20 transition-all active:scale-95">=</button>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-full md:w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col shadow-xl z-20">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">
                {lang === 'ar' ? 'سجل العمليات' : 'Calculation History'}
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title={lang === 'ar' ? 'مسح السجل' : 'Clear History'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div ref={historyRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {history.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-sm">
                  {lang === 'ar' ? 'لا يوجد سجل...' : 'No history yet...'}
                </div>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-end gap-1 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 cursor-pointer" onClick={() => { setInput(item.equation); setResult(''); }}>
                    <div className="text-neutral-500 dark:text-neutral-400 font-mono tracking-wider">{item.equation}</div>
                    <div className="text-xl font-medium text-neutral-900 dark:text-white font-mono">={item.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

