import React, { useRef, useState, useEffect } from "react";
import { Language } from "../types";
import {
  ArrowLeft,
  Image as ImageIcon,
  Download,
  Upload,
  Maximize,
  Crop,
  Square,
  Save,
} from "lucide-react";

interface Props {
  lang: Language;
  onExit: () => void;
  onSaveNote?: (title: string, data: any) => void;
}

type ResizeMode = "fit" | "crop" | "pad";

export function ImageResizerApp({ lang, onExit, onSaveNote }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(800);
  const [mode, setMode] = useState<ResizeMode>("pad");
  const [filter, setFilter] = useState<string>("none");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );

  useEffect(() => {
    if (originalImage && canvasRef.current) {
      renderImage();
    }
  }, [originalImage, targetWidth, targetHeight, mode, filter]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setImageSrc(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const renderImage = () => {
    if (!originalImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure valid dimensions
    const tw = Math.max(1, targetWidth || 1);
    const th = Math.max(1, targetHeight || 1);

    canvas.width = tw;
    canvas.height = th;

    const imgW = originalImage.width;
    const imgH = originalImage.height;

    ctx.clearRect(0, 0, tw, th);

    if (mode === "fit") {
      ctx.filter = filter;
      const scale = Math.min(tw / imgW, th / imgH);
      const w = imgW * scale;
      const h = imgH * scale;
      const x = (tw - w) / 2;
      const y = (th - h) / 2;
      ctx.drawImage(originalImage, x, y, w, h);
    } else if (mode === "crop") {
      ctx.filter = filter;
      const scale = Math.max(tw / imgW, th / imgH);
      const w = imgW * scale;
      const h = imgH * scale;
      const x = (tw - w) / 2;
      const y = (th - h) / 2;
      ctx.drawImage(originalImage, x, y, w, h);
    } else if (mode === "pad") {
      // Draw blurred background
      const bgScale = Math.max(tw / imgW, th / imgH);
      const bgW = imgW * bgScale;
      const bgH = imgH * bgScale;
      const bgX = (tw - bgW) / 2;
      const bgY = (th - bgH) / 2;

      ctx.filter = "blur(20px) brightness(0.8)";
      ctx.drawImage(originalImage, bgX, bgY, bgW, bgH);

      // Draw main image
      ctx.filter = filter;
      const scale = Math.min(tw / imgW, th / imgH);
      const w = imgW * scale;
      const h = imgH * scale;
      const x = (tw - w) / 2;
      const y = (th - h) / 2;
      ctx.drawImage(originalImage, x, y, w, h);
    }
  };

  const downloadImage = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "resized-image.png";
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <button
          onClick={onExit}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-600 dark:text-neutral-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
          <ImageIcon className="w-5 h-5 text-purple-500" />
          {lang === "ar" ? "مغير حجم الصورة" : "Image Resizer"}
        </h2>
        <div className="flex gap-2">
          {onSaveNote && imageSrc && (
            <button
              onClick={() => {
                if (canvasRef.current) {
                  const dataUrl = canvasRef.current.toDataURL("image/png");
                  onSaveNote(lang === "ar" ? "صورة معدلة" : "Resized Image", dataUrl);
                }
              }}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
              title={lang === "ar" ? "حفظ كملاحظة" : "Save as Note"}
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          {imageSrc && (
            <button
              onClick={downloadImage}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-full md:w-80 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 overflow-y-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              {lang === "ar" ? "اختر صورة" : "Choose Image"}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {lang === "ar" ? "الأبعاد (بكسل)" : "Dimensions (px)"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {lang === "ar" ? "العرض" : "Width"}
                </label>
                <input
                  type="number"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {lang === "ar" ? "الطول" : "Height"}
                </label>
                <input
                  type="number"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {lang === "ar" ? "وضع التحجيم" : "Resize Mode"}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setMode("pad")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${mode === "pad" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300"}`}
              >
                <Square className="w-5 h-5" />
                <div className="text-start">
                  <div className="font-medium">
                    {lang === "ar" ? "ملء مع خلفية ضبابية" : "Pad with blur"}
                  </div>
                  <div className="text-xs opacity-70">
                    {lang === "ar"
                      ? "مثل الصورة المرسلة"
                      : "Like reference image"}
                  </div>
                </div>
              </button>
              <button
                onClick={() => setMode("crop")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${mode === "crop" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300"}`}
              >
                <Crop className="w-5 h-5" />
                <div className="text-start">
                  <div className="font-medium">
                    {lang === "ar" ? "قص للأبعاد" : "Crop to dimensions"}
                  </div>
                  <div className="text-xs opacity-70">
                    {lang === "ar"
                      ? "يملأ الإطار بالكامل"
                      : "Fills entire frame"}
                  </div>
                </div>
              </button>
              <button
                onClick={() => setMode("fit")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${mode === "fit" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300"}`}
              >
                <Maximize className="w-5 h-5" />
                <div className="text-start">
                  <div className="font-medium">
                    {lang === "ar" ? "ملائمة داخلية" : "Fit inside"}
                  </div>
                  <div className="text-xs opacity-70">
                    {lang === "ar"
                      ? "الحفاظ على الصورة كاملة مع شفافية"
                      : "Keep full image with transparency"}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {lang === "ar" ? "الفلاتر والتأثيرات" : "Filters & Effects"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilter("none")}
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${filter === "none" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
              >
                {lang === "ar" ? "بدون" : "None"}
              </button>
              <button
                onClick={() => setFilter("grayscale(100%)")}
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${filter === "grayscale(100%)" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
              >
                {lang === "ar" ? "أبيض وأسود" : "Grayscale"}
              </button>
              <button
                onClick={() => setFilter("sepia(100%)")}
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${filter === "sepia(100%)" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
              >
                {lang === "ar" ? "عتيق (سيبيا)" : "Sepia"}
              </button>
              <button
                onClick={() => setFilter("contrast(150%)")}
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${filter === "contrast(150%)" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
              >
                {lang === "ar" ? "تباين عالي" : "High Contrast"}
              </button>
              <button
                onClick={() => setFilter("invert(100%)")}
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${filter === "invert(100%)" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
              >
                {lang === "ar" ? "عكس الألوان" : "Invert"}
              </button>
              <button
                onClick={() => setFilter("blur(5px)")}
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${filter === "blur(5px)" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
              >
                {lang === "ar" ? "ضبابي" : "Blur"}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-auto bg-neutral-100/50 dark:bg-neutral-900">
          {!imageSrc ? (
            <div className="flex flex-col items-center gap-4 opacity-50">
              <ImageIcon className="w-16 h-16" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {lang === "ar"
                  ? "الرجاء اختيار صورة للبدء"
                  : "Please select an image to start"}
              </p>
            </div>
          ) : (
            <div
              className="max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-xl"
              style={{
                backgroundColor: mode === "fit" ? "transparent" : "black",
              }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
