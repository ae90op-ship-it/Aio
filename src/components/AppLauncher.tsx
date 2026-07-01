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
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] overflow-y-auto rounded-t-[2rem] sm:rounded-t-[3rem] p-6 sm:p-10 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-6xl mx-auto">
              {/* Dynamic Categories Tab Bar */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      activeTab === cat
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {cat === "ALL" ? (lang === "ar" ? "الكل" : "All") : cat}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white">{lang === "ar" ? "قائمة البرامج" : t.menu}</h2>
                <button
                  onClick={onClose}
                  className="p-3 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="pb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={activeTab}
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8"
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
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => {
                            onClose();
                            onOpenApp(app.id);
                          }}
                          className="group flex flex-col items-center gap-3 text-center outline-none"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 rounded-2xl group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 border dark:border-neutral-700/50 group-hover:border-blue-500/50">
                            <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                          </div>
                          <span className="text-xs sm:text-sm max-w-[80px] sm:max-w-full truncate whitespace-normal leading-tight text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200 transition-colors">
                            {app.name[lang]}
                          </span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
