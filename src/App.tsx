import React, { useState, useEffect } from "react";
import { Language, ThemeMode, Note, TrashedNote } from "./types";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotesInterface } from "./components/NotesInterface";
import { AppLauncher } from "./components/AppLauncher";
import { SimulatedApp } from "./components/SimulatedApp";
import { SettingsModal } from "./components/SettingsModal";
import { TetrisGame } from "./components/TetrisGame";
import { TicTacToeGame } from "./components/TicTacToeGame";
import { ClockApp } from "./components/ClockApp";
import { CalculatorApp } from "./components/CalculatorApp";
import { SecretNotesInterface } from "./components/SecretNotesInterface";
import { ReactionGame } from "./components/ReactionGame";
import { EvolutionGame } from "./components/EvolutionGame";
import { MemoryGame } from "./components/MemoryGame";
import { SpaceGame } from "./components/SpaceGame";
import { AgeCalculator } from "./components/AgeCalculator";
import { HackerTyper } from "./components/HackerTyper";
import { IdeasGenerator } from "./components/IdeasGenerator";
import { DrawingApp } from "./components/DrawingApp";
import { CompassApp } from "./components/CompassApp";
import { PasswordManagerApp } from "./components/PasswordManagerApp";
import { SpreadsheetsApp } from "./components/SpreadsheetsApp";
import { ElectronApp } from "./components/ElectronApp";
import { CalendarModal } from "./components/CalendarModal";
import { ImageResizerApp } from "./components/ImageResizerApp";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

