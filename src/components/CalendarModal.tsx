import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { X, ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ lang, isOpen, onClose }: Props) {
  const t = translations[lang];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'day' | 'month'>('day');
  
  const [calendarNotes, setCalendarNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('calendarNotes');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('calendarNotes', JSON.stringify(calendarNotes));
  }, [calendarNotes]);

  const getDateKey = (d: Date) => {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  const currentKey = getDateKey(currentDate);

  const getHijriDay = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric' }).format(date);
    } catch {
      return '';
    }
  };

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

  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = getDateKey(date) === getDateKey(new Date());
      const hasNote = !!calendarNotes[getDateKey(date)];
      const noteContent = calendarNotes[getDateKey(date)];

      grid.push(
        <div 
          key={d} 
          onClick={() => {
            setCurrentDate(date);
            setViewType('day');
          }}
          title={noteContent ? noteContent.substring(0, 50) + (noteContent.length > 50 ? '...' : '') : ''}
          className={`relative p-2 flex flex-col items-center justify-center rounded-lg border cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 ${isToday ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'} ${hasNote ? 'ring-2 ring-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.4)] border-transparent' : ''}`}
        >
          <span className={`text-sm font-bold ${hasNote ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-800 dark:text-neutral-200'}`}>{d}</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-serif">{getHijriDay(date)}</span>
          {hasNote && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>}
        </div>
      );
    }
    return grid;
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
            className="relative w-full max-w-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 border-b border-neutral-300 dark:border-neutral-700 flex items-center justify-between bg-white dark:bg-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">التقويم</h2>
                <button
                  onClick={() => setViewType(v => v === 'day' ? 'month' : 'day')}
                  className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 text-center bg-neutral-50 dark:bg-neutral-900/50 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={viewType === 'day' ? (lang === 'ar' ? handleNextDay : handlePrevDay) : (lang === 'ar' ? handleNextMonth : handlePrevMonth)} 
                  className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={handleToday} className="px-4 py-1 text-sm bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                  {lang === 'ar' ? 'اليوم' : 'Today'}
                </button>
                <button 
                  onClick={viewType === 'day' ? (lang === 'ar' ? handlePrevDay : handleNextDay) : (lang === 'ar' ? handlePrevMonth : handleNextMonth)} 
                  className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {viewType === 'day' ? (
                <div className="space-y-6">
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

                  <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800 my-4" />

                  <div className="text-left flex flex-col h-[200px]" dir="auto">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {lang === 'ar' ? 'مركز التذكيرات السريعة' : 'Quick-Memo Reminder Hub'}
                      </h3>
                      {calendarNotes[currentKey] && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-1 rounded-full font-bold">
                          {lang === 'ar' ? 'نشط' : 'Active'}
                        </span>
                      )}
                    </div>
                    <div className="relative flex-1 group">
                      <textarea
                        value={calendarNotes[currentKey] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            setCalendarNotes({ ...calendarNotes, [currentKey]: val });
                          } else {
                            const newNotes = { ...calendarNotes };
                            delete newNotes[currentKey];
                            setCalendarNotes(newNotes);
                          }
                        }}
                        placeholder={lang === 'ar' ? "أضف ملاحظة أو تذكير مخصص لهذا اليوم..." : "Add a custom note or reminder for this day..."}
                        className="w-full h-full p-4 bg-white dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm group-hover:shadow-md"
                      />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <CalendarIcon className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">
                    {currentDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {renderMonthGrid()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
