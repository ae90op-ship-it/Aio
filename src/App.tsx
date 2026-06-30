import React, { useState, useEffect } from "react";
import { Language, ThemeMode, Note, TrashedNote } from "./types";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotesInterface } from "./components/NotesInterface";
import { AppLauncher } from "./components/AppLauncher";
import { SettingsModal } from "./components/SettingsModal";
import { ClockApp } from "./components/ClockApp";
import { CalculatorApp } from "./components/CalculatorApp";
import { DrawingApp } from "./components/DrawingApp";
import { CompassApp } from "./components/CompassApp";
import { PasswordManagerApp } from "./components/PasswordManagerApp";
import { SpreadsheetsApp } from "./components/SpreadsheetsApp";
import { ElectronApp } from "./components/ElectronApp";
import { CalendarModal } from "./components/CalendarModal";
import { ImageResizerApp } from "./components/ImageResizerApp";
import { GalleryApp } from "./components/GalleryApp";
import { VideoPlayerApp } from "./components/VideoPlayerApp";
import { VideoEditorApp } from "./components/VideoEditorApp";
import { AudioEditorApp } from "./components/AudioEditorApp";
import { TextNoteApp } from "./components/TextNoteApp";
import { SecretNotesInterface } from "./components/SecretNotesInterface";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

type AppState =
  | "MAIN_NOTES"
  | "CLOCK_OPEN"
  | "CALCULATOR_OPEN"
  | "DRAWING_OPEN"
  | "COMPASS_OPEN"
  | "PASSWORDS_OPEN"
  | "SPREADSHEETS_OPEN"
  | "ELECTRON_OPEN"
  | "IMAGERESIZER_OPEN"
  | "GALLERY_OPEN"
  | "VIDEOPLAYER_OPEN"
  | "VIDEOEDITOR_OPEN"
  | "AUDIOEDITOR_OPEN"
  | "TEXTNOTE_OPEN"
  | "SECRET_NOTES";
export type AppId =
  | "clock"
  | "calculator"
  | "drawing"
  | "compass"
  | "passwords"
  | "spreadsheets"
  | "electron"
  | "imageresizer"
  | "gallery"
  | "videoplayer"
  | "videoeditor"
  | "audioeditor"
  | "notes";

type AppVersion = { x: number; y: number; z: number };

const convertArabicNumbers = (str: string) => {
  const arabicNumbers = [
    /٠/g,
    /١/g,
    /٢/g,
    /٣/g,
    /٤/g,
    /٥/g,
    /٦/g,
    /٧/g,
    /٨/g,
    /٩/g,
  ];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(arabicNumbers[i], i.toString());
  }
  return res;
};

