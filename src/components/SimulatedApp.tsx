import React, { useState } from 'react';
import { Language, ThemeMode } from '../types';
import { getAppById } from '../data';
import { translations } from '../i18n';
import { ArrowRight, Settings, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as math from 'mathjs';

interface Props {
  appId: string;
  lang: Language;
  theme: ThemeMode;
  onBackToNotes: () => void;
  onOpenLauncher: () => void;
  onOpenSettings: () => void;
}

export function SimulatedApp({ appId, lang, theme, onBackToNotes, onOpenLauncher, onOpenSettings }: Props) {
  const app = getAppById(appId);
  const t = translations[lang];

  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!app) return null;

  const themeDisplay = theme === 'dark' ? (lang === 'ar' ? 'داكن' : lang === 'ja' ? 'ダーク' : 'Dark') : (lang === 'ar' ? 'فاتح' : lang === 'ja' ? 'ライト' : 'Light');
  const langDisplay = lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : '日本語';

  const handleSimulate = () => {
    if (!inputData.trim()) return;
    setIsProcessing(true);
    setCopied(false);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      if (appId === 'calculator') {
        try {
          const result = math.evaluate(inputData);
          setOutputData(`### Result\n\n\`\`\`\n${result}\n\`\`\`\n\n*Equation processed successfully.*`);
        } catch (err) {
          setOutputData(`### Error\n\nCould not evaluate expression. Please check syntax.\n\n\`\`\`\n${(err as Error).message}\n\`\`\``);
        }
      } else {
        setOutputData(`### Simulated Output: ${app.name[lang]}\n\n**Processed Input:**\n\n${inputData}\n\n---\n\n*Status: SUCCESS*\n\n*Time: ${new Date().toLocaleTimeString()}*`);
      }
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }}
      className="flex-1 flex flex-col w-full h-screen relative bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200 transition-colors"
    >
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 opacity-80" dir="ltr">
            {`[${themeDisplay} | ${langDisplay} > ${app.name[lang]}]`}
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {app.name[lang]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenSettings}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={onBackToNotes}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ArrowRight className={`w-5 h-5 ${lang === 'ar' ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center">
            <h2 className="text-xl text-neutral-600 dark:text-neutral-300 font-medium mb-2">{app.description[lang]}</h2>
          </div>

          <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-2xl p-6 shadow-sm space-y-4">
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder={appId === 'calculator' ? 'Enter equation (e.g., 2 + 2, det([[1, 2], [3, 4]]))...' : t.simulationPlaceholder}
              className="w-full h-32 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none font-mono"
              dir="auto"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSimulate}
                disabled={isProcessing || !inputData.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_4px_15px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  t.process
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {outputData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 border border-blue-500/30 rounded-2xl p-6 shadow-sm dark:shadow-[0_0_30px_rgba(37,99,235,0.1)] relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-blue-500 dark:text-blue-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    {t.output}
                  </h3>
                  <button 
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-blue-500 transition-colors flex items-center gap-2 text-sm"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied && <span className="text-green-500 text-xs font-medium">Copied!</span>}
                  </button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300" dir="ltr">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputData}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-12">
            <button onClick={onBackToNotes} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white px-6 py-3 rounded-xl transition-all border border-neutral-200 dark:border-neutral-700 font-medium">
              {lang === 'ar' ? '↩️ عودة للملاحظات' : lang === 'en' ? '↩️ Back to Notes' : '↩️ メモに戻る'}
            </button>
            <button onClick={onOpenLauncher} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white px-6 py-3 rounded-xl transition-all border border-neutral-200 dark:border-neutral-700 font-medium">
              {lang === 'ar' ? '➕ فتح قائمة البرامج' : lang === 'en' ? '➕ Open App Menu' : '➕ アพメニューを開く'}
            </button>
            <button onClick={onOpenSettings} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white px-6 py-3 rounded-xl transition-all border border-neutral-200 dark:border-neutral-700 font-medium">
              {lang === 'ar' ? '⚙️ الإعدادات' : lang === 'en' ? '⚙️ Settings' : '⚙️ 設定'}
            </button>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
