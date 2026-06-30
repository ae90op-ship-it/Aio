import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { ArrowLeft, Film, Upload, Scissors, Save } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function VideoEditorApp({ lang, onExit, onSaveNote }: Props) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoSrc(URL.createObjectURL(file));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    }
  };

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      const handleTimeUpdate = () => {
        if (videoRef.current!.currentTime > endTime) {
          videoRef.current!.currentTime = startTime;
          videoRef.current!.pause();
        }
      };
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [endTime, startTime, videoSrc]);

  const handleSave = () => {
    if (onSaveNote && videoSrc) {
      onSaveNote(lang === 'ar' ? 'فيديو معدل' : 'Edited Video', `Start: ${startTime}s\nEnd: ${endTime}s`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button onClick={onExit} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
          <Film className="w-5 h-5 text-indigo-500" />
          {lang === 'ar' ? 'محرر الفيديو' : 'Video Editor'}
        </h2>
        <div className="flex gap-2">
          {onSaveNote && videoSrc && (
            <button onClick={handleSave} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full" title={lang === 'ar' ? 'حفظ' : 'Save'}>
              <Save className="w-5 h-5" />
            </button>
          )}
          <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full">
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
              <Scissors className="w-4 h-4" />
              {lang === 'ar' ? 'أدوات القص' : 'Trimming Tools'}
            </h3>
            {videoSrc ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">{lang === 'ar' ? 'البداية (ثانية)' : 'Start (s)'}</label>
                  <input type="range" min="0" max={duration} step="0.1" value={startTime} onChange={e => {
                    const val = Number(e.target.value);
                    if (val < endTime) {
                      setStartTime(val);
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }
                  }} className="w-full" />
                  <div className="text-right text-xs font-mono">{startTime.toFixed(1)}s</div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">{lang === 'ar' ? 'النهاية (ثانية)' : 'End (s)'}</label>
                  <input type="range" min="0" max={duration} step="0.1" value={endTime} onChange={e => {
                    const val = Number(e.target.value);
                    if (val > startTime) setEndTime(val);
                  }} className="w-full" />
                  <div className="text-right text-xs font-mono">{endTime.toFixed(1)}s</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">{lang === 'ar' ? 'قم برفع فيديو للبدء' : 'Upload a video to start'}</p>
            )}
          </div>
        </div>
        
        <div className="flex-1 bg-black flex items-center justify-center p-4">
          {videoSrc ? (
            <video ref={videoRef} src={videoSrc} controls onLoadedMetadata={handleLoadedMetadata} className="max-w-full max-h-full rounded-xl shadow-2xl" />
          ) : (
            <div className="text-center text-neutral-500">
              <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
