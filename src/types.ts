export type Language = 'ar' | 'en' | 'ja';
export type ThemeMode = 'light' | 'dark';

export type AppCategory = 'SYSTEM & UTILITIES' | 'PRODUCTIVITY & OFFICE' | 'MEDIA & SCANNING' | 'NETWORK & PASSWORDS';

export interface AppData {
  id: string;
  name: Record<Language, string>;
  category: AppCategory;
  icon: string;
  description: Record<Language, string>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  updatedAt: number;
}

