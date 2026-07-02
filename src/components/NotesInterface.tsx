import React, { useState, useMemo } from "react";
import { Language, Note, ThemeMode } from "../types";
import { translations } from "../i18n";
import { APPS, getAppById } from "../data";
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
  Filter,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | "ALL">("ALL");
  const [editingTagNoteId, setEditingTagNoteId] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState("");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [notes]);

  const uniqueApps = useMemo(() => {
    const apps = new Set<string>();
    notes.forEach((n) => {
      if (n.appId && n.appId !== "notes") {
        apps.add(n.appId);
      } else {
        apps.add("notes");
      }
    });
    return Array.from(apps);
  }, [notes]);

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

  const handleDeleteNote = (note: Note) => {
    onTrashNote(note);
  };

  const handleEditNote = (note: Note) => {
    onOpenAppNote(note);
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    );
  };

  const handleAddTag = (e: React.FormEvent, noteId: string) => {
    e.preventDefault();
    if (!newTagValue.trim()) return;
    
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const tags = n.tags ? [...n.tags] : [];
          if (!tags.includes(newTagValue.trim())) {
            tags.push(newTagValue.trim());
          }
          return { ...n, tags };
        }
        return n;
      })
    );
    setNewTagValue("");
    setEditingTagNoteId(null);
  };

  const handleRemoveTag = (noteId: string, tagToRemove: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return { ...n, tags: n.tags?.filter(t => t !== tagToRemove) || [] };
        }
        return n;
      })
    );
  };

  const filteredAndSortedNotes = useMemo(() => {
    let result = notes.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? n.tags?.includes(selectedTag) : true;
      const appId = n.appId || "notes";
      const matchesApp = selectedApp === "ALL" ? true : appId === selectedApp;
      return matchesSearch && matchesTag && matchesApp;
    });

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
  }, [notes, searchQuery, sortBy, selectedTag, selectedApp]);

  const renderAppPreview = (note: Note) => {
    if (!note.appId || note.appId === "notes") {
      return (
        <div 
          className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 mt-2" 
          dangerouslySetInnerHTML={{ __html: note.content }} 
        />
      );
    }
    
    const { appId, appData } = note;
    if (!appData) return <p className="text-neutral-500 italic">{note.content}</p>;

    if (appId === "drawing") {
      return (
        <div className="mt-3 bg-white dark:bg-neutral-900 rounded-lg p-2 border border-neutral-200 dark:border-neutral-700">
          <img src={appData as unknown as string} alt="Drawing preview" className="w-full max-h-64 object-contain rounded-md" />
        </div>
      );
    }

    if (typeof appData === "string") {
      return (
        <pre className="mt-3 bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-lg font-mono text-sm whitespace-pre-wrap text-neutral-800 dark:text-neutral-300">
          {appData}
        </pre>
      );
    }

    if (appId === "spreadsheets" && Array.isArray(appData)) {
      return (
        <div className="mt-3 overflow-x-auto bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-2">
           <table className="w-full text-xs text-left border-collapse">
             <tbody>
               {appData.slice(0, 5).map((row: any, i: number) => (
                 <tr key={i}>
                   {Array.isArray(row) && row.slice(0, 5).map((cell: any, j: number) => (
                     <td key={j} className="border border-neutral-200 dark:border-neutral-800 p-1.5 truncate max-w-[100px]">{cell}</td>
                   ))}
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      );
    }

    return (
      <pre className="mt-3 bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap text-neutral-500 overflow-hidden max-h-32">
        {JSON.stringify(appData, null, 2)}
      </pre>
    );
  };

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
          
          <div className="relative flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl px-2">
            <Filter className="w-4 h-4 text-neutral-500 mr-1" />
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="bg-transparent border-none text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none py-2 cursor-pointer"
            >
              <option value="ALL">{lang === "ar" ? "جميع البرامج" : "All Apps"}</option>
              {uniqueApps.map(app => (
                <option key={app} value={app}>
                  {app === "notes" ? (lang === "ar" ? "الملاحظات" : "Notes") : getAppById(app)?.name[lang] || app}
                </option>
              ))}
            </select>
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

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTag === null ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
            >
              {lang === "ar" ? "الكل" : "All"}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTag === tag ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 p-8 space-y-6">
        {notes.length === 0 && (
          <div className="text-center text-neutral-400 dark:text-neutral-500 mt-20">
            <p>
              {lang === "ar"
                ? "لا توجد ملفات. استخدم قائمة البرامج للإضافة."
                : lang === "en"
                  ? "No files. Use the app launcher to add."
                  : "ファイルはありません。アプリランチャーを使用して追加してください。"}
            </p>
          </div>
        )}

        <AnimatePresence>
          {filteredAndSortedNotes.map((note) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={note.id}
                className={`group bg-white dark:bg-neutral-800/50 rounded-2xl p-6 border transition-all relative shadow-sm hover:shadow-md cursor-pointer ${note.isPinned ? "border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.1)]" : "border-neutral-200 dark:border-neutral-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/30"}`}
                onClick={() => handleEditNote(note)}
              >
                <div className="absolute top-4 left-4 flex gap-2" dir="ltr">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                    className={`p-2 rounded-full transition-all ${note.isPinned ? "text-yellow-500 hover:bg-yellow-500/10 bg-yellow-500/10" : "text-neutral-400 hover:text-yellow-500 hover:bg-yellow-500/10 bg-neutral-200/50 dark:bg-neutral-700/50"}`}
                  >
                    {note.isPinned ? (
                      <PinOff className="w-4 h-4" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note); }}
                    className="p-2 text-red-500 hover:bg-red-500/10 bg-red-500/10 rounded-full transition-all"
                    title={t.deleteNote}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-2 pl-24">
                  {note.appId && note.appId !== "notes" && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                      {getAppById(note.appId)?.name[lang] || note.appId}
                    </div>
                  )}
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    {note.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {note.title || "..."}
                  </h2>
                </div>
                
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4 pl-24">
                  {note.date}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags?.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded text-xs">
                      #{tag}
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(note.id, tag); }} className="hover:text-red-500 rounded-full">
                        <LucideIcons.X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  {editingTagNoteId === note.id ? (
                    <form onSubmit={(e) => handleAddTag(e, note.id)} className="inline-flex">
                      <input 
                        type="text" 
                        value={newTagValue}
                        onChange={(e) => setNewTagValue(e.target.value)}
                        placeholder="Tag..."
                        className="px-2 py-1 bg-white dark:bg-neutral-900 border border-blue-500 rounded text-xs w-20 focus:outline-none"
                        autoFocus
                        onBlur={() => setEditingTagNoteId(null)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </form>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingTagNoteId(note.id); setNewTagValue(""); }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <Plus className="w-3 h-3" /> {lang === "ar" ? "علامة" : "Tag"}
                    </button>
                  )}
                </div>

                {renderAppPreview(note)}
              </motion.div>
            ))}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
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