type AppState =
  | "MAIN_NOTES"
  | "APP_OPEN"
  | "TETRIS"
  | "XO_GAME"
  | "CLOCK_OPEN"
  | "CALCULATOR_OPEN"
  | "SECRET_NOTES"
  | "REACTION_GAME"
  | "EVOLUTION_GAME"
  | "MEMORY_GAME"
  | "SPACE_GAME"
  | "AGE_CALCULATOR"
  | "HACKER_SCREEN"
  | "IDEAS_GENERATOR"
  | "DRAWING_OPEN"
  | "COMPASS_OPEN"
  | "PASSWORDS_OPEN"
  | "SPREADSHEETS_OPEN"
  | "ELECTRON_OPEN"
  | "IMAGERESIZER_OPEN";
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
  const [activeNoteData, setActiveNoteData] = useState<any>(null);

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSecretCodesInfo, setShowSecretCodesInfo] = useState(false);

  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<TrashedNote[]>(() => {
    const saved = localStorage.getItem("trashedNotes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("trashedNotes", JSON.stringify(trashedNotes));
  }, [trashedNotes]);

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
    incrementVersion();
    setIsSettingsOpen(true);
  };
  const handleCloseSettings = () => setIsSettingsOpen(false);

  const handleOpenCalendar = () => setIsCalendarOpen(true);
  const handleCloseCalendar = () => setIsCalendarOpen(false);

  const handleOpenApp = (appId: string) => {
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
    } else {
      setActiveAppId(appId);
      setAppState("APP_OPEN");
    }
  };

  const handleBackToNotes = () => {
    setAppState("MAIN_NOTES");
    setActiveAppId(null);
    setActiveNoteData(null);
  };

  const handleSaveAppNote = (title: string, data: any, appId: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
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
    setNotes((prev) => [newNote, ...prev]);
    handleBackToNotes();
  };

  const handleOpenAppNote = (note: Note) => {
    if (note.appId === "spreadsheets") {
      setActiveNoteData(note.appData);
      setAppState("SPREADSHEETS_OPEN");
    } else if (note.appId === "drawing") {
      setActiveNoteData(note.appData);
      setAppState("DRAWING_OPEN");
    } else if (note.appId) {
      setActiveAppId(note.appId);
      setActiveNoteData(note.appData);
      setAppState("APP_OPEN");
    }
  };

  const handleTrashNote = (note: Note) => {
    const trashed: TrashedNote = { ...note, deletedAt: Date.now() };
    setTrashedNotes((prev) => [trashed, ...prev]);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
  };

  const handleSecretCode = (rawCode: string) => {
    const code = convertArabicNumbers(rawCode);
    if (code === "1111") {
      setAppState("TETRIS");
      setIsSettingsOpen(false);
    } else if (code === "2222") {
      setAppState("XO_GAME");
      setIsSettingsOpen(false);
    } else if (code === "1122") {
      setAppState("SECRET_NOTES");
      setIsSettingsOpen(false);
    } else if (code === "3333") {
      setAppState("REACTION_GAME");
      setIsSettingsOpen(false);
    } else if (code === "4444") {
      setAppState("EVOLUTION_GAME");
      setIsSettingsOpen(false);
    } else if (code === "5555") {
      setAppState("MEMORY_GAME");
      setIsSettingsOpen(false);
    } else if (code === "6666") {
      setAppState("SPACE_GAME");
      setIsSettingsOpen(false);
    } else if (code === "2233") {
      setAppState("AGE_CALCULATOR");
      setIsSettingsOpen(false);
    } else if (code === "0000") {
      setShowSecretCodesInfo(true);
      setIsSettingsOpen(false);
    }
  };

  // Trigger version increment on notes change
  useEffect(() => {
    if (notes.length > 0) {
      incrementVersion();
    }
  }, [notes]);

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
                {appState === "APP_OPEN" && activeAppId && (
                  <SimulatedApp
                    appId={activeAppId}
                    lang={lang}
                    theme={theme}
                    onBackToNotes={handleBackToNotes}
                    onOpenLauncher={handleOpenLauncher}
                    onOpenSettings={handleOpenSettings}
                    onSaveNote={(title, data) =>
                      handleSaveAppNote(title, data, activeAppId)
                    }
                  />
                )}

                {appState === "CLOCK_OPEN" && (
                  <ClockApp
                    lang={lang}
                    theme={theme}
                    onBack={handleBackToNotes}
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

                {appState === "TETRIS" && (
                  <TetrisGame lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "XO_GAME" && (
                  <TicTacToeGame lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "CALCULATOR_OPEN" && (
                  <CalculatorApp
                    lang={lang}
                    theme={theme}
                    onBack={handleBackToNotes}
                  />
                )}

                {appState === "SECRET_NOTES" && (
                  <SecretNotesInterface
                    lang={lang}
                    theme={theme}
                    onBackToNotes={handleBackToNotes}
                  />
                )}

                {appState === "REACTION_GAME" && (
                  <ReactionGame lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "EVOLUTION_GAME" && (
                  <EvolutionGame lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "MEMORY_GAME" && (
                  <MemoryGame lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "SPACE_GAME" && (
                  <SpaceGame lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "AGE_CALCULATOR" && (
                  <AgeCalculator lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "HACKER_SCREEN" && (
                  <HackerTyper lang={lang} onExit={handleBackToNotes} />
                )}

                {appState === "IDEAS_GENERATOR" && (
                  <IdeasGenerator lang={lang} onExit={handleBackToNotes} />
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
                  />
                )}

                {appState === "PASSWORDS_OPEN" && (
                  <PasswordManagerApp
                    lang={lang}
                    theme={theme}
                    onBack={handleBackToNotes}
                  />
                )}
                {appState === "ELECTRON_OPEN" && (
                  <ElectronApp lang={lang} onExit={handleBackToNotes} />
                )}
                {appState === "IMAGERESIZER_OPEN" && (
                  <ImageResizerApp lang={lang} onExit={handleBackToNotes} />
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
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    1111 أو ١١١١
                  </span>
                  <span>لعبة تترس / Tetris Game</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    1122 أو ١١٢٢
                  </span>
                  <span>الملاحظات السرية / Secret Notes</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    2222 أو ٢٢٢٢
                  </span>
                  <span>لعبة إكس أو / Tic-Tac-Toe (XO)</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    2233 أو ٢٢٣٣
                  </span>
                  <span>حساب العمر بالتفصيل / Age Calculator</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    3333 أو ٣٣٣٣
                  </span>
                  <span>لعبة ردة الفعل / Reaction Time Game</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    4444 أو ٤٤٤٤
                  </span>
                  <span>لعبة التطور اللانهائي / Infinite Evolution</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    5555 أو ٥٥٥٥
                  </span>
                  <span>لعبة الذاكرة / Memory Cards Game</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    6666 أو ٦٦٦٦
                  </span>
                  <span>لعبة الفضاء / Space Invaders Game</span>
                </li>
                <li className="flex flex-col bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500 mb-1">
                    0000 أو ٠٠٠٠
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
