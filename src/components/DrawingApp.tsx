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
  const [tool, setTool] = useState<"draw" | "pan" | "eraser" | "shape">("draw");
  const [shapeType, setShapeType] = useState<"rect" | "circle" | "line" | "triangle" | "star" | "polygon">("rect");
  const [polygonSides, setPolygonSides] = useState(5);
  const [zoom, setZoom] = useState(1);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [canvasSnapshot, setCanvasSnapshot] = useState<ImageData | null>(null);

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
          5000 - containerRef.current.clientHeight / 2;
        containerRef.current.scrollLeft =
          5000 - containerRef.current.clientWidth / 2;
      }
    }
  }, [initialData]);

  const startAction = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    if (tool === "pan") {
      setIsPanning(true);
      setPanStart({ x: clientX, y: clientY });
      if (containerRef.current) {
        setScrollStart({
          left: containerRef.current.scrollLeft,
          top: containerRef.current.scrollTop,
        });
      }
    } else {
      setIsDrawing(true);
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      
      const ctx = canvas.getContext("2d");
      if (ctx && tool === "shape") {
        setDrawStart({ x, y });
        setCanvasSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } else {
        draw(e);
      }
    }
  };

  const stopAction = () => {
    setIsDrawing(false);
    setIsPanning(false);
    const canvas = canvasRef.current;
    if (canvas && (tool === "draw" || tool === "eraser" || tool === "shape")) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.beginPath();
    }
    setCanvasSnapshot(null);
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

    if (tool === "draw" || tool === "eraser" || tool === "shape") {
      draw(e);
    }
  };

  const drawShapePath = (ctx: CanvasRenderingContext2D, x: number, y: number, startX: number, startY: number) => {
    const width = x - startX;
    const height = y - startY;
    const radius = Math.sqrt(width * width + height * height);

    ctx.beginPath();
    if (shapeType === "rect") {
      ctx.rect(startX, startY, width, height);
    } else if (shapeType === "circle") {
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    } else if (shapeType === "line") {
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
    } else if (shapeType === "triangle") {
      ctx.moveTo(startX + width / 2, startY);
      ctx.lineTo(startX, y);
      ctx.lineTo(x, y);
      ctx.closePath();
    } else if (shapeType === "polygon") {
      const sides = Math.max(3, polygonSides);
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const px = startX + radius * Math.cos(angle);
        const py = startY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (shapeType === "star") {
      const points = Math.max(3, polygonSides);
      const innerRadius = radius / 2;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? radius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = startX + r * Math.cos(angle);
        const py = startY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
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

    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (tool === "shape") {
      if (canvasSnapshot) {
        ctx.globalCompositeOperation = "source-over";
        ctx.putImageData(canvasSnapshot, 0, 0);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        drawShapePath(ctx, x, y, drawStart.x, drawStart.y);
        ctx.stroke();
      }
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
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
      <header className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white hidden sm:block">
            {lang === "ar" ? "برنامج الرسم" : "Drawing"}
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center justify-center flex-1">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <button
              onClick={() => setTool("draw")}
              className={`p-2 transition-colors ${tool === "draw" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
              title={lang === "ar" ? "رسم" : "Draw"}
            >
              <PenLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-2 transition-colors ${tool === "eraser" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
              title={lang === "ar" ? "ممحاة" : "Eraser"}
            >
              <Eraser className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool("shape")}
              className={`p-2 transition-colors ${tool === "shape" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
              title={lang === "ar" ? "أشكال" : "Shapes"}
            >
              <div className="w-4 h-4 border-2 border-current rounded-sm" />
            </button>
            <button
              onClick={() => setTool("pan")}
              className={`p-2 transition-colors ${tool === "pan" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
              title={lang === "ar" ? "تحريك" : "Pan"}
            >
              <MousePointer2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 items-center px-1 shadow-sm">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold text-lg leading-none">-</button>
            <span className="text-xs font-mono w-10 text-center text-neutral-700 dark:text-neutral-300">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold text-lg leading-none">+</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSaveNote && (
            <button
              onClick={saveToNote}
              className="flex items-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              title={lang === "ar" ? "حفظ كملاحظة" : "Save as Note"}
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={downloadCanvas}
            className="p-2 text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title={lang === "ar" ? "تحميل" : "Download"}
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 text-red-500 bg-red-100 dark:bg-red-900/30 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50"
            title={lang === "ar" ? "مسح" : "Clear"}
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </header>

      {tool === "shape" && (
        <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex justify-center gap-2 items-center flex-wrap">
          <select 
            value={shapeType} 
            onChange={e => setShapeType(e.target.value as any)}
            className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm text-neutral-800 dark:text-neutral-200"
          >
            <option value="rect">{lang === "ar" ? "مستطيل" : "Rectangle"}</option>
            <option value="circle">{lang === "ar" ? "دائرة" : "Circle"}</option>
            <option value="line">{lang === "ar" ? "خط مستقيم" : "Line"}</option>
            <option value="triangle">{lang === "ar" ? "مثلث" : "Triangle"}</option>
            <option value="polygon">{lang === "ar" ? "مضلع" : "Polygon"}</option>
            <option value="star">{lang === "ar" ? "نجمة" : "Star"}</option>
          </select>
          
          {(shapeType === "polygon" || shapeType === "star") && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{lang === "ar" ? "عدد الأضلاع/النقاط:" : "Sides/Points:"}</span>
              <input 
                type="number" 
                min="3" max="20" 
                value={polygonSides} 
                onChange={e => setPolygonSides(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm text-neutral-800 dark:text-neutral-200"
              />
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-neutral-200 dark:bg-neutral-950 relative"
      >
        <div className="min-w-max min-h-max p-10" style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
          <canvas
            ref={canvasRef}
            width={10000}
            height={10000}
            className={`bg-white shadow-xl ${tool === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"} touch-none`}
            style={{ width: "10000px", height: "10000px" }}
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
        <div className="flex justify-center gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600 dark:text-neutral-400">{lang === "ar" ? "اللون:" : "Color:"}</label>
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
            />
          </div>
          
          <div className="flex justify-center gap-1 flex-wrap border-l border-neutral-200 dark:border-neutral-700 pl-4">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-neutral-900 dark:border-white scale-110" : "border-neutral-300 dark:border-neutral-600"} transition-all`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
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
