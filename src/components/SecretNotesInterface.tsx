import React, { useState } from 'react';
import { Language, ThemeMode, Note } from '../types';
import { ArrowLeft, Trash2, Edit3, Plus } from 'lucide-react';
import { translations } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBackToNotes: () => void;
}

export function SecretNotesInterface({ lang, theme, onBackToNotes }: Props) {
  const t = translations[lang];
  const [secretNotes, setSecretNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('secretNotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleSave = () => {
    if (!editingNote) return;
    setSecretNotes(prev => {
      const newNotes = prev.find(n => n.id === editingNote.id)
        ? prev.map(n => n.id === editingNote.id ? editingNote : n)
        : [editingNote, ...prev];
      localStorage.setItem('secretNotes', JSON.stringify(newNotes));
      return newNotes;
    });
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleDelete = (id: string) => {
    setSecretNotes(prev => {
      const newNotes = prev.filter(n => n.id !== id);
      localStorage.setItem('secretNotes', JSON.stringify(newNotes));
      return newNotes;
    });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-red-900/30 bg-neutral-900">
        <button onClick={onBackToNotes} className="p-2 hover:bg-neutral-800 rounded-full text-red-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-red-500 font-mono">
          {lang === 'ar' ? 'مساحة سرية' : 'Secret Space'}
        </h2>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        <AnimatePresence>
          {isFormOpen && editingNote ? (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-neutral-900 rounded-xl p-6 border border-red-900/50">
              <input
                type="text"
                value={editingNote.title}
                onChange={e => setEditingNote({...editingNote, title: e.target.value})}
                placeholder={lang === 'ar' ? 'العنوان' : 'Title'}
                className="w-full bg-transparent text-xl font-semibold text-white border-b border-red-900/50 pb-2 focus:outline-none focus:border-red-500 mb-4"
              />
              <textarea
                value={editingNote.content}
                onChange={e => setEditingNote({...editingNote, content: e.target.value})}
                placeholder={lang === 'ar' ? 'المحتوى' : 'Content'}
                className="w-full bg-transparent text-neutral-300 min-h-[150px] resize-none focus:outline-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-neutral-400 hover:bg-neutral-800 rounded-xl transition-all">
                  {t.cancel}
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-all">
                  {t.saveNote}
                </button>
              </div>
            </motion.div>
          ) : (
            secretNotes.map(note => (
              <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-neutral-900 rounded-xl p-6 border border-red-900/30">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingNote(note); setIsFormOpen(true); }} className="p-2 text-blue-500 hover:bg-neutral-800 rounded-full"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(note.id)} className="p-2 text-red-500 hover:bg-neutral-800 rounded-full"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-neutral-300 whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-neutral-600 mt-4">{note.date}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {!isFormOpen && (
        <button
          onClick={() => {
            setEditingNote({ id: Date.now().toString(), title: '', content: '', date: new Date().toLocaleDateString(), updatedAt: Date.now(), isPinned: false });
            setIsFormOpen(true);
          }}
          className="absolute bottom-8 right-8 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
