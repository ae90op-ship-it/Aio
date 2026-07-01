import React, { useState, useEffect } from "react";
import { Language } from "../types";
import { translations } from "../i18n";
import { ArrowLeft, Save } from "lucide-react";

interface Props {
  lang: Language;
  onBack: () => void;
  initialData?: any;
  onSaveNote?: (title: string, data: any) => void;
}

export function TextNoteApp({ lang, onBack, initialData, onSaveNote }: Props) {
  const t = translations[lang];
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");

  const handleSave = () => {
    if (onSaveNote) {
      onSaveNote(title || (lang === "ar" ? "ملاحظة جديدة" : "New Note"), { title, content });
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          {t.notes}
        </h2>
        <div className="flex gap-2">
          {onSaveNote && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveNote}</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.noteTitlePlaceholder}
          className="w-full bg-transparent text-2xl font-bold text-neutral-900 dark:text-white border-none focus:outline-none focus:ring-0"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.noteContentPlaceholder}
          className="w-full flex-1 bg-transparent text-lg text-neutral-700 dark:text-neutral-300 border-none focus:outline-none focus:ring-0 resize-none"
        />
      </main>

      <footer className="p-2 px-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex gap-4">
          <span>{wordCount} {lang === 'ar' ? 'كلمات' : 'words'}</span>
          <span>{charCount} {lang === 'ar' ? 'حروف' : 'characters'}</span>
        </div>
      </footer>
    </div>
  );
}
