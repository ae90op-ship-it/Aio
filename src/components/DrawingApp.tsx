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
  Undo2,
  Redo2,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  PaintBucket,
  Pipette,
  Grid,
  Settings2,
  Circle,
  Square,
  Triangle,
  Maximize2,
  Minimize2,
  Focus,
  Palette
} from "lucide-react";

interface Props {
  lang: Language;
  onBack: () => void;
  initialData?: any;
  onSaveNote?: (title: string, data: any) => void;
}

type Point = { x: number; y: number };
type BrushType = "pencil" | "charcoal" | "watercolor" | "oil";
type DrawingElement =
  | { type: "path"; points: Point[]; color: string; width: number; opacity: number; brushType: BrushType; blendMode: string; isEraser: boolean }
  | { type: "shape"; shapeType: string; start: Point; end: Point; color: string; width: number; opacity: number; isFilled: boolean; sides: number };

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  elements: DrawingElement[];
}

export function DrawingApp({ lang, onBack, initialData, onSaveNote }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [zenHovered, setZenHovered] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  // Canvas Global State
  const [canvasBg, setCanvasBg] = useState("#FFFFFF");

  // Layers & History
  const [layers, setLayers] = useState<Layer[]>([
    { id: "layer-1", name: "Layer 1", visible: true, opacity: 1, blendMode: "source-over", elements: [] }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>("layer-1");
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Current Input
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);

  // Tools & Settings
  const [tool, setTool] = useState<"draw" | "pan" | "eraser" | "shape" | "fill" | "picker">("draw");
  const [brushType, setBrushType] = useState<BrushType>("pencil");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [shapeType, setShapeType] = useState<"rect" | "circle" | "triangle">("rect");
  const [isShapeFilled, setIsShapeFilled] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Viewport state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

  // Auto-save history
  const saveHistory = useCallback((newLayers: Layer[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(JSON.parse(JSON.stringify(newLayers)));
    if (newHistory.length > 50) newHistory.shift(); // Max 50 steps
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  // Init history
  useEffect(() => {
    if (history.length === 0) {
      saveHistory(layers);
    }
  }, []);

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setLayers(JSON.parse(JSON.stringify(history[historyStep - 1])));
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setLayers(JSON.parse(JSON.stringify(history[historyStep + 1])));
    }
  };

  // Layer Management
  const addLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      blendMode: "source-over",
      elements: []
    };
    const newLayers = [newLayer, ...layers];
    setLayers(newLayers);
    setActiveLayerId(newLayer.id);
    saveHistory(newLayers);
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    if (activeLayerId === id) setActiveLayerId(newLayers[0].id);
    saveHistory(newLayers);
  };

  const toggleLayerVisibility = (id: string) => {
    const newLayers = layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l);
    setLayers(newLayers);
    saveHistory(newLayers);
  };

  const updateLayerOpacity = (id: string, opacity: number) => {
    const newLayers = layers.map(l => l.id === id ? { ...l, opacity } : l);
    setLayers(newLayers);
  };

  const commitLayerOpacity = () => {
    saveHistory(layers);
  };

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      renderCanvas();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [layers, currentElement, pan, zoom, showGrid, canvasBg]);

  const drawShapePath = (ctx: CanvasRenderingContext2D, type: string, start: Point, end: Point) => {
    const width = end.x - start.x;
    const height = end.y - start.y;
    const radius = Math.sqrt(width * width + height * height);

    ctx.beginPath();
    if (type === "rect") {
      ctx.rect(start.x, start.y, width, height);
    } else if (type === "circle") {
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
    } else if (type === "triangle") {
      ctx.moveTo(start.x + width / 2, start.y);
      ctx.lineTo(start.x, end.y);
      ctx.lineTo(end.x, end.y);
      ctx.closePath();
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== container.clientWidth) canvas.width = container.clientWidth;
    if (canvas.height !== container.clientHeight) canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw Grid
    if (showGrid) {
      ctx.save();
      // Adjust grid color based on background lightness
      const isDarkBg = parseInt(canvasBg.slice(1, 3), 16) + parseInt(canvasBg.slice(3, 5), 16) + parseInt(canvasBg.slice(5, 7), 16) < 382;
      ctx.strokeStyle = isDarkBg ? "rgba(255, 255, 255, 0.1)" : "rgba(150, 150, 150, 0.2)";
      ctx.lineWidth = 1 / zoom;
      const step = 50;
      const startX = -pan.x / zoom;
      const startY = -pan.y / zoom;
      const endX = startX + canvas.width / zoom;
      const endY = startY + canvas.height / zoom;
      
      ctx.beginPath();
      for (let x = Math.floor(startX / step) * step; x < endX; x += step) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / step) * step; y < endY; y += step) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw Layers bottom to top
    const reversedLayers = [...layers].reverse();

    for (const layer of reversedLayers) {
      if (!layer.visible) continue;
      
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;

      const layerElements = layer.id === activeLayerId && currentElement ? [...layer.elements, currentElement] : layer.elements;

      for (const el of layerElements) {
        ctx.save();
        ctx.globalAlpha = el.opacity * layer.opacity;
        ctx.lineWidth = el.width;
        
        if (el.type === "path") {
          ctx.globalCompositeOperation = el.isEraser ? "destination-out" : (el.blendMode as GlobalCompositeOperation || "source-over");
          ctx.strokeStyle = el.isEraser ? "rgba(0,0,0,1)" : el.color;
          
          if (el.brushType === "watercolor") {
             ctx.filter = "blur(2px)";
          } else if (el.brushType === "charcoal") {
             ctx.filter = "noise(10%)"; // Simulated via slight variations if possible, skipping complex filters for standard canvas
          }
          
          if (el.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            for (let i = 1; i < el.points.length; i++) {
              ctx.lineTo(el.points[i].x, el.points[i].y);
            }
            ctx.stroke();
          }
        } else if (el.type === "shape") {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = el.color;
          ctx.fillStyle = el.color;
          drawShapePath(ctx, el.shapeType, el.start, el.end);
          if (el.isFilled) ctx.fill();
          else ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore();
  }, [layers, currentElement, pan, zoom, activeLayerId, showGrid, canvasBg]);

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
          opacity: brushOpacity,
          brushType,
          blendMode: "source-over",
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
          opacity: brushOpacity,
          isFilled: isShapeFilled,
          sides: 4
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
      const newLayers = layers.map(l => {
        if (l.id === activeLayerId) {
          return { ...l, elements: [...l.elements, currentElement] };
        }
        return l;
      });
      setLayers(newLayers);
      setCurrentElement(null);
      saveHistory(newLayers);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = canvasBg;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        
        const dataUrl = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "drawing_export.png";
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
        ctx.fillStyle = canvasBg;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvasRef.current, 0, 0);
        const dataUrl = tempCanvas.toDataURL("image/png");
        onSaveNote(lang === "ar" ? "لوحة فنية" : "Artwork", dataUrl);
      }
    }
  };

  const handleSafeBack = () => {
    saveToNote();
    onBack();
  };

  const ToolbarBtn = ({ icon: Icon, active, onClick, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-3 rounded-xl flex items-center justify-center transition-all ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" 
          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
      }`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );

  const showUI = !isZenMode || zenHovered;

  return (
    <div 
      className={`flex bg-neutral-100 dark:bg-neutral-950 w-full font-sans overflow-hidden text-neutral-900 dark:text-neutral-100 ${isFullScreen ? 'fixed inset-0 z-50' : 'h-full'}`}
    >
      
      {/* Edge Hover Detector for Zen Mode */}
      {isZenMode && !zenHovered && (
        <div 
          className="absolute inset-y-0 left-0 w-8 z-40"
          onMouseEnter={() => setZenHovered(true)}
        />
      )}

      {/* Left Toolbar */}
      <div 
        className={`w-20 border-r border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col items-center py-6 gap-4 z-20 shadow-xl transition-all duration-300 ${showUI ? 'translate-x-0' : '-translate-x-full absolute h-full'}`}
        onMouseLeave={() => isZenMode && setZenHovered(false)}
      >
        <button onClick={handleSafeBack} className="p-3 mb-2 rounded-xl text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800" title="Save & Exit">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col gap-2 w-full px-3">
          <ToolbarBtn icon={PenLine} active={tool === "draw"} onClick={() => setTool("draw")} title="Brush" />
          <ToolbarBtn icon={Eraser} active={tool === "eraser"} onClick={() => setTool("eraser")} title="Eraser" />
          <ToolbarBtn icon={Square} active={tool === "shape"} onClick={() => setTool("shape")} title="Shapes" />
          <ToolbarBtn icon={PaintBucket} active={tool === "fill"} onClick={() => setTool("fill")} title="Fill" />
          <ToolbarBtn icon={Pipette} active={tool === "picker"} onClick={() => setTool("picker")} title="Color Picker" />
          <ToolbarBtn icon={MousePointer2} active={tool === "pan"} onClick={() => setTool("pan")} title="Pan Canvas" />
        </div>

        <div className="mt-auto flex flex-col gap-2 w-full px-3">
          <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-3 rounded-xl flex justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800" title={lang === 'ar' ? 'ملء الشاشة' : 'Full Screen'}>
            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button onClick={() => { setIsZenMode(!isZenMode); setZenHovered(false); }} className={`p-3 rounded-xl flex justify-center ${isZenMode ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'}`} title={lang === 'ar' ? 'إخفاء كل الأزرار' : 'Zen Mode'}>
            <Focus className="w-5 h-5" />
          </button>
          <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full my-1" />
          <button onClick={undo} disabled={historyStep <= 0} className="p-3 rounded-xl flex justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-3 rounded-xl flex justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30">
            <Redo2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Properties Bar */}
        <div 
          className={`absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-3 flex items-center gap-6 shadow-xl z-20 transition-all duration-300 ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
          onMouseEnter={() => isZenMode && setZenHovered(true)}
        >
          
          <div className="flex items-center gap-3">
            <div className="relative group flex items-center">
              <input 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)}
                className="w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer overflow-hidden p-0"
                title="Brush Color"
              />
            </div>
            <div className="relative group flex items-center">
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <Palette className="w-3 h-3 text-black/50 mix-blend-difference" />
              </div>
              <input 
                type="color" 
                value={canvasBg} 
                onChange={e => setCanvasBg(e.target.value)}
                className="w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer overflow-hidden p-0"
                title="Canvas Background"
              />
            </div>
            
            <div className="h-6 w-[1px] bg-neutral-300 dark:bg-neutral-700" />
            
            <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                <span>Size</span>
                <span>{lineWidth}px</span>
              </div>
              <input
                type="range"
                min="1" max="100"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none accent-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                <span>Opacity</span>
                <span>{Math.round(brushOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.01" max="1" step="0.01"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none accent-blue-600"
              />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-neutral-300 dark:bg-neutral-700" />

          {tool === "draw" && (
            <select 
              value={brushType} 
              onChange={e => setBrushType(e.target.value as BrushType)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="pencil">Pencil</option>
              <option value="charcoal">Charcoal</option>
              <option value="watercolor">Watercolor</option>
              <option value="oil">Oil Paint</option>
            </select>
          )}

          {tool === "shape" && (
            <div className="flex items-center gap-4">
              <select 
                value={shapeType} 
                onChange={e => setShapeType(e.target.value as any)}
                className="bg-transparent text-sm font-medium focus:outline-none"
              >
                <option value="rect">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isShapeFilled} onChange={e => setIsShapeFilled(e.target.checked)} className="rounded text-blue-600" />
                Filled
              </label>
            </div>
          )}

          <div className="flex items-center gap-2 ml-4">
            <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg transition-colors ${showGrid ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`} title="Toggle Grid">
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setShowLayers(!showLayers)} className={`flex items-center gap-2 p-2 px-3 rounded-lg transition-colors ${showLayers ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`} title="Toggle Layers">
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:inline">{lang === 'ar' ? 'الطبقات' : 'Layers'}</span>
            </button>
            <button onClick={downloadCanvas} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400" title="Export PNG">
              <Download className="w-4 h-4" />
            </button>
            {onSaveNote && (
              <button onClick={saveToNote} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-blue-600 dark:text-blue-400" title="Save to Notes">
                <Save className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative cursor-crosshair bg-neutral-200/50 dark:bg-neutral-900/50"
        >
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 block touch-none ${tool === "pan" ? (isInteracting ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair"}`}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseOut={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>
      </div>

      {/* Right Layers Panel */}
      {showLayers && (
        <div 
          className="w-64 border-l border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl flex flex-col z-20 shadow-xl transition-all duration-300"
          onMouseLeave={() => isZenMode && setZenHovered(false)}
        >
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              {lang === 'ar' ? 'الطبقات' : 'Layers'}
            </h3>
            <button onClick={addLayer} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {layers.map((layer) => (
              <div 
                key={layer.id} 
                className={`p-3 rounded-xl border transition-all ${activeLayerId === layer.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-sm" : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"}`}
                onClick={() => setActiveLayerId(layer.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold truncate flex-1">{layer.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }} className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                      {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="p-1 text-neutral-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <span className="text-[10px] uppercase text-neutral-500 w-12">Opacity</span>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={layer.opacity}
                    onChange={(e) => updateLayerOpacity(layer.id, Number(e.target.value))}
                    onMouseUp={commitLayerOpacity}
                    onTouchEnd={commitLayerOpacity}
                    className="flex-1 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none accent-neutral-600 dark:accent-neutral-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

