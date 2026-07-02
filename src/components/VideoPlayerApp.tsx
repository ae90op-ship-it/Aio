import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { ArrowLeft, PlaySquare, Upload, Save, Scissors, Layers, Image as ImageIcon, Music, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  onExit: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

export function VideoPlayerApp({ lang, onExit, onSaveNote }: Props) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Editor State
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [layers, setLayers] = useState<{id: string, type: 'audio' | 'image', src: string}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layerInputRef = useRef<HTMLInputElement>(null);
  const [layerTypeToAdd, setLayerTypeToAdd] = useState<'audio' | 'image' | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoSrc(URL.createObjectURL(file));
      setShowEditor(true);
    }
  };

  const handleLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && layerTypeToAdd) {
      setLayers([...layers, { id: Date.now().toString(), type: layerTypeToAdd, src: URL.createObjectURL(file) }]);
    }
    setLayerTypeToAdd(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (endTime === 0) setEndTime(videoRef.current.duration);
    }
  };

  useEffect(() => {
    if (videoRef.current && videoSrc && showEditor) {
      const handleTimeUpdate = () => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          if (videoRef.current.currentTime > endTime) {
            videoRef.current.currentTime = startTime;
            videoRef.current.pause();
          }
        }
      };
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [endTime, startTime, videoSrc, showEditor]);

  return (
    <div className="flex flex-col h-full bg-neutral-950 w-full relative overflow-hidden text-neutral-100 font-sans">
      <header className="p-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-900 z-10 shrink-0">
        <button onClick={onExit} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          <PlaySquare className="w-5 h-5 text-indigo-500" />
          {lang === 'ar' ? 'الفيديو' : 'Video'}
        </h2>
        <div className="flex gap-2">
          {videoSrc && (
            <button
              onClick={() => setShowEditor(!showEditor)}
              className={`p-2 rounded-full transition-colors ${showEditor ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-900/30'}`}
            >
              <Scissors className="w-5 h-5" />
            </button>
          )}
          {onSaveNote && (
            <button
              onClick={() => onSaveNote(lang === 'ar' ? 'الفيديو' : 'Video', `Video ${videoSrc ? 'loaded' : 'empty'}`)}
              className="p-2 text-indigo-400 hover:bg-indigo-900/30 rounded-full"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-indigo-400 hover:bg-indigo-900/30 rounded-full">
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 bg-black">
        {/* Main Video View */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          {videoSrc ? (
            <div className="relative max-w-full max-h-full">
              <video 
                src={videoSrc} 
                controls={!showEditor} 
                autoPlay 
                ref={videoRef}
                onLoadedMetadata={handleLoadedMetadata}
                className="max-w-full max-h-full rounded-xl shadow-2xl" 
              />
              {/* Render Layers (Images) */}
              {layers.filter(l => l.type === 'image').map(layer => (
                <img key={layer.id} src={layer.src} className="absolute top-4 right-4 w-24 h-24 object-cover rounded-lg shadow-lg border-2 border-white/20" alt="overlay" />
              ))}
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-neutral-700 hover:border-indigo-500 hover:bg-neutral-900/50 transition-all text-neutral-500 hover:text-indigo-400 cursor-pointer"
            >
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <p className="font-medium text-lg">{lang === 'ar' ? 'إضافة فيديو جديد' : 'Import New Video'}</p>
            </button>
          )}
        </div>

        {/* Timeline Editor (CapCut Style) */}
        <AnimatePresence>
          {showEditor && videoSrc && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 280, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 bg-neutral-900 border-t border-neutral-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Timeline</span>
                <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {/* Main Video Track */}
                <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2 text-xs font-medium text-indigo-300">
                    <span className="flex items-center gap-1"><Film className="w-3 h-3" /> Main Track</span>
                  </div>
                  <div className="relative h-12 bg-neutral-800 rounded-md overflow-hidden border border-neutral-700">
                    <div 
                      className="absolute inset-y-0 bg-indigo-600/30 border-x-2 border-indigo-500 rounded-md cursor-ew-resize"
                      style={{ 
                        left: `${(startTime / duration) * 100}%`, 
                        right: `${100 - (endTime / duration) * 100}%` 
                      }}
                    />
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                    <input 
                      type="range" min={0} max={duration} step={0.1} value={startTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val < endTime) {
                          setStartTime(val);
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                    <input 
                      type="range" min={0} max={duration} step={0.1} value={endTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > startTime) setEndTime(val);
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Additional Layers */}
                {layers.map((layer, index) => (
                  <div key={layer.id} className="bg-neutral-800/50 rounded-lg p-2 border border-neutral-700/50 flex items-center gap-3">
                    {layer.type === 'audio' ? <Music className="w-4 h-4 text-emerald-400 shrink-0" /> : <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />}
                    <div className="flex-1 h-8 bg-neutral-700 rounded-md overflow-hidden relative border border-neutral-600">
                       <div className="absolute inset-0 bg-emerald-500/20" />
                    </div>
                  </div>
                ))}

                {/* Add Layer Buttons */}
                <div className="flex gap-2 pt-2">
                  <input type="file" accept={layerTypeToAdd === 'audio' ? 'audio/*' : 'image/*'} className="hidden" ref={layerInputRef} onChange={handleLayerUpload} />
                  <button 
                    onClick={() => { setLayerTypeToAdd('audio'); setTimeout(() => layerInputRef.current?.click(), 0); }}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Music className="w-3 h-3" /> Add Audio
                  </button>
                  <button 
                    onClick={() => { setLayerTypeToAdd('image'); setTimeout(() => layerInputRef.current?.click(), 0); }}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-2 transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" /> Add Image
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
