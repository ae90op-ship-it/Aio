import { AppData, Language } from './types';

export const APPS: AppData[] = [
  // SYSTEM & UTILITIES
  { 
    id: 'clock', 
    name: { ar: 'الساعة', en: 'Clock', ja: '時計' }, 
    category: 'SYSTEM & UTILITIES', 
    icon: 'Clock', 
    description: { ar: 'منبهات، مؤقتات، ساعة عالمية، بومودورو.', en: 'Alarms, timers, world clock, Pomodoro.', ja: 'アラーム、タイマー、世界時計、ポモドーロ。' } 
  },
  { 
    id: 'security', 
    name: { ar: 'الحماية', en: 'Security', ja: 'セキュリティ' }, 
    category: 'SYSTEM & UTILITIES', 
    icon: 'ShieldCheck', 
    description: { ar: 'فحص الخصوصية، قوة كلمة المرور، نصائح أمنية.', en: 'Privacy checker, password strength, security tips.', ja: 'プライバシーチェック、パスワード強度、セキュリティのヒント。' } 
  },
  { 
    id: 'compass', 
    name: { ar: 'البوصلة', en: 'Compass', ja: 'コンパス' }, 
    category: 'SYSTEM & UTILITIES', 
    icon: 'Compass', 
    description: { ar: 'الاتجاهات، إحداثيات GPS، محاكاة الملاحة.', en: 'Bearings, GPS coordinates, navigation simulation.', ja: '方位、GPS座標、ナビゲーションシミュレーション。' } 
  },
  { 
    id: 'calculator', 
    name: { ar: 'الآلة الحاسبة', en: 'Calculator', ja: '電卓' }, 
    category: 'SYSTEM & UTILITIES', 
    icon: 'Calculator', 
    description: { ar: 'معادلات أساسية وحلال مصفوفات/تفاضل وتكامل علمي متقدم.', en: 'Basic equations and advanced scientific matrix/calculus solver.', ja: '基本方程式と高度な科学的行列/微積分ソルバー。' } 
  },

  // PRODUCTIVITY & OFFICE
  { 
    id: 'spreadsheets', 
    name: { ar: 'جداول البيانات', en: 'Spreadsheets', ja: 'スプレッドシート' }, 
    category: 'PRODUCTIVITY & OFFICE', 
    icon: 'Table', 
    description: { ar: 'إنشاء جداول CSV، مساعد صيغ Excel.', en: 'Create CSV tables, Excel formula helper.', ja: 'CSVテーブルの作成、Excel数式ヘルパー。' } 
  },
  { 
    id: 'filemanager', 
    name: { ar: 'مدير الملفات', en: 'File Manager', ja: 'ファイルマネージャー' }, 
    category: 'PRODUCTIVITY & OFFICE', 
    icon: 'Folder', 
    description: { ar: 'هياكل المجلدات، تنظيف التخزين الافتراضي.', en: 'Folder structures, virtual storage cleanup.', ja: 'フォルダ構造、仮想ストレージのクリーンアップ。' } 
  },
  { 
    id: 'wpsoffice', 
    name: { ar: 'WPS Office', en: 'WPS Office', ja: 'WPS Office' }, 
    category: 'PRODUCTIVITY & OFFICE', 
    icon: 'FileText', 
    description: { ar: 'صياغة المستندات، الكتابة الرسمية، تحرير المقالات.', en: 'Document drafting, formal writing, essay editing.', ja: '文書作成、正式な執筆、エッセイ編集。' } 
  },
  { 
    id: 'tooly', 
    name: { ar: 'Tooly & Device Info', en: 'Tooly & Device Info', ja: 'Tooly & デバイス情報' }, 
    category: 'PRODUCTIVITY & OFFICE', 
    icon: 'Wrench', 
    description: { ar: 'أدوات النص (regex، تغيير الحالة) ومواصفات نظام الأجهزة.', en: 'Text tools (regex, case change) and hardware system specs.', ja: 'テキストツール（正規表現、大文字小文字の変更）およびハードウェアシステム仕様。' } 
  },

  // MEDIA & SCANNING
  { 
    id: 'gallery', 
    name: { ar: 'المعرض & فيديو مي', en: 'Gallery & Mi Video', ja: 'ギャラリー & Miビデオ' }, 
    category: 'MEDIA & SCANNING', 
    icon: 'Image', 
    description: { ar: 'بيانات وصفية للصور/الفيديو، برمجة نصية، علامات.', en: 'Image/video metadata, scripting, tags.', ja: '画像/ビデオのメタデータ、スクリプト作成、タグ。' } 
  },
  { 
    id: 'imageresizer', 
    name: { ar: 'مغير حجم الصور', en: 'Image Resizer', ja: '画像リサイズ' }, 
    category: 'MEDIA & SCANNING', 
    icon: 'Maximize', 
    description: { ar: 'نسب العرض إلى الارتفاع، الأبعاد، حسابات البكسل.', en: 'Aspect ratios, dimensions, pixel calculations.', ja: 'アスペクト比、寸法、ピクセル計算。' } 
  },
  { 
    id: 'imagetopdf', 
    name: { ar: 'محول الصور إلى PDF', en: 'Image to PDF', ja: '画像をPDFに変換' }, 
    category: 'MEDIA & SCANNING', 
    icon: 'FileUp', 
    description: { ar: 'تجميع المستندات في مسارات PDF.', en: 'Compiling documents into PDF flows.', ja: 'ドキュメントをPDFフローにコンパイル。' } 
  },
  { 
    id: 'camscanner', 
    name: { ar: 'CamScanner', en: 'CamScanner', ja: 'CamScanner' }, 
    category: 'MEDIA & SCANNING', 
    icon: 'Scan', 
    description: { ar: 'محرك التعرف الضوئي على الحروف، استخراج النص، تصحيح المحاذاة.', en: 'OCR engine, text extraction from images, alignment correction.', ja: 'OCRエンジン、画像からのテキスト抽出、配置補正。' } 
  },

  // NETWORK & PASSWORDS
  { 
    id: 'passwords', 
    name: { ar: 'كلمات المرور', en: 'Passwords', ja: 'パスワード' }, 
    category: 'NETWORK & PASSWORDS', 
    icon: 'Key', 
    description: { ar: 'محاكاة قبو آمن، مولد كلمات المرور.', en: 'Secure vault simulation, password generator.', ja: '安全なボールトシミュレーション、パスワードジェネレータ。' } 
  },
  { 
    id: 'glasswire', 
    name: { ar: 'GlassWire', en: 'GlassWire', ja: 'GlassWire' }, 
    category: 'NETWORK & PASSWORDS', 
    icon: 'Activity', 
    description: { ar: 'سجلات حركة مرور الشبكة والتشخيصات.', en: 'Network traffic logs and diagnostics.', ja: 'ネットワークトラフィックのログと診断。' } 
  },
  { 
    id: 'electron', 
    name: { ar: 'Electron', en: 'Electron', ja: 'Electron' }, 
    category: 'NETWORK & PASSWORDS', 
    icon: 'Battery', 
    description: { ar: 'تشخيصات صحة البطارية.', en: 'Battery health diagnostics.', ja: 'バッテリーの状態の診断。' } 
  }
];

// Helper to get app by ID
export const getAppById = (id: string) => APPS.find(a => a.id === id);
