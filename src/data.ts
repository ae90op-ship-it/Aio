import { AppData, Language } from "./types";

export const APPS: AppData[] = [
  {
    id: "notes",
    name: { ar: "الملاحظات", en: "Notes", ja: "ノート" },
    category: "PRODUCTIVITY",
    icon: "FileText",
    description: {
      ar: "محرر نصوص للملاحظات والأفكار.",
      en: "Text editor for notes and ideas.",
      ja: "メモやアイデアのためのテキストエディタ。",
    },
  },
  {
    id: "spreadsheets",
    name: { ar: "جدول البيانات", en: "Spreadsheets", ja: "スプレッドシート" },
    category: "PRODUCTIVITY",
    icon: "Table",
    description: {
      ar: "إنشاء جداول CSV، مساعد صيغ Excel.",
      en: "Create CSV tables, Excel formula helper.",
      ja: "CSVテーブルの作成、Excel数式ヘルパー。",
    },
  },
  {
    id: "drawing",
    name: { ar: "برنامج الرسم", en: "Drawing App", ja: "お絵かきアプリ" },
    category: "CREATIVE",
    icon: "Palette",
    description: {
      ar: "رسم حر، ألوان متعددة، ومسح.",
      en: "Free drawing, multiple colors, and erase.",
      ja: "自由な描画、複数の色、消去。",
    },
  },
  {
    id: "clock",
    name: { ar: "الساعة", en: "Clock", ja: "時計" },
    category: "UTILITIES",
    icon: "Clock",
    description: {
      ar: "منبهات، مؤقتات، ساعة عالمية، بومودورو.",
      en: "Alarms, timers, world clock, Pomodoro.",
      ja: "アラーム、タイマー、世界時計、ポモドーロ。",
    },
  },
  {
    id: "compass",
    name: { ar: "البوصلة", en: "Compass", ja: "コンパス" },
    category: "UTILITIES",
    icon: "Compass",
    description: {
      ar: "الاتجاهات، إحداثيات GPS، محاكاة الملاحة.",
      en: "Bearings, GPS coordinates, navigation simulation.",
      ja: "方位、GPS座標、ナビゲーションシミュレーション。",
    },
  },
  {
    id: "calculator",
    name: { ar: "الآلة الحاسبة", en: "Calculator", ja: "電卓" },
    category: "UTILITIES",
    icon: "Calculator",
    description: {
      ar: "معادلات أساسية وحلال مصفوفات/تفاضل وتكامل علمي متقدم.",
      en: "Basic equations and advanced scientific matrix/calculus solver.",
      ja: "基本方程式と高度な科学的行列/微積分ソルバー。",
    },
  },
  {
    id: "passwords",
    name: { ar: "كلمات المرور", en: "Password Manager", ja: "パスワードマネージャー" },
    category: "SECURITY",
    icon: "Key",
    description: {
      ar: "محاكاة قبو آمن، مولد كلمات المرور.",
      en: "Secure vault simulation, password generator.",
      ja: "安全なボールトシミュレーション、パスワードジェネレータ。",
    },
  },
  {
    id: "electron",
    name: { ar: "الكترون", en: "Electron", ja: "電子" },
    category: "SYSTEM",
    icon: "Zap",
    description: {
      ar: "معلومات البطارية.",
      en: "Battery information.",
      ja: "バッテリー情報。",
    },
  },
  {
    id: "gallery",
    name: { ar: "المعرض", en: "Gallery", ja: "ギャラリー" },
    category: "MEDIA",
    icon: "Image",
    description: {
      ar: "عرض الصور والمجلدات المرئية.",
      en: "View images and visual folders.",
      ja: "画像とビジュアルフォルダを表示。",
    },
  },
  {
    id: "imageresizer",
    name: { ar: "مغير حجم الصورة", en: "Image Resizer", ja: "画像リサイズ" },
    category: "MEDIA",
    icon: "Maximize",
    description: {
      ar: "نسب العرض إلى الارتفاع، الأبعاد، حسابات البكسل.",
      en: "Aspect ratios, dimensions, pixel calculations.",
      ja: "アスペクト比、寸法、ピクセル計算。",
    },
  },
  {
    id: "videoplayer",
    name: { ar: "مشغل الفيديو", en: "Video Player", ja: "ビデオプレーヤー" },
    category: "MEDIA",
    icon: "PlaySquare",
    description: {
      ar: "تشغيل الفيديوهات بجميع الصيغ.",
      en: "Play videos in all formats.",
      ja: "すべてのフォーマットのビデオを再生。",
    },
  },
  {
    id: "videoeditor",
    name: { ar: "محرر الفيديو", en: "Video Editor", ja: "ビデオエディタ" },
    category: "MEDIA",
    icon: "Film",
    description: {
      ar: "قص وتعديل وإضافة تأثيرات للفيديو.",
      en: "Trim, edit, and add effects to videos.",
      ja: "ビデオのトリミング、編集、エフェクトの追加。",
    },
  },
  {
    id: "audioeditor",
    name: { ar: "محرر الصوت", en: "Audio Editor", ja: "オーディオエディタ" },
    category: "MEDIA",
    icon: "Music",
    description: {
      ar: "قص وتعديل ودمج الملفات الصوتية.",
      en: "Trim, edit, and merge audio files.",
      ja: "オーディオファイルのトリミング、編集、結合。",
    },
  },
];

export const getAppById = (id: string) => APPS.find((a) => a.id === id);
