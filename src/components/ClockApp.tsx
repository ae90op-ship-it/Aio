import React, { useState, useEffect } from "react";
import { Language, ThemeMode } from "../types";
import { ArrowLeft, Play, Square, RotateCcw, Save, Clock, Timer, Hourglass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function ClockApp({ lang, theme, onBack, onSaveNote }: Props) {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"clock" | "stopwatch" | "timer">("clock");

  // Stopwatch state
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);

  // Timer state
  const [timerDuration, setTimerDuration] = useState(25 * 60); // in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");

  const playAlarm = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const beep = (time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, time);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
      };
      const now = ctx.currentTime;
      beep(now);
      beep(now + 0.5);
      beep(now + 1.0);
      beep(now + 1.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (swRunning) {
      interval = setInterval(() => setSwTime((t) => t + 10), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timerDuration > 0) {
      interval = setInterval(() => setTimerDuration((t) => t - 1), 1000);
    } else if (timerRunning && timerDuration === 0) {
      setTimerRunning(false);
      playAlarm();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerDuration]);

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(2, "0")}`;
  };

  const formatTimer = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const appName = lang === "ar" ? "الساعة" : "Clock";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-neutral-900 w-full relative transition-colors duration-300">
      <header className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 z-10 transition-colors duration-300">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full text-slate-600 dark:text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            {appName}
          </h1>
        </div>
        <div className="flex gap-2">
          {onSaveNote && (
            <button
              onClick={() => onSaveNote(lang === "ar" ? "الوقت" : "Time", `Saved Time: ${time.toLocaleTimeString()}`)}
              className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Modern decorative backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-900/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-900/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

        <div className="w-full max-w-md bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-10 flex flex-col items-center transition-all duration-300">
          
          <div className="flex w-full bg-slate-100 dark:bg-neutral-950 p-1.5 rounded-full mb-10 shadow-inner">
            {(["clock", "stopwatch", "timer"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab 
                    ? "bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]" 
                    : "text-slate-500 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                }`}
              >
                {tab === "clock" && <Clock className="w-4 h-4" />}
                {tab === "stopwatch" && <Timer className="w-4 h-4" />}
                {tab === "timer" && <Hourglass className="w-4 h-4" />}
                <span className="hidden sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center w-full min-h-[300px] justify-center relative">
            <AnimatePresence mode="wait">
              {activeTab === "clock" && (
                <motion.div
                  key="clock"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center text-center w-full"
                >
                  <div className="text-6xl sm:text-7xl font-bold tracking-tighter mb-4 font-sans text-slate-800 dark:text-white drop-shadow-sm">
                    {time.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                  <div className="text-lg sm:text-xl text-blue-600 dark:text-blue-400 font-medium tracking-wide uppercase">
                    {time.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === "stopwatch" && (
                <motion.div
                  key="stopwatch"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <div className="text-5xl sm:text-7xl font-mono font-semibold tracking-tighter mb-12 text-slate-800 dark:text-white drop-shadow-sm">
                    {formatStopwatch(swTime)}
                  </div>
                  <div className="flex gap-4 sm:gap-6">
                    <button
                      onClick={() => setSwRunning(!swRunning)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/20 transition-transform active:scale-95"
                    >
                      {swRunning ? (
                        <Square className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                      ) : (
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 sm:ml-2 fill-current" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSwRunning(false);
                        setSwTime(0);
                      }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 flex items-center justify-center transition-transform active:scale-95 shadow-md"
                    >
                      <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "timer" && (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tighter mb-8 text-slate-800 dark:text-white drop-shadow-sm">
                    {formatTimer(timerDuration)}
                  </div>
                  {!timerRunning && timerDuration === 0 && (
                    <div className="text-rose-500 mb-6 font-bold text-xl animate-pulse uppercase tracking-widest">
                      Time's up!
                    </div>
                  )}
                  
                  <div className="flex gap-2 sm:gap-4 mb-8">
                    {[5, 15, 25].map(m => (
                      <button
                        key={m}
                        onClick={() => setTimerDuration(m * 60)}
                        className="px-4 py-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl text-sm font-semibold transition-colors border border-slate-200 dark:border-neutral-700 shadow-sm"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mb-8 items-center justify-center w-full">
                    <input
                      type="number"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      placeholder="H"
                      className="w-16 h-12 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-center font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                      min="0"
                    />
                    <span className="text-slate-400 font-bold">:</span>
                    <input
                      type="number"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="M"
                      className="w-16 h-12 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-center font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                      min="0" max="59"
                    />
                    <span className="text-slate-400 font-bold">:</span>
                    <input
                      type="number"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(e.target.value)}
                      placeholder="S"
                      className="w-16 h-12 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-center font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                      min="0" max="59"
                    />
                    <button
                      onClick={() => {
                        const h = parseInt(customHours, 10) || 0;
                        const m = parseInt(customMinutes, 10) || 0;
                        const s = parseInt(customSeconds, 10) || 0;
                        const totalSecs = h * 3600 + m * 60 + s;
                        if (totalSecs > 0) {
                          setTimerDuration(totalSecs);
                          setCustomHours("");
                          setCustomMinutes("");
                          setCustomSeconds("");
                        }
                      }}
                      className="ml-2 px-4 h-12 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors shadow-md active:scale-95"
                    >
                      Set
                    </button>
                  </div>

                  <div className="flex gap-4">
                     <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    >
                      {timerRunning ? (
                        <Square className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setTimerRunning(false);
                        setTimerDuration(25 * 60);
                      }}
                      className="w-16 h-16 rounded-full bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 flex items-center justify-center shadow-md transition-transform active:scale-95"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
