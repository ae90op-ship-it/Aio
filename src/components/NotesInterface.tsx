import React, { useState } from 'react';
import { Language, Note, ThemeMode } from '../types';
import { translations } from '../i18n';
import { Plus, Settings, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  onOpenLauncher: () => void;
  onOpenSettings: () => void;
}

export function NotesInterface({ lang, theme, notes, setNotes, onOpenLauncher, onOpenSettings }: Props) {
  const t = translations[lang];
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const themeDisplay = theme === 'dark' ? (lang === 'ar' ? 'داكن' : lang === 'ja' ? 'ダーク' : 'Dark') : (lang === 'ar' ? 'فاتح' : lang === 'ja' ? 'ライト' : 'Light');
  const langDisplay = lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : '日本語';

  const handleAddNote = () => {
    setEditingNote({
      id: Date.now().toString(),
      title: '',
      content: '',
      date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'ja' ? 'ja-JP' : 'en-US'),
      updatedAt: Date.now()
    });
    setIsFormOpen(true);
  };

  const handleSaveNote = () => {
    if (!editingNote) return;
    
    setNotes(prev => {
      const exists = prev.find(n => n.id === editingNote.id);
      if (exists) {
        return prev.map(n => n.id === editingNote.id ? editingNote : n).sort((a, b) => b.updatedAt - a.updatedAt);
      }
      return [editingNote, ...prev];
    });
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full max-w-4xl mx-auto h-full min-h-screen bg-transparent text-neutral-900 dark:text-neutral-200">
      <header className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 opacity-80" dir="ltr">
            {`[${themeDisplay} | ${langDisplay} > ${t.notes}]`}
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {t.notes}
          </h1>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-all"
          aria-label={t.settings}
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 p-8 space-y-6">
        {notes.length === 0 && !isFormOpen && (
          <div className="text-center text-neutral-400 dark:text-neutral-500 mt-20">
            <p>{lang === 'ar' ? 'لا توجد ملاحظات. اضغط على الزر للإضافة.' : lang === 'en' ? 'No notes. Click the button to add.' : 'メモはありません。ボタンをクリックして追加してください。'}</p>
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
                onChange={e => setEditingNote({...editingNote, title: e.target.value})}
                placeholder={t.noteTitlePlaceholder}
                className="w-full bg-transparent text-xl font-semibold text-neutral-900 dark:text-white border-b border-neutral-300 dark:border-neutral-700 pb-2 focus:outline-none focus:border-blue-500 mb-4"
              />
              <textarea
                value={editingNote.content}
                onChange={e => setEditingNote({...editingNote, content: e.target.value})}
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

          {!isFormOpen && notes.map(note => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={note.id} 
              className="group bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] transition-all relative"
            >
              <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2" dir="ltr">
                <button onClick={() => handleDeleteNote(note.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all" title={t.deleteNote}>
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleEditNote(note)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-all" title={t.editNote}>
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{note.title || '...'}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4">{note.date}</p>
              <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{note.content}</p>
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
