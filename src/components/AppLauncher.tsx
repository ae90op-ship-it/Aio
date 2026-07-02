import React, { useState, useMemo } from "react";
import { Language } from "../types";
import { APPS } from "../data";
import { translations } from "../i18n";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Clock,
  ShieldCheck,
  Calendar,
  Compass,
  Calculator,
  Table,
  Folder,
  FileText,
  Wrench,
  Cpu,
  Image as ImageIcon,
  Video,
  Maximize,
  FileUp,
  Scan,
  Key,
  Activity,
  Battery,
  Palette,
  Zap,
  PlaySquare,
  Film,
  Music
} from "lucide-react";

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

const IconMap: Record<string, React.ElementType> = {
  Clock,
  ShieldCheck,
  Calendar,
  Compass,
  Calculator,
  Table,
  Folder,
  FileText,
  Wrench,
  Cpu,
  Image: ImageIcon,
  Video,
  Maximize,
  FileUp,
  Scan,
  Key,
  Activity,
  Battery,
  Palette,
  Zap,
  PlaySquare,
  Film,
  Music
};

export function AppLauncher({ lang, isOpen, onClose, onOpenApp }: Props) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<string>("ALL");
  
  // App Details Modal State
  const [detailsApp, setDetailsApp] = useState<string | null>(null);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (appId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setDetailsApp(appId);
    }, 600); // 600ms long press
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    setDetailsApp(appId);
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    APPS.forEach((app) => cats.add(app.category));
    return ["ALL", ...Array.from(cats)];
  }, []);

  const filteredApps = useMemo(() => {
    if (activeTab === "ALL") return APPS;
    return APPS.filter((app) => app.category === activeTab);
  }, [activeTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Grid Pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative h-full flex flex-col p-8 md:p-12 max-w-4xl mx-auto pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {lang === "ar" ? "قائمة البرامج" : t.menu}
              </h2>
              <button
                onClick={onClose}
                className="p-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dynamic Categories Tab Bar */}
            <div className="pointer-events-auto flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === cat
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg"
                      : "bg-white/50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50"
                  }`}
                >
                  {cat === "ALL" ? (lang === "ar" ? "الكل" : "All") : cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pointer-events-auto pb-20 scrollbar-hide">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={activeTab}
                className="grid grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredApps.map((app, idx) => {
                    const Icon = IconMap[app.icon] || Folder;
                    return (
                      <motion.button
                        key={app.id}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ delay: idx * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                        onPointerDown={() => handlePointerDown(app.id)}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onContextMenu={(e) => handleContextMenu(e, app.id)}
                        onClick={() => {
                          if (detailsApp) return;
                          onClose();
                          onOpenApp(app.id);
                        }}
                        className="group relative flex flex-col items-center justify-center p-6 text-center outline-none bg-white/60 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800/50 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 aspect-square overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-colors pointer-events-none" />
                        
                        <div className="w-16 h-16 mb-4 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                          <Icon className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        
                        <span className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-tight pointer-events-none">
                          {app.name[lang]}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
            
            {/* App Details Modal */}
            <AnimatePresence>
              {detailsApp && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto px-4" onClick={() => setDetailsApp(null)}>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="relative bg-white dark:bg-neutral-900 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center"
                  >
                    {(() => {
                      const app = APPS.find(a => a.id === detailsApp);
                      if (!app) return null;
                      const Icon = IconMap[app.icon] || Folder;
                      const index = APPS.findIndex(a => a.id === detailsApp) + 1;
                      const hasSecret = app.id === 'calculator'; // Only calculator has secret codes
                      
                      return (
                        <>
                          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                            <Icon className="w-10 h-10" />
                          </div>
                          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{app.name[lang]}</h3>
                          <span className="text-xs font-bold tracking-widest text-neutral-400 dark:text-neutral-500 mb-6 uppercase">
                            {lang === 'ar' ? 'برنامج رقم' : 'App Index'} #{index.toString().padStart(2, '0')}
                          </span>
                          
                          <div className="w-full text-left mb-6 p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
                            <span className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase">
                              {lang === 'ar' ? 'وظيفة البرنامج' : 'Description'}
                            </span>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                              {app.description[lang]}
                            </p>
                          </div>
                          
                          <div className={`w-full flex items-center gap-3 p-4 rounded-xl border ${hasSecret ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50' : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-100 dark:border-neutral-800'}`}>
                            {hasSecret ? <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" /> : <X className="w-5 h-5 text-neutral-400 shrink-0" />}
                            <div className="text-left">
                              <span className={`block text-sm font-semibold ${hasSecret ? 'text-indigo-900 dark:text-indigo-300' : 'text-neutral-700 dark:text-neutral-400'}`}>
                                {lang === 'ar' ? (hasSecret ? 'يحتوي على أكواد سرية' : 'لا توجد أكواد سرية') : (hasSecret ? 'Contains Secret Codes' : 'No Secret Codes')}
                              </span>
                            </div>
                          </div>
                          
                          <button onClick={() => setDetailsApp(null)} className="mt-8 w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                            {lang === 'ar' ? 'إغلاق' : 'Close'}
                          </button>
                        </>
                      );
                    })()}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
