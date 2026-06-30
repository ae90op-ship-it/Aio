import React from "react";
import { Language, ThemeMode } from "../types";

interface Props {
  lang: Language;
  theme: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({ lang, theme, children }: Props) {
  const dir = lang === "ar" ? "rtl" : "ltr";

  const themeClasses = theme === "dark" ? "dark" : "";

  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-blue-500/30 selection:text-white ${themeClasses}`}
      dir={dir}
    >
      {children}
    </div>
  );
}
