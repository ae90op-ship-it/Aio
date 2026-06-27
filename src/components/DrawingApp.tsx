import React, { useRef, useState, useEffect } from "react";
import { Language } from "../types";
import { translations } from "../i18n";
import {
  ArrowLeft,
  Eraser,
  Download,
  Save,
  MousePointer2,
  PenLine,
} from "lucide-react";

interface Props {
  lang: Language;
  onBack: () => void;
  initialData?: any;
  onSaveNote?: (title: string, data: any) => void;
}

const COLORS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

export function DrawingApp({ lang, onBack, initialData, onSaveNote }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<"draw" | "pan">("draw");

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (initialData) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = initialData;
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      // Center the view initially
      if (containerRef.current) {
        containerRef.current.scrollTop =
          1500 - containerRef.current.clientHeight / 2;
        containerRef.current.scrollLeft =
          1500 - containerRef.current.clientWidth / 2;
      }
    }
  }, [initialData]);

  const startAction = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === "pan") {
      setIsPanning(true);
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setPanStart({ x: clientX, y: clientY });
      if (containerRef.current) {
        setScrollStart({
          left: containerRef.current.scrollLeft,
          top: containerRef.current.scrollTop,
        });
      }
    } else {
      setIsDrawing(true);
      draw(e);
    }
  };

  const stopAction = () => {
    setIsDrawing(false);
    setIsPanning(false);
    const canvas = canvasRef.current;
    if (canvas && tool === "draw") {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.beginPath();
    }
  };

  const handleAction = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === "pan" && isPanning && containerRef.current) {
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const dx = clientX - panStart.x;
      const dy = clientY - panStart.y;

      containerRef.current.scrollLeft = scrollStart.left - dx;
      containerRef.current.scrollTop = scrollStart.top - dy;
      return;
    }

    if (tool === "draw") {
      draw(e);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x =
      ("touches" in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left) * scaleX;
    const y =
      ("touches" in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top) * scaleY;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = dataUrl;
      link.click();
    }
  };

  const saveToNote = () => {
    if (onSaveNote && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSaveNote(lang === "ar" ? "رسمة" : "Drawing", dataUrl);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 w-full relative">
      <header className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={onBack}
          className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {onSaveNote && (
          <button
            onClick={saveToNote}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">
              {lang === "ar" ? "حفظ كملاحظة" : "Save as Note"}
            </span>
          </button>
        )}
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          {lang === "ar" ? "برنامج الرسم" : "Drawing"}
        </h2>
        <div className="flex gap-2">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 mr-2">
            <button
              onClick={() => setTool("draw")}
              className={`p-2 transition-colors ${tool === "draw" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
              title={lang === "ar" ? "رسم" : "Draw"}
            >
              <PenLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool("pan")}
              className={`p-2 transition-colors ${tool === "pan" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
              title={lang === "ar" ? "تحريك" : "Pan"}
            >
              <MousePointer2 className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={downloadCanvas}
            className="p-2 text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-full"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 text-red-500 bg-red-100 dark:bg-red-900/30 rounded-full"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-neutral-200 dark:bg-neutral-950 relative"
      >
        <div className="min-w-max min-h-max p-10">
          <canvas
            ref={canvasRef}
            width={3000}
            height={3000}
            className={`bg-white shadow-xl ${tool === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"} touch-none`}
            style={{ width: "3000px", height: "3000px" }}
            onMouseDown={startAction}
            onMouseUp={stopAction}
            onMouseOut={stopAction}
            onMouseMove={handleAction}
            onTouchStart={startAction}
            onTouchEnd={stopAction}
            onTouchMove={handleAction}
          />
        </div>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col gap-4">
        <div className="flex justify-center gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-neutral-900 dark:border-white scale-110" : "border-neutral-300 dark:border-neutral-600"} transition-all`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 max-w-md mx-auto w-full">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {lang === "ar" ? "الحجم:" : "Size:"}
          </span>
          <input
            type="range"
            min="1"
            max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400 w-6">
            {lineWidth}
          </span>
        </div>
      </div>
    </div>
  );
}
