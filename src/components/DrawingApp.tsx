import React, { useRef, useState, useEffect, useCallback } from "react";
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

type Point = { x: number; y: number };
type DrawingElement =
  | { type: "path"; points: Point[]; color: string; width: number; isEraser: boolean }
  | { type: "shape"; shapeType: string; start: Point; end: Point; color: string; width: number; sides: number };

export function DrawingApp({ lang, onBack, initialData, onSaveNote }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<"draw" | "pan" | "eraser" | "shape">("draw");
  const [shapeType, setShapeType] = useState<"rect" | "circle" | "line" | "triangle" | "star" | "polygon">("rect");
  const [polygonSides, setPolygonSides] = useState(5);
  
  // Viewport state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  // Interaction state
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

  // Resize observer to keep canvas matching container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      renderCanvas();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [elements, currentElement, pan, zoom]);

  const drawShapePath = (ctx: CanvasRenderingContext2D, type: string, start: Point, end: Point, sides: number) => {
    const width = end.x - start.x;
    const height = end.y - start.y;
    const radius = Math.sqrt(width * width + height * height);

    ctx.beginPath();
    if (type === "rect") {
      ctx.rect(start.x, start.y, width, height);
    } else if (type === "circle") {
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
    } else if (type === "line") {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    } else if (type === "triangle") {
      ctx.moveTo(start.x + width / 2, start.y);
      ctx.lineTo(start.x, end.y);
      ctx.lineTo(end.x, end.y);
      ctx.closePath();
    } else if (type === "polygon") {
      const s = Math.max(3, sides);
      for (let i = 0; i < s; i++) {
        const angle = (i * 2 * Math.PI) / s - Math.PI / 2;
        const px = start.x + radius * Math.cos(angle);
        const py = start.y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (type === "star") {
      const points = Math.max(3, sides);
      const innerRadius = radius / 2;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? radius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = start.x + r * Math.cos(angle);
        const py = start.y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match physical size
    if (canvas.width !== container.clientWidth) canvas.width = container.clientWidth;
    if (canvas.height !== container.clientHeight) canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const allElements = currentElement ? [...elements, currentElement] : elements;

    for (const el of allElements) {
      ctx.beginPath();
      ctx.lineWidth = el.width;
      if (el.type === "path") {
        ctx.globalCompositeOperation = el.isEraser ? "destination-out" : "source-over";
        ctx.strokeStyle = el.isEraser ? "rgba(0,0,0,1)" : el.color;
        if (el.points.length > 0) {
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
      } else if (el.type === "shape") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = el.color;
        drawShapePath(ctx, el.shapeType, el.start, el.end, el.sides);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [elements, currentElement, pan, zoom]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent | globalThis.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  const getRawPointerPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX, y: clientY };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsInteracting(true);
    if (tool === "pan") {
      setLastPanPoint(getRawPointerPos(e));
    } else {
      const pos = getPointerPos(e);
      if (!pos) return;
      if (tool === "draw" || tool === "eraser") {
        setCurrentElement({
          type: "path",
          points: [pos],
          color,
          width: lineWidth,
          isEraser: tool === "eraser"
        });
      } else if (tool === "shape") {
        setCurrentElement({
          type: "shape",
          shapeType,
          start: pos,
          end: pos,
          color,
          width: lineWidth,
          sides: polygonSides
        });
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isInteracting) return;
    
    if (tool === "pan" && lastPanPoint) {
      const rawPos = getRawPointerPos(e);
      const dx = rawPos.x - lastPanPoint.x;
      const dy = rawPos.y - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint(rawPos);
    } else if (currentElement) {
      const pos = getPointerPos(e);
      if (!pos) return;
      
      if (currentElement.type === "path") {
        setCurrentElement({
          ...currentElement,
          points: [...currentElement.points, pos]
        });
      } else if (currentElement.type === "shape") {
        setCurrentElement({
          ...currentElement,
          end: pos
        });
      }
    }
  };

  const handlePointerUp = () => {
    setIsInteracting(false);
    setLastPanPoint(null);
    if (currentElement) {
      setElements(prev => [...prev, currentElement]);
      setCurrentElement(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.min(Math.max(0.1, z * zoomFactor), 10));
    } else {
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Prevent default wheel behavior for zooming
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      if (e.ctrlKey || e.metaKey) {
        setZoom(z => Math.min(Math.max(0.1, z * zoomFactor), 10));
      } else {
        setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    canvas.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleNativeWheel);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && tool !== "pan") {
        setTool("pan");
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && tool === "pan") {
        setTool("draw");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [tool]);

  const clearCanvas = () => {
    setElements([]);
    setCurrentElement(null);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Create a temporary canvas with white background
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        
        const dataUrl = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "drawing.png";
        link.href = dataUrl;
        link.click();
      }
    }
  };

  const saveToNote = () => {
    if (onSaveNote && canvasRef.current) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvasRef.current, 0, 0);
        const dataUrl = tempCanvas.toDataURL("image/png");
        onSaveNote(lang === "ar" ? "رسمة" : "Drawing", dataUrl);
      }
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
            <span className="text-xs font-mono w-12 text-center text-neutral-700 dark:text-neutral-300">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(10, z + 0.1))} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold text-lg leading-none">+</button>
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
            className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500"
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
                className="w-16 px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-neutral-200 dark:bg-neutral-950 relative"
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 block bg-white dark:bg-neutral-900 touch-none ${tool === "pan" ? (isInteracting ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair"}`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseOut={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col gap-4 z-10">
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

