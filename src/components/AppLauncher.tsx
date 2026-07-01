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
            className="relative h-full flex flex-col p-8 md:p-16 max-w-[1400px] mx-auto pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center justify-between mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {lang === "ar" ? "قائمة البرامج" : t.menu}
              </h2>
              <button
                onClick={onClose}
                className="p-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-full transition-all"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Dynamic Categories Tab Bar */}
            <div className="pointer-events-auto flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all ${
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
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
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
                        onClick={() => {
                          onClose();
                          onOpenApp(app.id);
                        }}
                        className="group relative flex flex-col items-center justify-center p-6 text-center outline-none bg-white/60 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800/50 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 aspect-square overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-colors" />
                        
                        <div className="w-16 h-16 mb-4 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        
                        <span className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-tight">
                          {app.name[lang]}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
