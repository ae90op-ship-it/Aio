import React, { useState, useEffect } from "react";
import { Language, ThemeMode } from "../types";
import { ArrowRight, Play, Square, RotateCcw, Save } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function ClockApp({ lang, theme, onBack, onSaveNote }: Props) {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"clock" | "stopwatch" | "timer">(
    "clock",
  );

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
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();

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

  const themeDisplay =
    theme === "dark"
      ? lang === "ar"
        ? "داكن"
        : lang === "ja"
          ? "ダーク"
          : "Dark"
      : lang === "ar"
        ? "فاتح"
        : lang === "ja"
          ? "ライト"
          : "Light";
  const langDisplay =
    lang === "ar" ? "العربية" : lang === "en" ? "English" : "日本語";
  const appName = lang === "ar" ? "الساعة" : lang === "en" ? "Clock" : "時計";

  return (
    <motion.div
      initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
      className="flex-1 flex flex-col w-full h-screen relative bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200"
    >
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col gap-1">
          <div
            className="text-xs font-mono text-neutral-500 dark:text-neutral-400 opacity-80"
            dir="ltr"
          >
            {`[${themeDisplay} | ${langDisplay} > ${appName}]`}
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {appName}
          </h1>
        </div>
        <div className="flex gap-2">
          {onSaveNote && (
            <button
              onClick={() => onSaveNote(lang === "ar" ? "الوقت" : "Time", `Saved Time: ${time.toLocaleTimeString()}`)}
              className="p-2 text-blue-500 hover:text-white dark:text-blue-400 dark:hover:text-white bg-blue-50 hover:bg-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-600 rounded-full transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onBack}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ArrowRight
              className={`w-5 h-5 ${lang === "ar" ? "" : "rotate-180"}`}
            />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 flex flex-col items-center">
        <div className="flex gap-4 mb-12 bg-neutral-200 dark:bg-neutral-800 p-1.5 rounded-2xl">
          {(["clock", "stopwatch", "timer"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? "bg-white dark:bg-neutral-900 text-blue-500 shadow-sm" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
          {activeTab === "clock" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-7xl font-light tracking-wider mb-4 font-mono text-neutral-900 dark:text-white">
                {time.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="text-xl text-blue-500 font-medium">
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-6xl font-mono tracking-widest mb-12 text-neutral-900 dark:text-white">
                {formatStopwatch(swTime)}
              </div>
              <div className="flex gap-6">
                <button
                  onClick={() => setSwRunning(!swRunning)}
                  className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                >
                  {swRunning ? (
                    <Square className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSwRunning(false);
                    setSwTime(0);
                  }}
                  className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-transform hover:scale-105"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "timer" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-7xl font-mono tracking-widest mb-12 text-neutral-900 dark:text-white">
                {formatTimer(timerDuration)}
              </div>
              {!timerRunning && timerDuration === 0 && (
                <div className="text-red-500 mb-8 font-bold animate-bounce">
                  Time's up!
                </div>
              )}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setTimerDuration(5 * 60)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-sm"
                >
                  5m
                </button>
                <button
                  onClick={() => setTimerDuration(15 * 60)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-sm"
                >
                  15m
                </button>
                <button
                  onClick={() => setTimerDuration(25 * 60)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-sm"
                >
                  25m
                </button>
              </div>
              <div className="flex gap-2 mb-8 items-center flex-wrap justify-center">
                <input
                  type="number"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  placeholder="H"
                  className="w-16 px-2 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-center font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="M"
                  className="w-16 px-2 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-center font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="59"
                />
                <input
                  type="number"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(e.target.value)}
                  placeholder="S"
                  className="w-16 px-2 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-center font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="59"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
                >
                  {lang === "ar" ? "إضافة" : "Set"}
                </button>
              </div>
              <div className="flex gap-6">
                <button
                  onClick={() => {
                    if (timerDuration === 0) setTimerDuration(25 * 60);
                    setTimerRunning(!timerRunning);
                  }}
                  className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
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
                  className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-transform hover:scale-105"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
