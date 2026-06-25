import React, { useState } from 'react';
import { Language, ThemeMode } from '../types';
import { translations } from '../i18n';
import { X, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  version: string;
  isOpen: boolean;
  onClose: () => void;
  onChangeLanguage: (lang: Language) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onSecretCode: (code: string) => void;
}

export function SettingsModal({ lang, theme, version, isOpen, onClose, onChangeLanguage, onChangeTheme, onSecretCode }: Props) {
  const t = translations[lang];
  const [secretCode, setSecretCode] = useState('');

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretCode) {
      onSecretCode(secretCode);
      setSecretCode('');
    }
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
            className="relative w-full max-w-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{t.settings}</h2>
              <button 
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">{t.languageSettings}</p>
                <div className="space-y-2">
                  <button
                    onClick={() => onChangeLanguage('ar')}
                    className={`w-full p-3 rounded-xl text-start transition-all ${lang === 'ar' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-transparent'}`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => onChangeLanguage('en')}
                    className={`w-full p-3 rounded-xl text-start transition-all ${lang === 'en' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-transparent'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onChangeLanguage('ja')}
                    className={`w-full p-3 rounded-xl text-start transition-all ${lang === 'ja' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-transparent'}`}
                  >
                    日本語
                  </button>
                </div>
              </div>

              <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">{t.themeToggle}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onChangeTheme('light')}
                    className={`flex-1 p-3 flex justify-center items-center gap-2 rounded-xl transition-all ${theme === 'light' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-600' : 'bg-white dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-transparent'}`}
                  >
                    <Sun className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onChangeTheme('dark')}
                    className={`flex-1 p-3 flex justify-center items-center gap-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' : 'bg-white dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-transparent'}`}
                  >
                    <Moon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">{t.secretCode}</p>
                <form onSubmit={handleSecretSubmit} className="flex gap-2">
                  <input
                    type="password"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder={t.enterCode}
                    className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
                    &rarr;
                  </button>
                </form>
              </div>

              <div className="text-center pt-4 border-t border-neutral-300 dark:border-neutral-700">
                <p className="text-neutral-400 dark:text-neutral-500 text-xs font-mono">{t.appVersion}: {version}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
