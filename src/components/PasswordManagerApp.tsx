import React, { useState } from 'react';
import { Language, ThemeMode } from '../types';
import { translations } from '../i18n';
import { ArrowLeft, Shield, Key, Plus, Copy, Eye, EyeOff, Trash2, Search, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

interface PasswordEntry {
  id: string;
  site: string;
  username: string;
  password: string;
}

export function PasswordManagerApp({ lang, theme, onBack, onSaveNote }: Props) {
  const t = translations[lang];
  const [passwords, setPasswords] = useState<PasswordEntry[]>(() => {
    const saved = localStorage.getItem('passwordManagerData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  React.useEffect(() => {
    localStorage.setItem('passwordManagerData', JSON.stringify(passwords));
  }, [passwords]);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const [newSite, setNewSite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const filtered = passwords.filter(p => p.site.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite || !newUsername || !newPassword) return;
    setPasswords(prev => [...prev, { id: Date.now().toString(), site: newSite, username: newUsername, password: newPassword }]);
    setNewSite('');
    setNewUsername('');
    setNewPassword('');
    setShowAdd(false);
  };

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removePassword = (id: string) => {
    setPasswords(prev => prev.filter(p => p.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 w-full relative font-sans text-neutral-900 dark:text-neutral-100">
      <header className="p-4 flex items-center justify-between bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">
              {lang === 'ar' ? 'مدير كلمات المرور' : 'Password Manager'}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          {onSaveNote && (
            <button
              onClick={() => onSaveNote(lang === 'ar' ? 'كلمات المرور' : 'Passwords', `Saved ${passwords.length} passwords.`)}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'البحث في كلمات المرور...' : 'Search passwords...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full pl-12 pr-4 py-3 shadow-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 text-neutral-500">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">
                {passwords.length} {lang === 'ar' ? 'كلمات مرور محفوظة' : 'saved passwords'}
              </span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">
                  {lang === 'ar' ? 'لا يوجد كلمات مرور' : 'No passwords found'}
                </div>
              ) : (
                filtered.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg font-bold text-neutral-500 capitalize flex-shrink-0">
                        {p.site.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-medium truncate">{p.site}</div>
                        <div className="text-sm text-neutral-500 truncate">{p.username}</div>
                        <div className="text-sm font-mono mt-1 flex items-center gap-2">
                          {visiblePasswords.has(p.id) ? p.password : '••••••••••••'}
                          <button onClick={() => toggleVisibility(p.id)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                            {visiblePasswords.has(p.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyToClipboard(p.password)} className="p-2 text-neutral-400 hover:text-blue-500 rounded-full" title="Copy">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => removePassword(p.id)} className="p-2 text-neutral-400 hover:text-red-500 rounded-full" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6">{lang === 'ar' ? 'إضافة كلمة مرور' : 'Add Password'}</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">{lang === 'ar' ? 'الموقع / التطبيق' : 'Site / App'}</label>
                  <input required type="text" value={newSite} onChange={e => setNewSite(e.target.value)} className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-blue-500 rounded-xl px-4 py-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
                  <input required type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-blue-500 rounded-xl px-4 py-2 focus:outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                  <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-blue-500 rounded-xl px-4 py-2 focus:outline-none" dir="ltr" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl">
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                    {lang === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
