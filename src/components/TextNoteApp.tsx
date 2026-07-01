import React, { useState, useEffect, useCallback, useRef } from "react";
import { Language } from "../types";
import { translations } from "../i18n";
import { ArrowLeft, Save, Download, FileText, FileDown, ChevronDown, Volume2, Square } from "lucide-react";
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
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = (title + ".\n" + content).trim();
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = useCallback(() => {
    if (onSaveNote) {
      onSaveNote(title || (lang === "ar" ? "ملاحظة جديدة" : "New Note"), { title, content });
      setLastSaved(new Date());
    }
  }, [onSaveNote, title, content, lang]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [handleSave]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newContent = e.target.value;
    
    // Autocorrect logic (trigger on space)
    if (newContent.length > content.length && newContent.endsWith(" ")) {
      const words = newContent.split(" ");
      const lastWord = words[words.length - 2]; // because it ends with space
      
      if (lastWord) {
        const lowerWord = lastWord.toLowerCase();
        if (COMMON_TYPOS[lowerWord]) {
          // Preserve case of first letter if it was capitalized
          const isCapitalized = lastWord[0] === lastWord[0].toUpperCase();
          let corrected = COMMON_TYPOS[lowerWord];
          if (isCapitalized) {
            corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
          }
          words[words.length - 2] = corrected;
          newContent = words.join(" ");
        }
      }
    }
    
    setContent(newContent);
  };

  const exportAsText = () => {
    const blob = new Blob([`${title}\n\n${content}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "note"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const exportAsPDF = async () => {
    if (!contentRef.current) return;
    
    setIsExportMenuOpen(false);
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // Ensure solid white background for PDF readability
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title || "note"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
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
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {t.notes}
          </h2>
          {lastSaved && (
            <span className="text-[10px] text-neutral-500">
              {lang === "ar" ? "آخر حفظ: " : "Last saved: "} 
              {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex gap-2 relative">
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isSpeaking 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
            title={isSpeaking ? (lang === 'ar' ? 'إيقاف القراءة' : 'Stop Reading') : (lang === 'ar' ? 'قراءة بصوت عالٍ' : 'Read Aloud')}
          >
            {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-4 h-4 hidden sm:block" />
            </button>
            {isExportMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsExportMenuOpen(false)} 
                />
                <div className={`absolute top-full mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-20 py-2 ${lang === 'ar' ? 'left-0' : 'right-0'}`}>
                  <button 
                    onClick={exportAsPDF}
                    className="w-full text-start px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm flex items-center gap-3 text-neutral-700 dark:text-neutral-200"
                  >
                    <FileDown className="w-4 h-4 text-red-500" />
                    {lang === 'ar' ? 'تصدير كـ PDF' : 'Export as PDF'}
                  </button>
                  <button 
                    onClick={exportAsText}
                    className="w-full text-start px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm flex items-center gap-3 text-neutral-700 dark:text-neutral-200"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    {lang === 'ar' ? 'تصدير كـ Text' : 'Export as Text'}
                  </button>
                </div>
              </>
            )}
          </div>
          
          {onSaveNote && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{t.saveNote}</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto" ref={contentRef}>
        <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 h-full bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-sm">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.noteTitlePlaceholder}
            className="w-full bg-transparent text-3xl font-bold text-neutral-900 dark:text-white border-none focus:outline-none focus:ring-0 mb-6 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
          />
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder={t.noteContentPlaceholder}
            className="w-full flex-1 bg-transparent text-lg text-neutral-800 dark:text-neutral-200 border-none focus:outline-none focus:ring-0 resize-none leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>
      </main>

      <footer className="p-3 px-6 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />{wordCount} {lang === 'ar' ? 'كلمات' : 'words'}</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />{charCount} {lang === 'ar' ? 'حروف' : 'characters'}</span>
        </div>
      </footer>
    </div>
  );
}
