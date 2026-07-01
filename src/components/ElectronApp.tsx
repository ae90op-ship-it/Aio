import React, { useState, useEffect } from "react";
import { Language } from "../types";
import { ArrowLeft, Battery, BatteryCharging, Zap, Save, BatteryFull, BatteryLow, BatteryMedium, ShieldAlert, Code, Terminal, Play, RotateCcw } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  lang: Language;
  onExit: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function ElectronApp({ lang, onExit, onSaveNote }: Props) {
  const [activeTab, setActiveTab] = useState<'sensors' | 'sandbox'>('sandbox');
  
  // Battery State
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [chargingTime, setChargingTime] = useState<number | null>(null);
  const [dischargingTime, setDischargingTime] = useState<number | null>(null);

  // Sandbox State
  const [code, setCode] = useState<string>("console.log('Hello, Electron Workspace!');\n\nconst calculatePrimes = (max) => {\n  const primes = [];\n  for(let i=2; i<=max; i++) {\n    let isPrime = true;\n    for(let j=2; j<i; j++) {\n      if(i%j === 0) isPrime = false;\n    }\n    if(isPrime) primes.push(i);\n  }\n  return primes;\n};\n\nconsole.log(calculatePrimes(20));");
  const [consoleOutput, setConsoleOutput] = useState<string>("");

  useEffect(() => {
    let battery: any;

    const updateBatteryInfo = () => {
      if (battery) {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        setChargingTime(battery.chargingTime === Infinity ? null : battery.chargingTime);
        setDischargingTime(battery.dischargingTime === Infinity ? null : battery.dischargingTime);
      }
    };

    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        battery = b;
        updateBatteryInfo();

        battery.addEventListener("levelchange", updateBatteryInfo);
        battery.addEventListener("chargingchange", updateBatteryInfo);
        battery.addEventListener("chargingtimechange", updateBatteryInfo);
        battery.addEventListener("dischargingtimechange", updateBatteryInfo);
      });
    } else {
      setIsSupported(false);
    }

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", updateBatteryInfo);
        battery.removeEventListener("chargingchange", updateBatteryInfo);
        battery.removeEventListener("chargingtimechange", updateBatteryInfo);
        battery.removeEventListener("dischargingtimechange", updateBatteryInfo);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getBatteryIcon = () => {
    if (isCharging) return <BatteryCharging className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" strokeWidth={1} />;
    if (batteryLevel === null) return <Battery className="w-24 h-24 text-cyan-400" strokeWidth={1} />;
    if (batteryLevel > 80) return <BatteryFull className="w-24 h-24 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" strokeWidth={1} />;
    if (batteryLevel > 20) return <BatteryMedium className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" strokeWidth={1} />;
    return <BatteryLow className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" strokeWidth={1} />;
  };

  const getStatusText = () => {
    if (lang === "ar") {
      return isCharging ? "جاري الشحن" : batteryLevel && batteryLevel <= 20 ? "بطارية ضعيفة" : "تفريغ";
    }
    return isCharging ? "Charging" : batteryLevel && batteryLevel <= 20 ? "Low Battery" : "Discharging";
  };

  const executeCode = () => {
    let logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const captureLog = (type: string) => (...args: any[]) => {
      const msg = args.map(a => {
        if (typeof a === 'object') {
          try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
        }
        return String(a);
      }).join(' ');
      logs.push(`[${type}] ${msg}`);
      if (type === 'LOG') originalLog(...args);
      if (type === 'ERROR') originalError(...args);
      if (type === 'WARN') originalWarn(...args);
    };

    console.log = captureLog('LOG');
    console.error = captureLog('ERROR');
    console.warn = captureLog('WARN');
    
    try {
      const func = new Function(code);
      const result = func();
      if (result !== undefined) {
        logs.push(`\n< Return: ${String(result)}`);
      }
    } catch (e: any) {
      logs.push(`\n[EXCEPTION] ${e.message}`);
    }
    
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    
    setConsoleOutput(logs.join('\n'));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 w-full relative font-mono text-cyan-700 dark:text-cyan-400 overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 dark:opacity-20 pointer-events-none" />

      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-cyan-900/50 bg-white/50 dark:bg-neutral-900/50 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-cyan-900/30 rounded-full text-neutral-600 dark:text-cyan-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center bg-neutral-200 dark:bg-neutral-800/80 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1.5 flex items-center gap-2 rounded-md text-sm transition-all ${activeTab === 'sandbox' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              <Code className="w-4 h-4" />
              {lang === 'ar' ? 'ساندبوكس' : 'Sandbox'}
            </button>
            <button
              onClick={() => setActiveTab('sensors')}
              className={`px-3 py-1.5 flex items-center gap-2 rounded-md text-sm transition-all ${activeTab === 'sensors' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              <Zap className="w-4 h-4" />
              {lang === 'ar' ? 'المستشعرات' : 'Sensors'}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {onSaveNote && activeTab === 'sensors' && batteryLevel !== null && (
            <button
              onClick={() => onSaveNote(lang === 'ar' ? 'معلومات البطارية' : 'Battery Info', `Level: ${batteryLevel}%\nStatus: ${getStatusText()}\n${chargingTime ? 'Time to full: ' + formatTime(chargingTime) : ''}${dischargingTime ? 'Time left: ' + formatTime(dischargingTime) : ''}`)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neutral-200 dark:bg-cyan-900/40 text-neutral-700 dark:text-cyan-400 hover:bg-neutral-300 dark:hover:bg-cyan-800/50 dark:hover:text-cyan-300 rounded-lg transition-all border border-neutral-300 dark:border-cyan-800/50"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'حفظ' : 'Save'}</span>
            </button>
          )}
          {onSaveNote && activeTab === 'sandbox' && (
            <button
              onClick={() => onSaveNote(lang === 'ar' ? 'تصدير الكود' : 'Code Export', { title: "Sandbox Snippet", content: code + "\n\n/* Output:\n" + consoleOutput + "\n*/" })}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neutral-200 dark:bg-cyan-900/40 text-neutral-700 dark:text-cyan-400 hover:bg-neutral-300 dark:hover:bg-cyan-800/50 dark:hover:text-cyan-300 rounded-lg transition-all border border-neutral-300 dark:border-cyan-800/50"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'حفظ' : 'Save'}</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col z-10 overflow-hidden relative">
        {activeTab === 'sensors' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
            {!isSupported ? (
              <div className="text-center space-y-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-8 rounded-2xl border border-red-200 dark:border-red-900/30">
                <ShieldAlert className="w-16 h-16 mx-auto opacity-50" />
                <p className="text-lg text-red-700 dark:text-red-400">
                  {lang === "ar"
                    ? "واجهة البطارية غير مدعومة في هذا المتصفح أو الجهاز."
                    : "Battery API is not supported in this browser or device."}
                </p>
              </div>
            ) : batteryLevel === null ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-neutral-300 dark:border-cyan-900 border-t-cyan-500 dark:border-t-cyan-400 rounded-full animate-spin" />
                <div className="animate-pulse text-neutral-500 dark:text-cyan-600 tracking-widest uppercase text-sm">
                  {lang === "ar" ? "جاري قراءة المستشعرات..." : "Reading sensors..."}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-10 w-full max-w-lg">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="relative flex flex-col items-center"
                >
                  {getBatteryIcon()}
                  <div className="mt-4 flex flex-col items-center">
                    <span className={`text-6xl font-bold font-sans tracking-tighter ${isCharging ? 'text-yellow-500 dark:text-yellow-400' : 'text-neutral-900 dark:text-white'}`}>
                      {batteryLevel}%
                    </span>
                    <span className={`text-sm tracking-widest uppercase mt-2 ${isCharging ? 'text-yellow-600 dark:text-yellow-500/70' : 'text-neutral-500 dark:text-cyan-500/70'}`}>
                      {getStatusText()}
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 gap-4 w-full"
                >
                  <div className="flex flex-col items-center justify-center bg-white dark:bg-cyan-950/30 p-6 rounded-2xl border border-neutral-200 dark:border-cyan-900/40 shadow-sm dark:shadow-none backdrop-blur-sm">
                    <div className="text-neutral-500 dark:text-cyan-600/70 uppercase text-[10px] tracking-widest mb-2">
                      {lang === "ar" ? "الوقت المتبقي" : "Time Left"}
                    </div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-cyan-100">
                      {isCharging 
                        ? (chargingTime ? formatTime(chargingTime) : "---") 
                        : (dischargingTime ? formatTime(dischargingTime) : "---")}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-white dark:bg-cyan-950/30 p-6 rounded-2xl border border-neutral-200 dark:border-cyan-900/40 shadow-sm dark:shadow-none backdrop-blur-sm">
                    <div className="text-neutral-500 dark:text-cyan-600/70 uppercase text-[10px] tracking-widest mb-2">
                      {lang === "ar" ? "مصدر الطاقة" : "Power Source"}
                    </div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-cyan-100">
                      {isCharging ? "AC Adapter" : "Battery"}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
            <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-2 px-4 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Code className="w-4 h-4" />
                  <span>script.js</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCode("")}
                    className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Clear"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={executeCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    {lang === 'ar' ? 'تشغيل' : 'Run'}
                  </button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full p-4 bg-transparent text-sm font-mono text-neutral-800 dark:text-neutral-300 resize-none focus:outline-none"
              />
            </div>

            <div className="flex-1 lg:w-1/3 flex flex-col bg-neutral-950 rounded-xl overflow-hidden shadow-sm border border-neutral-800">
              <div className="flex items-center gap-2 p-2 px-4 bg-black border-b border-neutral-800 text-sm text-neutral-400">
                <Terminal className="w-4 h-4" />
                <span>Console</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {consoleOutput ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words text-green-400">
                    {consoleOutput}
                  </pre>
                ) : (
                  <div className="text-neutral-700 italic font-mono text-sm">
                    {lang === 'ar' ? 'لا يوجد مخرجات حتى الآن...' : 'No output yet...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
