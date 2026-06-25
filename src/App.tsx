import React, { useState } from 'react';
import { Language, ThemeMode, Note } from './types';
import { ThemeProvider } from './components/ThemeProvider';
import { NotesInterface } from './components/NotesInterface';
import { AppLauncher } from './components/AppLauncher';
import { SimulatedApp } from './components/SimulatedApp';
import { SettingsModal } from './components/SettingsModal';
import { TetrisGame } from './components/TetrisGame';
import { AnimatePresence, motion } from 'motion/react';

type AppState = 'MAIN_NOTES' | 'APP_OPEN' | 'TETRIS';

export default function App() {
  const [appState, setAppState] = useState<AppState>('MAIN_NOTES');
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);

  const handleOpenLauncher = () => setIsLauncherOpen(true);
  const handleCloseLauncher = () => setIsLauncherOpen(false);

  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleCloseSettings = () => setIsSettingsOpen(false);

  const handleOpenApp = (appId: string) => {
    setActiveAppId(appId);
    setAppState('APP_OPEN');
  };

  const handleBackToNotes = () => {
    setAppState('MAIN_NOTES');
    setActiveAppId(null);
  };

  const handleSecretCode = (code: string) => {
    if (code === '1111') {
      setAppState('TETRIS');
      setIsSettingsOpen(false);
    }
  };

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
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onChangeLanguage={setLang}
        onChangeTheme={setTheme}
        onSecretCode={handleSecretCode}
      />
    </ThemeProvider>
  );
}
