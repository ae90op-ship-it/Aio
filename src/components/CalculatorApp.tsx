import React, { useState } from 'react';
import { Language, ThemeMode } from '../types';
import { evaluate } from 'mathjs';
import { ArrowLeft, Delete, Settings2, Save } from 'lucide-react';
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
  const [isAdvanced, setIsAdvanced] = useState(false);

  const handleInput = (val: string) => {
    setInput(prev => prev + val);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (onSecretCode && (input === '010' || input === '1122')) {
      onSecretCode(input);
      return;
    }
    
    try {
      if (!input) return;
      const res = evaluate(input);
      setResult(String(res));
    } catch (e) {
      setResult('Error');
    }
  };

  const handleSave = () => {
    if (onSaveNote && (input || result)) {
      onSaveNote(lang === 'ar' ? 'حساب رياضي' : 'Calculation', `Input: ${input}\nResult: ${result}`);
    }
  };

  const basicButtons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '.', '0', '=', '+'
  ];

  const advancedButtons = [
    'sin(', 'cos(', 'tan(', '^',
    'sqrt(', 'log(', 'exp(', '!',
    '(', ')', 'pi', 'e',
    'det(', 'inv(', 'transpose(', ','
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {onSaveNote && (
            <button
              onClick={handleSave}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
              title={lang === 'ar' ? 'حفظ كملاحظة' : 'Save as Note'}
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setIsAdvanced(!isAdvanced)}
            className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-medium ${isAdvanced ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full gap-6">
        <div className="flex-1 flex flex-col justify-end items-end p-6 bg-white dark:bg-neutral-950 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 font-mono overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-50 dark:to-neutral-900/20 pointer-events-none" />
          <div className="text-2xl text-neutral-500 dark:text-neutral-400 break-all w-full text-right min-h-[2rem] z-10">
            {input || '0'}
          </div>
          <div className={`text-5xl font-light text-neutral-900 dark:text-white mt-2 break-all w-full text-right min-h-[3.5rem] z-10 tracking-tight transition-all ${result === 'Error' ? 'text-red-500 dark:text-red-400' : ''}`}>
            {result}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 bg-white dark:bg-neutral-950 p-6 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
          <button onClick={handleClear} className="col-span-2 p-4 rounded-2xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold text-lg transition-all active:scale-95 shadow-sm">AC</button>
          <button onClick={handleDelete} className="col-span-2 p-4 flex items-center justify-center rounded-2xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-all active:scale-95 shadow-sm"><Delete className="w-6 h-6" /></button>

          <AnimatePresence>
            {isAdvanced && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="col-span-4 grid grid-cols-4 gap-3 mb-1"
              >
                {advancedButtons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleInput(btn)}
                    className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono text-sm font-medium transition-all active:scale-95"
                  >
                    {btn}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {basicButtons.map((btn) => {
            const isOperator = ['/', '*', '-', '+'].includes(btn);
            const isEqual = btn === '=';
            return (
              <button
                key={btn}
                onClick={() => isEqual ? handleCalculate() : handleInput(btn)}
                className={`p-4 rounded-2xl text-2xl font-medium transition-all active:scale-95 shadow-sm ${
                  isEqual ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 shadow-lg' : 
                  isOperator ? 'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-semibold' :
                  'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-800'
                }`}
              >
                {btn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