export default function App() {
  const [appState, setAppState] = useState<AppState>("MAIN_NOTES");
  const [lang, setLang] = useState<Language>("ar");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeNoteData, setActiveNoteData] = useState<Record<string, unknown> | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSecretCodesInfo, setShowSecretCodesInfo] = useState(false);

  const [activeAppId, setActiveAppId] = useState<AppId | null>(null);
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [trashedNotes, setTrashedNotes] = useState<TrashedNote[]>(() => {
    const saved = localStorage.getItem("trashedNotes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("trashedNotes", JSON.stringify(trashedNotes));
  }, [trashedNotes]);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const [version, setVersion] = useState<AppVersion>({ x: 1, y: 0, z: 0 });

  const incrementVersion = () => {
    setVersion((v) => {
      let newZ = v.z + 1;
      let newY = v.y;
      let newX = v.x;
      if (newZ >= 10) {
        newZ = 0;
        newY += 1;
        if (newY >= 10) {
          newY = 0;
          newX += 1;
        }
      }
      return { x: newX, y: newY, z: newZ };
    });
  };

  const handleOpenLauncher = () => setIsLauncherOpen(true);
  const handleCloseLauncher = () => setIsLauncherOpen(false);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };
  const handleCloseSettings = () => setIsSettingsOpen(false);

  const handleOpenCalendar = () => setIsCalendarOpen(true);
  const handleCloseCalendar = () => setIsCalendarOpen(false);

  const handleOpenApp = (appIdStr: string) => {
    const appId = appIdStr as AppId;
    setActiveAppId(appId);
    setIsLauncherOpen(false);
    
    if (appId === "clock") {
      setAppState("CLOCK_OPEN");
    } else if (appId === "calculator") {
      setAppState("CALCULATOR_OPEN");
    } else if (appId === "drawing") {
      setAppState("DRAWING_OPEN");
    } else if (appId === "compass") {
      setAppState("COMPASS_OPEN");
    } else if (appId === "passwords") {
      setAppState("PASSWORDS_OPEN");
    } else if (appId === "spreadsheets") {
      setAppState("SPREADSHEETS_OPEN");
    } else if (appId === "electron") {
      setAppState("ELECTRON_OPEN");
    } else if (appId === "imageresizer") {
      setAppState("IMAGERESIZER_OPEN");
    } else if (appId === "gallery") {
      setAppState("GALLERY_OPEN");
    } else if (appId === "videoplayer") {
      setAppState("VIDEOPLAYER_OPEN");
    } else if (appId === "videoeditor") {
      setAppState("VIDEOEDITOR_OPEN");
    } else if (appId === "audioeditor") {
      setAppState("AUDIOEDITOR_OPEN");
    } else if (appId === "notes") {
      setAppState("TEXTNOTE_OPEN");
    }
  };

  const handleBackToNotes = () => {
    setAppState("MAIN_NOTES");
    setActiveAppId(null);
    setActiveNoteData(null);
    setActiveNoteId(null);
  };

  const handleSaveAppNote = (title: string, data: unknown, appId: AppId) => {
    incrementVersion();
    let noteData;
    if (appId === "notes") {
      const notePayload = data as Record<string, string> | null;
      noteData = {
        title: notePayload?.title || title,
        content: notePayload?.content || "",
        date: new Date().toLocaleDateString(
          lang === "ar" ? "ar-EG" : lang === "ja" ? "ja-JP" : "en-US",
        ),
        updatedAt: Date.now(),
        // Keep appId unset for text notes for backwards compatibility
      };
    } else {
      noteData = {
        title,
        content:
          lang === "ar"
            ? `البيانات المحفوظة لـ ${appId}`
            : `Saved data for ${appId}`,
        date: new Date().toLocaleDateString(
          lang === "ar" ? "ar-EG" : lang === "ja" ? "ja-JP" : "en-US",
        ),
        updatedAt: Date.now(),
        appId,
        appData: data,
      };
    }

    if (activeNoteId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNoteId ? { ...n, ...noteData } : n
        )
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        isPinned: false,
        ...noteData,
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    handleBackToNotes();
  };

  const handleOpenAppNote = (note: Note) => {
    setActiveNoteId(note.id);

    if (!note.appId || note.appId === "notes") {
      setActiveNoteData({ title: note.title, content: note.content });
      setAppState("TEXTNOTE_OPEN");
      return;
    }
    
    setActiveNoteData(note.appData as Record<string, unknown> | null);
    
    switch (note.appId as AppId) {
      case "spreadsheets": setAppState("SPREADSHEETS_OPEN"); break;
      case "drawing": setAppState("DRAWING_OPEN"); break;
      case "clock": setAppState("CLOCK_OPEN"); break;
      case "calculator": setAppState("CALCULATOR_OPEN"); break;
      case "compass": setAppState("COMPASS_OPEN"); break;
      case "passwords": setAppState("PASSWORDS_OPEN"); break;
      case "electron": setAppState("ELECTRON_OPEN"); break;
      case "imageresizer": setAppState("IMAGERESIZER_OPEN"); break;
      case "gallery": setAppState("GALLERY_OPEN"); break;
      case "videoplayer": setAppState("VIDEOPLAYER_OPEN"); break;
      case "videoeditor": setAppState("VIDEOEDITOR_OPEN"); break;
      case "audioeditor": setAppState("AUDIOEDITOR_OPEN"); break;
      default:
        break;
    }
  };

  const handleTrashNote = (note: Note) => {
    const trashed: TrashedNote = { ...note, deletedAt: Date.now() };
    setTrashedNotes((prev) => [trashed, ...prev]);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
  };

  const handleSecretCode = (rawCode: string) => {
    const code = convertArabicNumbers(rawCode);
    if (code === "010" || code === "0000") {
      setShowSecretCodesInfo(true);
    } else if (code === "1122") {
      setAppState("SECRET_NOTES");
    }
  };

  const formattedVersion = `v${version.x}.${version.y}.${version.z}`;

  return (
    <ThemeProvider lang={lang} theme={theme}>
      <div className="w-full h-full flex-1 flex flex-col relative">
        <NotesInterface
          lang={lang}
          theme={theme}
          notes={notes}
          setNotes={setNotes}
          onTrashNote={handleTrashNote}
          onOpenLauncher={handleOpenLauncher}
          onOpenSettings={handleOpenSettings}
          onOpenCalendar={handleOpenCalendar}
          onOpenAppNote={handleOpenAppNote}
        />

        <AnimatePresence>
          {appState !== "MAIN_NOTES" && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-5xl h-[85vh] sm:h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
              >
                {appState === "CLOCK_OPEN" && (
                  <ClockApp
                    lang={lang}
                    theme={theme}
                    onBack={handleBackToNotes}
                    onSaveNote={(title, data) => handleSaveAppNote(title, data, "clock")}
                  />
                )}

                {appState === "SPREADSHEETS_OPEN" && (
                  <SpreadsheetsApp
                    lang={lang}
                    onBack={handleBackToNotes}
                    initialData={activeNoteData}
                    onSaveNote={(title, data) =>
                      handleSaveAppNote(title, data, "spreadsheets")
                    }
                  />
                )}

                {appState === "CALCULATOR_OPEN" && (
                  <CalculatorApp
                    lang={lang}
                    theme={theme}
                    onBack={handleBackToNotes}
                    onSaveNote={(title, data) => handleSaveAppNote(title, data, "calculator")}
                    onSecretCode={handleSecretCode}
                  />
                )}

                {appState === "SECRET_NOTES" && (
                  <SecretNotesInterface
                    lang={lang}
                    theme={theme}
                    onBackToNotes={handleBackToNotes}
                  />
                )}

                {appState === "DRAWING_OPEN" && (
                  <DrawingApp
                    lang={lang}
                    onBack={handleBackToNotes}
                    initialData={activeNoteData}
                    onSaveNote={(title, data) =>
                      handleSaveAppNote(title, data, "drawing")
                    }
                  />
                )}

                {appState === "COMPASS_OPEN" && (
                  <CompassApp
                    lang={lang}
                    theme={theme}
                    onBack={handleBackToNotes}
                    onSaveNote={(title, data) => handleSaveAppNote(title, data, "compass")}
                  />
                )}

                {appState === "PASSWORDS_OPEN" && (
                  <PasswordManagerApp
                    lang={lang}
                    theme={theme}
                    onBack={handleBackToNotes}
                    onSaveNote={(title, data) => handleSaveAppNote(title, data, "passwords")}
                  />
                )}
                {appState === "ELECTRON_OPEN" && (
                  <ElectronApp lang={lang} onExit={handleBackToNotes} onSaveNote={(title, data) => handleSaveAppNote(title, data, "electron")} />
                )}
                {appState === "IMAGERESIZER_OPEN" && (
                  <ImageResizerApp lang={lang} onExit={handleBackToNotes} onSaveNote={(title, data) => handleSaveAppNote(title, data, "imageresizer")} />
                )}
                {appState === "GALLERY_OPEN" && (
                  <GalleryApp lang={lang} onExit={handleBackToNotes} onSaveNote={(title, data) => handleSaveAppNote(title, data, "gallery")} />
                )}
                {appState === "VIDEOPLAYER_OPEN" && (
                  <VideoPlayerApp lang={lang} onExit={handleBackToNotes} onSaveNote={(title, data) => handleSaveAppNote(title, data, "videoplayer")} />
                )}
                {appState === "VIDEOEDITOR_OPEN" && (
                  <VideoEditorApp lang={lang} onExit={handleBackToNotes} onSaveNote={(title, data) => handleSaveAppNote(title, data, "videoeditor")} />
                )}
                {appState === "AUDIOEDITOR_OPEN" && (
                  <AudioEditorApp lang={lang} onExit={handleBackToNotes} onSaveNote={(title, data) => handleSaveAppNote(title, data, "audioeditor")} />
                )}
                {appState === "TEXTNOTE_OPEN" && (
                  <TextNoteApp lang={lang} onBack={handleBackToNotes} initialData={activeNoteData} onSaveNote={(title, data) => handleSaveAppNote(title, data, "notes")} />
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AppLauncher
        lang={lang}
        isOpen={isLauncherOpen}
        onClose={handleCloseLauncher}
        onOpenApp={handleOpenApp}
      />

      <SettingsModal
        lang={lang}
        theme={theme}
        trashedNotes={trashedNotes}
        setTrashedNotes={setTrashedNotes}
        notes={notes}
        setNotes={setNotes}
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onChangeLanguage={setLang}
        onChangeTheme={setTheme}
        onSecretCode={handleSecretCode}
        version={formattedVersion}
      />

      <CalendarModal
        lang={lang}
        isOpen={isCalendarOpen}
        onClose={handleCloseCalendar}
      />

      {/* Secret Codes Information Modal */}
      <AnimatePresence>
        {showSecretCodesInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSecretCodesInfo(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/50 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-neutral-200 dark:border-neutral-700 pb-4 sticky top-0 bg-white dark:bg-neutral-800 z-10">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  الأكواد السرية / Secret Codes
                </h2>
                <button
                  onClick={() => setShowSecretCodesInfo(false)}
                  className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ul className="space-y-4 text-neutral-700 dark:text-neutral-300 text-sm">
                <li key="secret-notes" className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    1122
                  </span>
                  <span>الملاحظات السرية / Secret Notes</span>
                </li>
                <li key="secret-codes" className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    010
                  </span>
                  <span>استعراض الأكواد السرية / Secret Codes List</span>
                </li>
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
