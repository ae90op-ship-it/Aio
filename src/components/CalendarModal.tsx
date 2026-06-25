import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ lang, isOpen, onClose }: Props) {
  const t = translations[lang];
  const [currentDate, setCurrentDate] = useState(new Date());

  const getHijriDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return 'غير متوفر';
    }
  };

  const getGregorianDate = (date: Date) => {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : lang === 'ja' ? 'ja-JP' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/50 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-300 dark:border-neutral-700 flex items-center justify-between bg-white dark:bg-neutral-800">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">التقويم | Calendar</h2>
              <button 
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8 text-center bg-neutral-50 dark:bg-neutral-900/50">
              
              <div className="flex items-center justify-between mb-4">
                <button onClick={lang === 'ar' ? handleNextDay : handlePrevDay} className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={handleToday} className="px-4 py-1 text-sm bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                  {lang === 'ar' ? 'اليوم' : 'Today'}
                </button>
                <button onClick={lang === 'ar' ? handlePrevDay : handleNextDay} className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">التقويم الهجري</h3>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" dir="rtl">
                  {getHijriDate(currentDate)}
                </div>
              </div>

              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800 my-4" />

              <div className="space-y-2">
                <h3 className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Gregorian Calendar</h3>
                <div className="text-xl font-medium text-neutral-800 dark:text-neutral-200">
                  {getGregorianDate(currentDate)}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
