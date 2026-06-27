import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  lang: Language;
  onExit: () => void;
}

export function AgeCalculator({ lang, onExit }: Props) {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<{ years: number, months: number, days: number, totalDays: number } | null>(null);

  const calculateAge = () => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setAge({ years, months, days, totalDays });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
        <button onClick={onExit} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          {lang === 'ar' ? 'حساب العمر' : 'Age Calculator'}
        </h2>
        <div className="w-9" />
      </header>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>

          <button 
            onClick={calculateAge}
            disabled={!dob}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all font-medium"
          >
            {lang === 'ar' ? 'احسب' : 'Calculate'}
          </button>

          {age && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 border-t border-neutral-200 dark:border-neutral-700 space-y-4"
            >
              <div className="text-center space-y-1">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {age.years}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">
                  {lang === 'ar' ? 'سنة' : 'Years'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-center border border-neutral-100 dark:border-neutral-800">
                  <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{age.months}</div>
                  <div className="text-sm text-neutral-500">{lang === 'ar' ? 'شهر' : 'Months'}</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-center border border-neutral-100 dark:border-neutral-800">
                  <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{age.days}</div>
                  <div className="text-sm text-neutral-500">{lang === 'ar' ? 'يوم' : 'Days'}</div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{lang === 'ar' ? 'إجمالي الأيام' : 'Total Days'}</span>
                </div>
                <div className="font-mono font-bold text-blue-700 dark:text-blue-300">
                  {age.totalDays.toLocaleString()}
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
