import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { ArrowLeft, Image as ImageIcon, Upload, Video, Save } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function GalleryApp({ lang, onExit, onSaveNote }: Props) {
  const [files, setFiles] = useState<{url: string, type: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image'
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button onClick={onExit} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          {lang === 'ar' ? 'المعرض' : 'Gallery'}
        </h2>
        <div className="flex gap-2">
          {onSaveNote && (
            <button
              onClick={() => onSaveNote(lang === 'ar' ? 'المعرض' : 'Gallery', `Saved ${files.length} media items.`)}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <input type="file" multiple accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full">
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p>{lang === 'ar' ? 'لا توجد وسائط' : 'No media available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, i) => (
              <div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden relative group">
                {file.type === 'image' ? (
                  <img src={file.url} alt="Gallery item" className="w-full h-full object-cover" />
                ) : (
                  <video src={file.url} className="w-full h-full object-cover" controls />
                )}
                {file.type === 'video' && (
                  <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-md text-white">
                    <Video className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
