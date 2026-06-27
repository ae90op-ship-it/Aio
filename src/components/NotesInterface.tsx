import React, { useState, useMemo } from "react";
import { Language, Note, ThemeMode } from "../types";
import { translations } from "../i18n";
import {
  Plus,
  Settings,
  Edit3,
  Trash2,
  Search,
  Pin,
  PinOff,
  Calendar as CalendarIcon,
  Type,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  lang: Language;
  theme: ThemeMode;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  onTrashNote: (note: Note) => void;
  onOpenLauncher: () => void;
  onOpenSettings: () => void;
  onOpenCalendar: () => void;
  onOpenAppNote: (note: Note) => void;
}

export function NotesInterface({
  lang,
  theme,
  notes,
  setNotes,
  onTrashNote,
  onOpenLauncher,
  onOpenSettings,
  onOpenCalendar,
  onOpenAppNote,
}: Props) {
  const t = translations[lang];

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");

  const themeDisplay =
    theme === "dark"
      ? lang === "ar"
        ? "داكن"
        : lang === "ja"
          ? "ダーク"
          : "Dark"
      : lang === "ar"
        ? "فاتح"
        : lang === "ja"
          ? "ライト"
          : "Light";
  const langDisplay =
    lang === "ar" ? "العربية" : lang === "en" ? "English" : "日本語";

  const handleAddNote = () => {
    setEditingNote({
      id: Date.now().toString(),
      title: "",
      content: "",
      date: new Date().toLocaleDateString(
        lang === "ar" ? "ar-EG" : lang === "ja" ? "ja-JP" : "en-US",
      ),
      updatedAt: Date.now(),
      isPinned: false,
    });
    setIsFormOpen(true);
  };

  const handleSaveNote = () => {
    if (!editingNote) return;

    setNotes((prev) => {
      const exists = prev.find((n) => n.id === editingNote.id);
      if (exists) {
        return prev.map((n) => (n.id === editingNote.id ? editingNote : n));
      }
      return [editingNote, ...prev];
    });
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (note: Note) => {
    onTrashNote(note);
  };

  const handleEditNote = (note: Note) => {
    if (note.appId) {
      onOpenAppNote(note);
    } else {
      setEditingNote(note);
      setIsFormOpen(true);
    }
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    );
  };

  const filteredAndSortedNotes = useMemo(() => {
    let result = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === "date") {
        return b.updatedAt - a.updatedAt;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [notes, searchQuery, sortBy]);

  return (
    <div className="flex-1 flex flex-col relative w-full max-w-4xl mx-auto h-full min-h-screen bg-transparent text-neutral-900 dark:text-neutral-200">
      <header className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div
              className="text-xs font-mono text-neutral-500 dark:text-neutral-400 opacity-80"
              dir="ltr"
            >
              {`[${themeDisplay} | ${langDisplay} > ${t.notes}]`}
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {t.notes}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCalendar}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-all"
              aria-label="Calendar"
            >
              📅
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-all"
              aria-label={t.settings}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={lang === "ar" ? "بحث..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setSortBy(sortBy === "date" ? "title" : "date")}
            className="p-2 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-300 transition-colors"
            title={lang === "ar" ? "فرز" : "Sort"}
          >
            {sortBy === "date" ? (
              <CalendarIcon className="w-4 h-4" />
            ) : (
              <Type className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-6">
        {notes.length === 0 && !isFormOpen && (
          <div className="text-center text-neutral-400 dark:text-neutral-500 mt-20">
            <p>
              {lang === "ar"
                ? "لا توجد ملاحظات. اضغط على الزر للإضافة."
                : lang === "en"
                  ? "No notes. Click the button to add."
                  : "メモはありません。ボタンをクリックして追加してください。"}
            </p>
          </div>
        )}

        <AnimatePresence>
          {isFormOpen && editingNote && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)] mb-8"
            >
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, title: e.target.value })
                }
                placeholder={t.noteTitlePlaceholder}
                className="w-full bg-transparent text-xl font-semibold text-neutral-900 dark:text-white border-b border-neutral-300 dark:border-neutral-700 pb-2 focus:outline-none focus:border-blue-500 mb-4"
              />
              <textarea
                value={editingNote.content}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, content: e.target.value })
                }
                placeholder={t.noteContentPlaceholder}
                className="w-full bg-transparent text-neutral-700 dark:text-neutral-300 min-h-[150px] resize-none focus:outline-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all"
                >
                  {t.saveNote}
                </button>
              </div>
            </motion.div>
          )}

          {!isFormOpen &&
            filteredAndSortedNotes.map((note) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={note.id}
                className={`group bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 border transition-all relative ${note.isPinned ? "border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.1)]" : "border-neutral-200 dark:border-neutral-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/30"}`}
              >
                <div className="absolute top-4 end-4 flex gap-2" dir="ltr">
                  <button
                    onClick={() => togglePin(note.id)}
                    className={`p-2 rounded-full transition-all ${note.isPinned ? "text-yellow-500 hover:bg-yellow-500/10 bg-yellow-500/10" : "text-neutral-400 hover:text-yellow-500 hover:bg-yellow-500/10 bg-neutral-200/50 dark:bg-neutral-700/50"}`}
                  >
                    {note.isPinned ? (
                      <PinOff className="w-4 h-4" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note)}
                    className="p-2 text-red-500 hover:bg-red-500/10 bg-red-500/10 rounded-full transition-all"
                    title={t.deleteNote}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-2 text-blue-500 hover:bg-blue-500/10 bg-blue-500/10 rounded-full transition-all"
                    title={t.editNote}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 pr-24 sm:pr-36 flex items-center gap-2">
                  {note.isPinned && (
                    <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {note.title || "..."}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                  {note.date}
                </p>

                {note.appId ? (
                  <div className="mt-4 flex flex-col gap-2">
                    {note.appId === "drawing" && note.appData && (
                      <div className="bg-white dark:bg-neutral-900 rounded-lg p-2 border border-neutral-200 dark:border-neutral-700">
                        <img
                          src={note.appData}
                          alt="Drawing preview"
                          className="w-full h-48 object-contain rounded-md"
                        />
                      </div>
                    )}
                    <div
                      className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      onClick={() => onOpenAppNote(note)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                            {lang === "ar" ? "فتح في التطبيق" : "Open in App"}
                          </h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {note.appId === "drawing"
                              ? lang === "ar"
                                ? "الرسم"
                                : "Drawing"
                              : note.appId === "spreadsheets"
                                ? lang === "ar"
                                  ? "الجداول"
                                  : "Spreadsheets"
                                : note.appId}
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                        {lang === "ar" ? "فتح" : "Open"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                    {note.content}
                  </p>
                )}
              </motion.div>
            ))}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        {!isFormOpen && (
          <button
            onClick={handleAddNote}
            className="flex items-center justify-center w-12 h-12 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
            title={t.addNote}
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onOpenLauncher}
          className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 transition-all duration-300"
          aria-label={t.menu}
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
