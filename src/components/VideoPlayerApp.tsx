import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { ArrowLeft, PlaySquare, Upload, Save } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function VideoPlayerApp({ lang, onExit, onSaveNote }: Props) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoSrc(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button onClick={onExit} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
          <PlaySquare className="w-5 h-5 text-purple-500" />
          {lang === 'ar' ? 'مشغل الفيديو' : 'Video Player'}
        </h2>
        <div className="flex gap-2">
          {onSaveNote && (
            <button
              onClick={() => onSaveNote(lang === 'ar' ? 'مشغل الفيديو' : 'Video Player', `Video ${videoSrc ? 'loaded' : 'empty'}`)}
              className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full">
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </header>
      <div className="flex-1 bg-black flex items-center justify-center p-4">
        {videoSrc ? (
          <video src={videoSrc} controls autoPlay className="max-w-full max-h-full rounded-xl shadow-2xl" />
        ) : (
          <div className="text-center text-neutral-500">
            <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{lang === 'ar' ? 'يرجى اختيار فيديو' : 'Please select a video'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
