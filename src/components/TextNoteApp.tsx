import React, { useState, useEffect, useCallback, useRef } from "react";
import { Language } from "../types";
import { translations } from "../i18n";
import { ArrowLeft, Save, Download, FileText, FileDown, ChevronDown, Volume2, Square, Plus, GripVertical, CheckSquare, Square as SquareOutline } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  lang: Language;
  onBack: () => void;
  initialData?: any;
  onSaveNote?: (title: string, data: any) => void;
}

type BlockType = 'text' | 'todo';
interface Block {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Parse initial content into blocks
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const rawContent = initialData?.content || "";
    if (!rawContent) return [{ id: Math.random().toString(), type: 'text', text: '' }];
    
    return rawContent.split('\n').map((line: string) => {
      if (line.startsWith('- [ ] ')) {
        return { id: Math.random().toString(), type: 'todo', text: line.slice(6), checked: false };
      } else if (line.startsWith('- [x] ')) {
        return { id: Math.random().toString(), type: 'todo', text: line.slice(6), checked: true };
      } else {
        return { id: Math.random().toString(), type: 'text', text: line };
      }
    });
  });

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [commandPaletteBlockId, setCommandPaletteBlockId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // Serialize blocks back to string
  const getSerializedContent = useCallback(() => {
    return blocks.map(b => {
      if (b.type === 'todo') {
        return `- [${b.checked ? 'x' : ' '}] ${b.text}`;
      }
      return b.text;
    }).join('\n');
  }, [blocks]);

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

    const textToSpeak = (title + ".\n" + getSerializedContent()).trim();
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
      onSaveNote(title || (lang === "ar" ? "ملاحظة جديدة" : "New Note"), { title, content: getSerializedContent() });
      setLastSaved(new Date());
    }
  }, [onSaveNote, title, getSerializedContent, lang]);

  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveRef.current();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleBlockChange = (id: string, newText: string) => {
    // Autocorrect logic (trigger on space)
    const block = blocks.find(b => b.id === id);
    if (block && newText.length > block.text.length && newText.endsWith(" ")) {
      const words = newText.split(" ");
      const lastWord = words[words.length - 2]; 
      
      if (lastWord) {
        const lowerWord = lastWord.toLowerCase();
        if (COMMON_TYPOS[lowerWord]) {
          const isCapitalized = lastWord[0] === lastWord[0].toUpperCase();
          let corrected = COMMON_TYPOS[lowerWord];
          if (isCapitalized) {
            corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
          }
          words[words.length - 2] = corrected;
          newText = words.join(" ");
        }
      }
    }
    
    // Auto-convert to checklist if user types "- [ ] "
    if (newText === "- [ ] ") {
      updateBlock(id, { type: 'todo', text: '', checked: false });
      setCommandPaletteBlockId(null);
      return;
    }
    
    if (newText.endsWith('/')) {
      setCommandPaletteBlockId(id);
    } else {
      setCommandPaletteBlockId(null);
    }

    updateBlock(id, { text: newText });
  };

  const handleBlockKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    const block = blocks[index];
    
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (block.type === 'todo') {
          updateBlock(block.id, { type: 'text' });
        }
      } else {
        if (block.type === 'text') {
          updateBlock(block.id, { type: 'todo', checked: false });
        }
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // If current block is empty and is a todo, convert back to text
      if (block.type === 'todo' && block.text === '') {
        updateBlock(block.id, { type: 'text' });
        return;
      }
      
      const newBlock: Block = {
        id: Math.random().toString(),
        type: block.type === 'todo' ? 'todo' : 'text',
        text: '',
        checked: false
      };
      
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
      
      setTimeout(() => {
        blockRefs.current[newBlock.id]?.focus();
        setFocusedBlockId(newBlock.id);
      }, 0);
    } else if (e.key === 'Backspace' && block.text === '') {
      e.preventDefault();
      
      if (block.type === 'todo') {
        updateBlock(block.id, { type: 'text' });
        return;
      }
      
      if (index > 0) {
        const prevBlock = blocks[index - 1];
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
        
        setTimeout(() => {
          const prevRef = blockRefs.current[prevBlock.id];
          if (prevRef) {
            prevRef.focus();
            prevRef.setSelectionRange(prevBlock.text.length, prevBlock.text.length);
          }
          setFocusedBlockId(prevBlock.id);
        }, 0);
      }
    } else if (e.key === 'ArrowUp' && index > 0) {
      const textarea = e.currentTarget;
      if (textarea.selectionStart === 0) {
        e.preventDefault();
        blockRefs.current[blocks[index - 1].id]?.focus();
      }
    } else if (e.key === 'ArrowDown' && index < blocks.length - 1) {
      const textarea = e.currentTarget;
      if (textarea.selectionEnd === textarea.value.length) {
        e.preventDefault();
        blockRefs.current[blocks[index + 1].id]?.focus();
      }
    }
  };

  const autoResize = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const exportAsText = () => {
    const blob = new Blob([`${title}\n\n${getSerializedContent()}`], { type: "text/plain;charset=utf-8" });
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
        backgroundColor: "#ffffff",
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

  const totalContent = getSerializedContent();
  const wordCount = totalContent.trim() ? totalContent.trim().split(/\s+/).length : 0;
  const charCount = totalContent.length;

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

      <main className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto cursor-text" onClick={() => {
        // If clicking on the main area but not on a block, focus the last block
        if (blocks.length > 0) {
          blockRefs.current[blocks[blocks.length - 1].id]?.focus();
        }
      }}>
        <div 
          className="max-w-4xl w-full mx-auto flex flex-col min-h-full bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-sm"
          ref={contentRef}
          onClick={e => e.stopPropagation()}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.noteTitlePlaceholder}
            className="w-full bg-transparent text-3xl font-bold text-neutral-900 dark:text-white border-none focus:outline-none focus:ring-0 mb-8 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
          />
          
          <div className="flex flex-col gap-1 pb-20">
            {blocks.map((block, index) => {
              const isFocused = focusedBlockId === block.id;
              const isEmpty = block.text === '';

              return (
                <div 
                  key={block.id} 
                  className="group relative flex items-start -mx-4 px-4 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors"
                >
                  {/* Left Controls (Hidden by default, shown on hover) */}
                  <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 flex items-center -translate-x-full pr-2 transition-opacity">
                    <button 
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded cursor-grab"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        const newBlocks = [...blocks];
                        newBlocks.splice(index + 1, 0, { id: Math.random().toString(), type: 'text', text: '' });
                        setBlocks(newBlocks);
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Block Content */}
                  <div className="flex-1 flex gap-3 min-w-0">
                    {block.type === 'todo' && (
                      <button 
                        onClick={() => updateBlock(block.id, { checked: !block.checked })}
                        className="mt-1 text-neutral-400 hover:text-blue-500 transition-colors shrink-0"
                      >
                        {block.checked ? <CheckSquare className="w-5 h-5 text-blue-500" /> : <SquareOutline className="w-5 h-5" />}
                      </button>
                    )}
                    
                    <div className="flex-1 relative min-h-[1.5rem]">
                      {(!isFocused && !isEmpty) ? (
                        <div 
                          className={`w-full prose prose-neutral dark:prose-invert max-w-none prose-p:my-0 prose-headings:my-0 cursor-text min-h-[1.5rem] leading-relaxed ${block.type === 'todo' && block.checked ? 'line-through opacity-50' : ''}`}
                          onClick={() => {
                            setFocusedBlockId(block.id);
                            setTimeout(() => {
                              blockRefs.current[block.id]?.focus();
                              autoResize(blockRefs.current[block.id]);
                            }, 0);
                          }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {block.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <textarea
                          ref={el => {
                            blockRefs.current[block.id] = el;
                            if (el && isFocused) autoResize(el);
                          }}
                          value={block.text}
                          onChange={(e) => {
                            handleBlockChange(block.id, e.target.value);
                            autoResize(e.target);
                          }}
                          onKeyDown={(e) => handleBlockKeyDown(e, index)}
                          onFocus={() => setFocusedBlockId(block.id)}
                          onBlur={() => setFocusedBlockId(null)}
                          placeholder={block.type === 'todo' ? 'To-do' : "Type '/' for commands or start writing..."}
                          className={`w-full bg-transparent text-lg border-none focus:outline-none focus:ring-0 resize-none overflow-hidden m-0 p-0 leading-relaxed ${
                            block.type === 'todo' && block.checked 
                              ? 'text-neutral-400 dark:text-neutral-600 line-through' 
                              : 'text-neutral-800 dark:text-neutral-200'
                          } ${isEmpty && !isFocused ? 'opacity-0' : 'opacity-100'}`}
                          rows={1}
                        />
                      )}
                      
                      {/* Command Palette */}
                      {commandPaletteBlockId === block.id && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden">
                          <div className="p-1">
                            <button
                              onClick={() => {
                                updateBlock(block.id, { type: 'text', text: block.text.slice(0, -1) });
                                setCommandPaletteBlockId(null);
                                setTimeout(() => blockRefs.current[block.id]?.focus(), 0);
                              }}
                              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" /> Text
                            </button>
                            <button
                              onClick={() => {
                                updateBlock(block.id, { type: 'todo', text: block.text.slice(0, -1), checked: false });
                                setCommandPaletteBlockId(null);
                                setTimeout(() => blockRefs.current[block.id]?.focus(), 0);
                              }}
                              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                            >
                              <CheckSquare className="w-4 h-4" /> To-do List
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

