import React from 'react';
import { Language, AppCategory } from '../types';
import { APPS } from '../data';
import { translations } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, ShieldCheck, Calendar, Compass, Calculator, Table, Folder, FileText, Wrench, Cpu, Image as ImageIcon, Video, Maximize, FileUp, Scan, Key, Activity, Battery } from 'lucide-react';

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

const IconMap: Record<string, React.ElementType> = {
  Clock, ShieldCheck, Calendar, Compass, Calculator, Table, Folder, FileText, Wrench, Cpu, Image: ImageIcon, Video, Maximize, FileUp, Scan, Key, Activity, Battery
};

export function AppLauncher({ lang, isOpen, onClose, onOpenApp }: Props) {
  const t = translations[lang];
  const categories: AppCategory[] = [
    'SYSTEM & UTILITIES',
    'PRODUCTIVITY & OFFICE',
    'MEDIA & SCANNING',
    'NETWORK & PASSWORDS'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
          />

          {/* Launcher Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] overflow-y-auto rounded-t-[2rem] sm:rounded-t-[3rem] p-6 sm:p-10 bg-neutral-900 border-t border-neutral-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-semibold text-white">
                  {t.menu}
                </h2>
                <button
                  onClick={onClose}
                  className="p-3 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-12 pb-20">
                {categories.map((category, catIdx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIdx * 0.1 }}
                    key={category}
                  >
                    <h3 className="text-sm font-semibold text-blue-400 mb-6 uppercase tracking-wider">
                      {t.categories[category]}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8">
                      {APPS.filter(app => app.category === category).map((app, idx) => {
                        const Icon = IconMap[app.icon] || Folder;
                        return (
                          <motion.button
                            key={app.id}
                            onClick={() => {
                              onClose();
                              onOpenApp(app.id);
                            }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: catIdx * 0.1 + idx * 0.02 }}
                            className="group flex flex-col items-center gap-3 text-center outline-none"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-neutral-800 text-neutral-300 rounded-2xl group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 border border-neutral-700/50 group-hover:border-blue-500/50">
                              <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                            </div>
                            <span className="text-xs sm:text-sm max-w-[80px] sm:max-w-full truncate whitespace-normal leading-tight text-neutral-400 group-hover:text-neutral-200 transition-colors">
                              {app.name[lang]}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
