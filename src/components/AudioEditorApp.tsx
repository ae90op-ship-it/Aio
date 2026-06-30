import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { ArrowLeft, Music, Upload, Scissors, Save, Volume2 } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function AudioEditorApp({ lang, onExit, onSaveNote }: Props) {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioSrc(URL.createObjectURL(file));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setEndTime(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
  };

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      const handleTimeUpdate = () => {
        if (audioRef.current!.currentTime > endTime) {
          audioRef.current!.currentTime = startTime;
          audioRef.current!.pause();
        }
      };
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [endTime, startTime, audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleSave = () => {
    if (onSaveNote && audioSrc) {
      onSaveNote(lang === 'ar' ? 'صوت معدل' : 'Edited Audio', `Start: ${startTime}s\nEnd: ${endTime}s\nVolume: ${volume}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button onClick={onExit} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
          <Music className="w-5 h-5 text-pink-500" />
          {lang === 'ar' ? 'محرر الصوت' : 'Audio Editor'}
        </h2>
        <div className="flex gap-2">
          {onSaveNote && audioSrc && (
            <button onClick={handleSave} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full" title={lang === 'ar' ? 'حفظ' : 'Save'}>
              <Save className="w-5 h-5" />
            </button>
          )}
          <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-full">
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 flex flex-col gap-6 overflow-y-auto max-w-2xl mx-auto shadow-xl">
          {audioSrc ? (
            <div className="space-y-8">
              <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-2xl flex flex-col items-center">
                <audio ref={audioRef} src={audioSrc} controls onLoadedMetadata={handleLoadedMetadata} className="w-full" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
                  <Scissors className="w-4 h-4" />
                  {lang === 'ar' ? 'أدوات القص' : 'Trimming Tools'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">{lang === 'ar' ? 'البداية (ثانية)' : 'Start (s)'}</label>
                    <input type="range" min="0" max={duration} step="0.1" value={startTime} onChange={e => {
                      const val = Number(e.target.value);
                      if (val < endTime) {
                        setStartTime(val);
                        if (audioRef.current) audioRef.current.currentTime = val;
                      }
                    }} className="w-full" />
                    <div className="text-right text-xs font-mono text-neutral-600 dark:text-neutral-400">{startTime.toFixed(1)}s</div>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">{lang === 'ar' ? 'النهاية (ثانية)' : 'End (s)'}</label>
                    <input type="range" min="0" max={duration} step="0.1" value={endTime} onChange={e => {
                      const val = Number(e.target.value);
                      if (val > startTime) setEndTime(val);
                    }} className="w-full" />
                    <div className="text-right text-xs font-mono text-neutral-600 dark:text-neutral-400">{endTime.toFixed(1)}s</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
                  <Volume2 className="w-4 h-4" />
                  {lang === 'ar' ? 'مستوى الصوت' : 'Volume'}
                </h3>
                <div>
                  <input type="range" min="0" max="2" step="0.1" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full" />
                  <div className="text-right text-xs font-mono text-neutral-600 dark:text-neutral-400">{Math.round(volume * 100)}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-neutral-500 flex flex-col items-center justify-center py-20">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{lang === 'ar' ? 'قم برفع ملف صوتي للبدء' : 'Upload an audio file to start'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
