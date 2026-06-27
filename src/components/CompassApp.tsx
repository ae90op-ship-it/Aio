import React, { useState, useEffect } from 'react';
import { Language, ThemeMode } from '../types';
import { translations } from '../i18n';
import { ArrowLeft, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
}

export function CompassApp({ lang, theme, onBack }: Props) {
  const t = translations[lang];
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore
      let h = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      setHeading(h);
    };

    if (window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // We'd need user gesture here, but let's try without it or handle error
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      setError(lang === 'ar' ? 'البوصلة غير مدعومة' : 'Compass not supported');
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [lang]);

  const requestAccess = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
            // @ts-ignore
            let h = e.webkitCompassHeading || Math.abs(e.alpha - 360);
            setHeading(h);
          });
        } else {
          setError(lang === 'ar' ? 'الإذن مرفوض' : 'Permission denied');
        }
      }
    } catch (e) {
      setError(lang === 'ar' ? 'تعذر طلب الإذن' : 'Could not request permission');
    }
  };

  const getDirection = (degree: number) => {
    const directionsAr = ['شمال', 'شمال شرقي', 'شرق', 'جنوب شرقي', 'جنوب', 'جنوب غربي', 'غرب', 'شمال غربي'];
    const directionsEn = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const directions = lang === 'ar' ? directionsAr : directionsEn;
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
        <button onClick={onBack} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          {lang === 'ar' ? 'البوصلة' : 'Compass'}
        </h2>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {error ? (
          <div className="text-center">
            <Compass className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : heading === null ? (
          <div className="text-center space-y-6">
            <Compass className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p className="text-neutral-500 dark:text-neutral-400">
              {lang === 'ar' ? 'يجب إعطاء الصلاحية أو تحريك الجهاز' : 'Please grant permission or move device'}
            </p>
            {typeof (DeviceOrientationEvent as any).requestPermission === 'function' && (
              <button 
                onClick={requestAccess}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg"
              >
                {lang === 'ar' ? 'تفعيل البوصلة' : 'Enable Compass'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-neutral-300 dark:border-neutral-700 rounded-full shadow-inner" />
              <div className="absolute inset-2 border-2 border-dashed border-neutral-400/50 dark:border-neutral-600/50 rounded-full" />
              
              <div className="absolute top-4 font-bold text-red-500 text-xl z-10">N</div>
              <div className="absolute bottom-4 font-bold text-neutral-500 dark:text-neutral-400 text-xl z-10">S</div>
              <div className="absolute right-4 font-bold text-neutral-500 dark:text-neutral-400 text-xl z-10">E</div>
              <div className="absolute left-4 font-bold text-neutral-500 dark:text-neutral-400 text-xl z-10">W</div>

              <motion.div 
                className="absolute inset-0 flex justify-center items-center"
                animate={{ rotate: -heading }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              >
                <div className="w-2 h-40 md:h-56 flex flex-col justify-between items-center relative">
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[60px] md:border-b-[80px] border-l-transparent border-r-transparent border-b-red-500" />
                  <div className="w-4 h-4 bg-neutral-900 dark:bg-white rounded-full absolute top-1/2 -translate-y-1/2 shadow-lg z-20" />
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[60px] md:border-t-[80px] border-l-transparent border-r-transparent border-t-neutral-800 dark:border-t-neutral-200" />
                </div>
              </motion.div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-5xl font-mono font-bold text-neutral-900 dark:text-white">
                {Math.round(heading)}°
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {getDirection(heading)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
