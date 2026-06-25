import React, { useState, useEffect } from 'react';
import { Language, ThemeMode, Note } from './types';
import { ThemeProvider } from './components/ThemeProvider';
import { NotesInterface } from './components/NotesInterface';
import { AppLauncher } from './components/AppLauncher';
import { SimulatedApp } from './components/SimulatedApp';
import { SettingsModal } from './components/SettingsModal';
import { TetrisGame } from './components/TetrisGame';
import { TicTacToeGame } from './components/TicTacToeGame';
import { ClockApp } from './components/ClockApp';
import { CalendarModal } from './components/CalendarModal';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

type AppState = 'MAIN_NOTES' | 'APP_OPEN' | 'TETRIS' | 'XO_GAME' | 'CLOCK_OPEN';
type AppVersion = { x: number; y: number; z: number };

export default function App() {
  const [appState, setAppState] = useState<AppState>('MAIN_NOTES');
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSecretCodesInfo, setShowSecretCodesInfo] = useState(false);
  
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const [version, setVersion] = useState<AppVersion>({ x: 1, y: 0, z: 0 });

  const incrementVersion = () => {
    setVersion(v => {
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
    if (appId === 'clock') {
      setAppState('CLOCK_OPEN');
    } else {
      setActiveAppId(appId);
      setAppState('APP_OPEN');
    }
  };

  const handleBackToNotes = () => {
    setAppState('MAIN_NOTES');
    setActiveAppId(null);
  };

  const handleSecretCode = (code: string) => {
    if (code === '1111') {
      setAppState('TETRIS');
      setIsSettingsOpen(false);
    } else if (code === '2222') {
      setAppState('XO_GAME');
      setIsSettingsOpen(false);
    } else if (code === '0000') {
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
      <AnimatePresence mode="wait">
        {appState === 'MAIN_NOTES' && (
          <motion.div 
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex-1 flex flex-col"
          >
            <NotesInterface 
              lang={lang} 
              theme={theme}
              notes={notes}
              setNotes={setNotes}
              onOpenLauncher={handleOpenLauncher} 
              onOpenSettings={handleOpenSettings}
              onOpenCalendar={handleOpenCalendar}
            />
          </motion.div>
        )}
        
        {appState === 'APP_OPEN' && activeAppId && (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex-1 flex flex-col"
          >
            <SimulatedApp 
              appId={activeAppId}
              lang={lang}
              theme={theme}
              onBackToNotes={handleBackToNotes}
              onOpenLauncher={handleOpenLauncher}
              onOpenSettings={handleOpenSettings}
            />
          </motion.div>
        )}

        {appState === 'CLOCK_OPEN' && (
          <motion.div
            key="clock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex-1 flex flex-col"
          >
            <ClockApp lang={lang} theme={theme} onBack={handleBackToNotes} />
          </motion.div>
        )}

        {appState === 'TETRIS' && (
          <motion.div
            key="tetris"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex-1 flex flex-col items-center justify-center bg-black"
          >
            <TetrisGame lang={lang} onExit={handleBackToNotes} />
          </motion.div>
        )}

        {appState === 'XO_GAME' && (
          <motion.div
            key="xogame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex-1 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900"
          >
            <TicTacToeGame lang={lang} onExit={handleBackToNotes} />
          </motion.div>
        )}
      </AnimatePresence>

      <AppLauncher 
        lang={lang} 
        isOpen={isLauncherOpen} 
        onClose={handleCloseLauncher}
        onOpenApp={handleOpenApp}
      />

      <SettingsModal
        lang={lang}
        theme={theme}
        version={formattedVersion}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSecretCodesInfo(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6 border-b border-neutral-200 dark:border-neutral-700 pb-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Secret Codes</h2>
                <button onClick={() => setShowSecretCodesInfo(false)} className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ul className="space-y-4 text-neutral-700 dark:text-neutral-300">
                <li className="flex justify-between items-center bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500">1111</span>
                  <span className="text-sm">Tetris Game</span>
                </li>
                <li className="flex justify-between items-center bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500">2222</span>
                  <span className="text-sm">Tic-Tac-Toe (XO)</span>
                </li>
                <li className="flex justify-between items-center bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono font-bold text-blue-500">0000</span>
                  <span className="text-sm">Secret Codes List</span>
                </li>
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
