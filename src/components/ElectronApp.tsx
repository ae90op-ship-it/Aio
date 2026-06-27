import React, { useState, useEffect } from "react";
import { Language } from "../types";
import { ArrowLeft, Battery, BatteryCharging, Zap } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  lang: Language;
  onExit: () => void;
}

export function ElectronApp({ lang, onExit }: Props) {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    let battery: any;

    const updateBatteryInfo = () => {
      if (battery) {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
      }
    };

    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        battery = b;
        updateBatteryInfo();

        battery.addEventListener("levelchange", updateBatteryInfo);
        battery.addEventListener("chargingchange", updateBatteryInfo);
      });
    } else {
      setIsSupported(false);
    }

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", updateBatteryInfo);
        battery.removeEventListener("chargingchange", updateBatteryInfo);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-neutral-950 w-full relative font-mono text-cyan-400">
      <header className="p-4 flex items-center justify-between border-b border-cyan-900/50 bg-neutral-900/50 z-10">
        <button
          onClick={onExit}
          className="p-2 hover:bg-cyan-900/30 rounded-full text-cyan-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Electron
        </h2>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!isSupported ? (
          <div className="text-center space-y-4 text-red-400">
            <Battery className="w-16 h-16 mx-auto opacity-50" />
            <p>
              {lang === "ar"
                ? "البطارية غير مدعومة في هذا المتصفح"
                : "Battery API not supported in this browser"}
            </p>
          </div>
        ) : batteryLevel === null ? (
          <div className="animate-pulse text-cyan-600">
            {lang === "ar" ? "جاري القراءة..." : "Reading..."}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12">
            <div className="relative">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                {isCharging ? (
                  <BatteryCharging
                    className="w-48 h-48 text-yellow-400"
                    strokeWidth={1}
                  />
                ) : (
                  <Battery
                    className="w-48 h-48 text-cyan-400"
                    strokeWidth={1}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold font-sans tracking-tighter">
                    {batteryLevel}%
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center bg-cyan-950/20 p-8 rounded-3xl border border-cyan-900/30">
              <div className="space-y-2">
                <div className="text-cyan-600 uppercase text-xs tracking-widest">
                  {lang === "ar" ? "السعة" : "Capacity"}
                </div>
                <div className="text-2xl font-bold">{batteryLevel}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-cyan-600 uppercase text-xs tracking-widest">
                  {lang === "ar" ? "الحالة" : "Status"}
                </div>
                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                  {isCharging ? (
                    <span className="text-yellow-400">
                      {lang === "ar" ? "جاري الشحن" : "Charging"}
                    </span>
                  ) : (
                    <span>{lang === "ar" ? "تفريغ" : "Discharging"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
