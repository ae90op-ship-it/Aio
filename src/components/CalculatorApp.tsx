import React, { useState } from 'react';
import { Language, ThemeMode } from '../types';
import { evaluate } from 'mathjs';
import { ArrowLeft, Delete, Equal, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
}

export function CalculatorApp({ lang, onBack }: Props) {
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
    try {
      const res = evaluate(input);
      setResult(String(res));
    } catch (e) {
      setResult('Error');
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
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full max-w-lg mx-auto shadow-2xl relative">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg text-neutral-800 dark:text-white">
            {isAdvanced ? 'Casio 991EX (Advanced)' : 'الآلة الحاسبة'}
          </h2>
        </div>
        <button
          onClick={() => setIsAdvanced(!isAdvanced)}
          className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-medium ${isAdvanced ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-end items-end p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-inner border border-neutral-200 dark:border-neutral-700 font-mono overflow-hidden">
          <div className="text-xl text-neutral-500 dark:text-neutral-400 break-all w-full text-right min-h-[1.75rem]">
            {input}
          </div>
          <div className="text-4xl font-bold text-neutral-900 dark:text-white mt-2 break-all w-full text-right min-h-[2.5rem]">
            {result}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleClear} className="col-span-2 p-4 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold text-lg transition-colors">AC</button>
          <button onClick={handleDelete} className="col-span-2 p-4 flex items-center justify-center rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"><Delete className="w-6 h-6" /></button>

          <AnimatePresence>
            {isAdvanced && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="col-span-4 grid grid-cols-4 gap-2 mb-2"
              >
                {advancedButtons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleInput(btn)}
                    className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-sm font-medium transition-colors"
                  >
                    {btn}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {basicButtons.map((btn) => (
            <button
              key={btn}
              onClick={() => btn === '=' ? handleCalculate() : handleInput(btn)}
              className={`p-4 rounded-xl text-xl font-bold transition-colors shadow-sm ${
                btn === '=' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 
                ['/', '*', '-', '+'].includes(btn) ? 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200' :
                'bg-white hover:bg-neutral-50 dark:bg-neutral-800/50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
