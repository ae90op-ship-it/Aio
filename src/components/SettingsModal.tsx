import React, { useState } from "react";
import { Language, ThemeMode, Note, TrashedNote } from "../types";
import { translations } from "../i18n";
import {
  X,
  Moon,
  Sun,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Droplets,
  TreePine,
  Sunset,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  lang: Language;
  theme: ThemeMode;
  trashedNotes: TrashedNote[];
  setTrashedNotes: React.Dispatch<React.SetStateAction<TrashedNote[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  isOpen: boolean;
  onClose: () => void;
  onChangeLanguage: (lang: Language) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onSecretCode: (code: string) => void;
}

export function SettingsModal({
  lang,
  theme,
  trashedNotes,
  setTrashedNotes,
  notes,
  setNotes,
  isOpen,
  onClose,
  onChangeLanguage,
  onChangeTheme,
  onSecretCode,
}: Props) {
  const t = translations[lang];
  const [secretCode, setSecretCode] = useState("");
  const [showTrash, setShowTrash] = useState(false);

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretCode) {
      onSecretCode(secretCode);
      setSecretCode("");
    }
  };

  const restoreNote = (id: string) => {
    const noteToRestore = trashedNotes.find((n) => n.id === id);
    if (noteToRestore) {
      const { deletedAt, ...rest } = noteToRestore;
      setNotes((prev) => [rest, ...prev]);
      setTrashedNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const permanentlyDeleteNote = (id: string) => {
    setTrashedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const emptyTrash = () => {
    setTrashedNotes([]);
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
            className="relative w-full max-w-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-neutral-300 dark:border-neutral-700 flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 z-10 sticky top-0">
              <div className="flex items-center gap-3">
                {showTrash ? (
                  <button
                    onClick={() => setShowTrash(false)}
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {lang === "ar" ? "← رجوع" : "← Back"}
                  </button>
                ) : (
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {t.settings}
                  </h2>
                )}
                {showTrash && (
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {lang === "ar" ? "سلة المهملات" : "Trash"}
                  </h2>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {showTrash ? (
                <div className="space-y-4">
                  {trashedNotes.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                      <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>
                        {lang === "ar"
                          ? "سلة المهملات فارغة"
                          : "Trash is empty"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={emptyTrash}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          {lang === "ar" ? "إفراغ السلة" : "Empty Trash"}
                        </button>
                      </div>
                      {trashedNotes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700"
                        >
                          <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate">
                            {note.title ||
                              (lang === "ar" ? "بدون عنوان" : "Untitled")}
                          </h3>
                          <p className="text-xs text-neutral-500 mb-3">
                            {new Date(note.deletedAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => restoreNote(note.id)}
                              className="flex-1 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <RotateCcw className="w-4 h-4" />
                              {lang === "ar" ? "استعادة" : "Restore"}
                            </button>
                            <button
                              onClick={() => permanentlyDeleteNote(note.id)}
                              className="flex-1 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              {lang === "ar" ? "حذف نهائي" : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">
                      {t.languageSettings}
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => onChangeLanguage("ar")}
                        className={`w-full p-3 rounded-xl text-start transition-all ${lang === "ar" ? "bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-transparent"}`}
                      >
                        العربية
                      </button>
                      <button
                        onClick={() => onChangeLanguage("en")}
                        className={`w-full p-3 rounded-xl text-start transition-all ${lang === "en" ? "bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-transparent"}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => onChangeLanguage("ja")}
                        className={`w-full p-3 rounded-xl text-start transition-all ${lang === "ja" ? "bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-transparent"}`}
                      >
                        日本語
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">
                      {t.themeToggle}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onChangeTheme("light")}
                        className={`flex-1 p-3 flex justify-center items-center gap-2 rounded-xl transition-all ${theme === "light" ? "bg-blue-500/20 border border-blue-500/50 text-blue-600" : "bg-white dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-transparent"}`}
                      >
                        <Sun className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onChangeTheme("dark")}
                        className={`flex-1 p-3 flex justify-center items-center gap-2 rounded-xl transition-all ${theme === "dark" ? "bg-blue-500/20 border border-blue-500/50 text-blue-400" : "bg-white dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-transparent"}`}
                      >
                        <Moon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onChangeTheme("ocean")}
                        className={`flex-1 p-3 flex justify-center items-center gap-2 rounded-xl transition-all ${theme === "ocean" ? "bg-blue-500/20 border border-blue-500/50 text-blue-400" : "bg-white dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-transparent"}`}
                      >
                        <Droplets className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onChangeTheme("forest")}
                        className={`flex-1 p-3 flex justify-center items-center gap-2 rounded-xl transition-all ${theme === "forest" ? "bg-blue-500/20 border border-blue-500/50 text-blue-400" : "bg-white dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-transparent"}`}
                      >
                        <TreePine className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onChangeTheme("sunset")}
                        className={`flex-1 p-3 flex justify-center items-center gap-2 rounded-xl transition-all ${theme === "sunset" ? "bg-blue-500/20 border border-blue-500/50 text-blue-400" : "bg-white dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-transparent"}`}
                      >
                        <Sunset className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setShowTrash(true)}
                      className="w-full p-3 flex items-center justify-between rounded-xl bg-white dark:bg-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-all text-neutral-800 dark:text-neutral-200"
                    >
                      <span className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        {lang === "ar" ? "سلة المهملات" : "Trash"}
                      </span>
                      {trashedNotes.length > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {trashedNotes.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">
                      {t.secretCode}
                    </p>
                    <form onSubmit={handleSecretSubmit} className="flex gap-2">
                      <input
                        type="password"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        placeholder={t.enterCode}
                        className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                        dir="ltr"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                      >
                        &rarr;
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
