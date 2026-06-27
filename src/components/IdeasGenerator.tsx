import React, { useState } from 'react';
import { Language } from '../types';
import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  onExit: () => void;
}

const IDEAS_AR = [
  'تطبيق لتتبع العادات اليومية مع شخصيات افتراضية تكبر',
  'منصة لتبادل الكتب المستعملة في مدينتك',
  'أداة تلخيص مقاطع يوتيوب الطويلة باستخدام الذكاء الاصطناعي',
  'لعبة تعليمية لتعلم البرمجة من خلال حل الألغاز',
  'تطبيق يساعد على تنظيم الوجبات وتقليل هدر الطعام',
  'موقع يجمع المطورين المبتدئين لبناء مشاريع مفتوحة المصدر',
  'نظام ذكي لتتبع مصاريف السفر وتقسيمها مع الأصدقاء',
  'تطبيق يعلمك كلمات جديدة أثناء تصفحك للإنترنت'
];

const IDEAS_EN = [
  'Habit tracker with virtual pets that grow as you succeed',
  'Local used book exchange platform',
  'AI tool that summarizes long YouTube videos',
  'Educational game that teaches coding through puzzles',
  'App to organize meals and reduce food waste',
  'Platform connecting junior devs to build open source projects',
  'Smart system for tracking and splitting travel expenses',
  'App that teaches new vocabulary while browsing the web'
];

export function IdeasGenerator({ lang, onExit }: Props) {
  const [idea, setIdea] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const generateIdea = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const list = lang === 'ar' ? IDEAS_AR : IDEAS_EN;
      const random = list[Math.floor(Math.random() * list.length)];
      setIdea(random);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
        <button onClick={onExit} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          {lang === 'ar' ? 'مولد الأفكار' : 'Ideas Generator'}
        </h2>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg space-y-8 flex flex-col items-center">
          
          <div className="relative w-full aspect-[16/9] bg-white dark:bg-neutral-800 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8 flex items-center justify-center text-center overflow-hidden">
            <AnimatePresence mode="wait">
              {idea ? (
                <motion.div
                  key={idea}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  className="text-xl sm:text-2xl font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed"
                >
                  {idea}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-neutral-400 dark:text-neutral-500 flex flex-col items-center gap-4"
                >
                  <Sparkles className="w-12 h-12 opacity-50" />
                  <p>{lang === 'ar' ? 'اضغط على الزر لتوليد فكرة جديدة' : 'Click the button to generate a new idea'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={generateIdea}
            disabled={isAnimating}
            className="group relative px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            <Lightbulb className={`w-6 h-6 ${isAnimating ? 'animate-bounce text-yellow-400' : ''}`} />
            {lang === 'ar' ? 'ألهمني' : 'Inspire Me'}
          </button>

        </div>
      </div>
    </div>
  );
}
