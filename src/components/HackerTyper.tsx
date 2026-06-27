import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { ArrowLeft } from 'lucide-react';

interface Props {
  lang: Language;
  onExit: () => void;
}

const HACKER_TEXT = `
# INITIALIZING KERNEL...
# LOADING MODULES... [OK]
# MOUNTING VFS... [OK]
# STARTING SECURE SHELL INTERFACE...

function bypass_mainframe(target_ip) {
  let socket = new Connection(target_ip, 443);
  let payload = generate_rsa_payload(4096);
  socket.send(payload);
  
  if (socket.response === 'GRANTED') {
    return extract_data(socket);
  } else {
    force_brute(socket, dict_file);
  }
}

class SystemOverride {
  constructor() {
    this.status = 'IDLE';
    this.encryption = 'AES-256';
  }
  
  initiate() {
    console.log("Starting override sequence...");
    for(let i=0; i<100; i++) {
      inject_hex(Math.random().toString(16));
    }
  }
}

// INJECTING MEMORY LEAK...
// ACCESS GRANTED.
// DOWNLOADING CLASSIFIED DATA...
`.trim();

export function HackerTyper({ lang, onExit }: Props) {
  const [typed, setTyped] = useState('');
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return; // let exit handle it
      
      setIndex(prev => {
        const next = Math.min(prev + 3 + Math.floor(Math.random() * 5), HACKER_TEXT.length);
        setTyped(HACKER_TEXT.substring(0, next));
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [typed]);

  return (
    <div className="flex flex-col h-full bg-black w-full relative" onClick={() => {
      setIndex(prev => {
        const next = Math.min(prev + 10 + Math.floor(Math.random() * 5), HACKER_TEXT.length);
        setTyped(HACKER_TEXT.substring(0, next));
        return next;
      });
    }}>
      <header className="p-4 flex items-center justify-between z-10 absolute top-0 w-full">
        <button onClick={onExit} className="p-2 bg-neutral-900 rounded-full text-green-500 hover:bg-neutral-800 border border-green-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <div 
        ref={containerRef}
        className="flex-1 p-6 pt-20 overflow-y-auto font-mono text-green-500 whitespace-pre-wrap text-sm sm:text-base leading-relaxed"
      >
        {typed}
        <span className="animate-pulse bg-green-500 text-green-500">_</span>
      </div>
      
      {typed.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-green-800 animate-pulse">
          {lang === 'ar' ? 'اضغط على أي زر للبدء...' : 'Start typing...'}
        </div>
      )}
    </div>
  );
}
