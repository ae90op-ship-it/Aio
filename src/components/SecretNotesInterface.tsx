import React, { useState, useEffect } from 'react';
import { Language, ThemeMode, Note } from '../types';
import { ArrowLeft, Lock, Plus, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
}

export function SecretNotesInterface({ lang, theme, onBack }: Props) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('secretNotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    localStorage.setItem('secretNotes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    setActiveNote('new');
    setTitle('');
    setContent('');
  };

  const handleSaveNote = () => {
    if (!title.trim() && !content.trim()) return;

    if (activeNote === 'new') {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title || 'Untitled Secret',
        content,
        updatedAt: Date.now()
      };
      setNotes([newNote, ...notes]);
    } else {
      setNotes(notes.map(n => 
        n.id === activeNote ? { ...n, title: title || 'Untitled Secret', content, updatedAt: Date.now() } : n
      ));
    }
    setActiveNote(null);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote === id) setActiveNote(null);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 w-full max-w-lg mx-auto shadow-2xl relative text-neutral-200">
      <div className="flex items-center justify-between p-4 bg-neutral-950 border-b border-neutral-800 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={activeNote ? () => setActiveNote(null) : onBack}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-lg text-white">
              الملاحظات السرية
            </h2>
          </div>
        </div>
        {!activeNote && (
          <button onClick={handleCreateNote} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400">
            <Plus className="w-6 h-6" />
          </button>
        )}
        {activeNote && (
          <button onClick={handleSaveNote} className="p-2 rounded-full hover:bg-neutral-800 text-blue-400">
            <Save className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-black">
        <AnimatePresence mode="wait">
          {!activeNote ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {notes.length === 0 ? (
                <div className="text-center text-neutral-500 mt-20 flex flex-col items-center">
                  <Lock className="w-16 h-16 mb-4 opacity-20" />
                  <p>لا توجد ملاحظات سرية. الملاحظات هنا مشفرة محلياً.</p>
                </div>
              ) : (
                notes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => {
                      setActiveNote(note.id);
                      setTitle(note.title);
                      setContent(note.content);
                    }}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-900/50 cursor-pointer transition-colors group flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-bold text-white mb-1">{note.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{note.content}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="p-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="العنوان السري..."
                className="w-full bg-transparent border-none text-2xl font-bold text-white mb-4 placeholder-neutral-700 focus:outline-none"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب ملاحظتك السرية هنا..."
                className="w-full flex-1 bg-transparent border-none text-neutral-300 resize-none placeholder-neutral-700 focus:outline-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
