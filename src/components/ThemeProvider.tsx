import React from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
  theme: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({ lang, theme, children }: Props) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // "Modern Dark Minimalist" or "Modern Light Minimalist"
  const themeClasses = theme === 'dark' 
    ? 'bg-neutral-900 text-neutral-200 font-sans selection:bg-blue-500/30 selection:text-white'
    : 'bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-500/30 selection:text-white';

  return (
    <div className={`min-h-screen w-full flex flex-col ${themeClasses} ${theme}`} dir={dir}>
      {children}
    </div>
  );
}
