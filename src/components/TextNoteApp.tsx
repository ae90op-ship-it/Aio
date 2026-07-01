import React, { useState, useEffect, useCallback, useRef } from "react";
import { Language } from "../types";
import { translations } from "../i18n";
import { 
  ArrowLeft, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Download,
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  lang: Language;
  onBack: () => void;
  initialData?: any;
  onSaveNote?: (title: string, data: any) => void;
}

const COMMON_TYPOS: Record<string, string> = {
  "teh": "the",
  "dont": "don't",
  "wont": "won't",
  "cant": "can't",
  "im": "I'm",
  "its": "it's",
  "taht": "that",
  "alot": "a lot",
  "recieve": "receive",
  "beleive": "believe"
};

export function TextNoteApp({ lang, onBack, initialData, onSaveNote }: Props) {
  const t = translations[lang];
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Initialize content on first load
  useEffect(() => {
    if (editorRef.current && initialData?.content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialData.content;
    }
  }, [initialData]);

  const handleSave = useCallback(() => {
    if (onSaveNote) {
      const currentContent = editorRef.current?.innerHTML || "";
      onSaveNote(title || (lang === "ar" ? "ملاحظة جديدة" : "New Note"), { title, content: currentContent });
      setLastSaved(new Date());
      setContent(currentContent);
    }
  }, [onSaveNote, title, lang]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [handleSave]);

  const execCmd = (cmd: string, value: string = "") => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertCheckbox = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const html = `<input type="checkbox" id="${id}" style="margin: 0 8px; cursor: pointer; transform: scale(1.2);" />&nbsp;`;
    execCmd("insertHTML", html);
  };

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const exportAsPDF = async () => {
    setShowExportMenu(false);
    if (!editorRef.current) return;
    const canvas = await html2canvas(editorRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Add some margin
    const margin = 10;
    const effectiveWidth = pdfWidth - margin * 2;
    const pdfHeight = (canvas.height * effectiveWidth) / canvas.width;
    
    // Also print title
    pdf.setFontSize(18);
    pdf.text(title || (lang === "ar" ? "ملاحظة" : "Note"), margin, margin + 5);
    
    pdf.addImage(imgData, "PNG", margin, margin + 15, effectiveWidth, pdfHeight);
    pdf.save(`${title || "Note"}.pdf`);
  };

  const exportAsTXT = () => {
    setShowExportMenu(false);
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;
    const fullText = `${title}\n\n${text}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "Note"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = editorRef.current?.innerText.trim() ? editorRef.current.innerText.trim().split(/\s+/).length : 0;
  const charCount = editorRef.current?.innerText.length || 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col hidden sm:flex">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {t.notes}
            </h2>
            {lastSaved && (
              <span className="text-[10px] text-neutral-500">
                {lang === "ar" ? "آخر حفظ: " : "Saved: "} 
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-neutral-800 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex-1 max-w-2xl justify-center">
          <button onClick={() => execCmd("bold")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
          <button onClick={() => execCmd("italic")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
          <button onClick={() => execCmd("underline")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Underline"><Underline className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />
          <button onClick={() => execCmd("justifyLeft")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
          <button onClick={() => execCmd("justifyCenter")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
          <button onClick={() => execCmd("justifyRight")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Align Right"><AlignRight className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />
          <button onClick={() => execCmd("insertUnorderedList")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Bullets"><List className="w-4 h-4" /></button>
          <button onClick={() => execCmd("insertOrderedList")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Numbers"><ListOrdered className="w-4 h-4" /></button>
          <button onClick={insertCheckbox} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300 transition-colors" title="Checkbox"><CheckSquare className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />
          <select onChange={(e) => execCmd("fontSize", e.target.value)} className="bg-transparent text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer p-1">
            <option value="1">Small</option>
            <option value="3" defaultValue="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
          </select>
          <input type="color" onChange={(e) => execCmd("foreColor", e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent" title="Text Color" />
        </div>

        <div className="flex gap-2 items-center relative">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-full transition-colors"
              title={lang === "ar" ? "تصدير" : "Export"}
            >
              <Download className="w-5 h-5" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-50">
                <button onClick={exportAsPDF} className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {lang === "ar" ? "تصدير كملف PDF" : "Export as PDF"}
                </button>
                <button onClick={exportAsTXT} className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {lang === "ar" ? "تصدير كملف نصي" : "Export as TXT"}
                </button>
              </div>
            )}
          </div>
          {onSaveNote && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{t.saveNote}</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-10 flex flex-col gap-6 overflow-y-auto items-center">
        <div className="w-full max-w-3xl flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.noteTitlePlaceholder}
            className="w-full bg-transparent text-3xl font-bold text-neutral-900 dark:text-white border-b border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 pb-2 focus:outline-none transition-colors"
          />
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full min-h-[50vh] focus:outline-none text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed outline-none"
            style={{ paddingBottom: '50px' }}
          />
        </div>
      </main>

      <footer className="p-2 px-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex gap-4">
          <span>{wordCount} {lang === 'ar' ? 'كلمات' : 'words'}</span>
          <span>{charCount} {lang === 'ar' ? 'حروف' : 'characters'}</span>
        </div>
      </footer>
    </div>
  );
}
