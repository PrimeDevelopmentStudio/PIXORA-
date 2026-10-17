import React, { useState } from 'react';
import { CanvasElement, TextElement, ShapeElement, ImageElement } from '../../types/editor';
import { FONT_FAMILIES, PALETTE_COLORS } from '../../constants/presets';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Type, 
  Palette, 
  CornerDownRight 
} from 'lucide-react';

interface ElementPropertiesBarProps {
  element: CanvasElement;
  onUpdate: (updated: CanvasElement) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

export const ElementPropertiesBar: React.FC<ElementPropertiesBarProps> = ({
  element,
  onUpdate,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<'fill' | 'stroke'>('fill');

  const isText = element.type === 'text';
  const isShape = ['rect', 'circle', 'triangle', 'star', 'line', 'arrow'].includes(element.type);
  const isImage = element.type === 'image';

  const textEl = isText ? (element as TextElement) : null;
  const shapeEl = isShape ? (element as ShapeElement) : null;
  const imageEl = isImage ? (element as ImageElement) : null;

  const handleColorChange = (newColor: string) => {
    if (colorPickerTarget === 'fill') {
      onUpdate({ ...element, fill: newColor } as CanvasElement);
    } else {
      onUpdate({ ...element, stroke: newColor } as CanvasElement);
    }
  };

  return (
    <div className="relative bg-[#131b2e] border-b border-slate-700/80 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none z-20 text-xs">
      {/* Type badge */}
      <span className="px-2 py-1 rounded bg-slate-800 text-violet-300 font-semibold uppercase text-[10px] tracking-wider flex-shrink-0">
        {element.type}
      </span>

      <div className="h-4 w-px bg-slate-700 mx-1 flex-shrink-0" />

      {/* TEXT CONTROLS */}
      {isText && textEl && (
        <>
          {/* Direct Text edit input */}
          <div className="flex items-center gap-1.5 flex-shrink-0 min-w-[120px] max-w-[200px]">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={textEl.text}
              onChange={(e) => onUpdate({ ...textEl, text: e.target.value })}
              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs w-full focus:outline-none focus:border-violet-500"
              placeholder="Edit text content..."
            />
          </div>

          {/* Font Family */}
          <select
            value={textEl.fontFamily || 'Inter'}
            onChange={(e) => onUpdate({ ...textEl, fontFamily: e.target.value })}
            className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none focus:border-violet-500 flex-shrink-0"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 flex-shrink-0">
            <button
              onClick={() => onUpdate({ ...textEl, fontSize: Math.max(10, (textEl.fontSize || 32) - 4) })}
              className="text-slate-400 hover:text-white px-1 font-bold text-xs"
            >
              -
            </button>
            <input
              type="number"
              value={textEl.fontSize || 32}
              onChange={(e) => onUpdate({ ...textEl, fontSize: Math.max(8, Number(e.target.value)) })}
              className="w-10 bg-transparent text-center text-white text-xs focus:outline-none"
            />
            <button
              onClick={() => onUpdate({ ...textEl, fontSize: Math.min(300, (textEl.fontSize || 32) + 4) })}
              className="text-slate-400 hover:text-white px-1 font-bold text-xs"
            >
              +
            </button>
          </div>

          {/* Text Color Trigger */}
          <button
            onClick={() => {
              setColorPickerTarget('fill');
              setShowColorPicker(!showColorPicker);
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 hover:border-slate-500 flex-shrink-0"
          >
            <span
              className="w-3.5 h-3.5 rounded border border-white/20"
              style={{ backgroundColor: textEl.fill || '#ffffff' }}
            />
            <span>Color</span>
          </button>

          {/* Bold, Italic */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded overflow-hidden flex-shrink-0">
            <button
              onClick={() =>
                onUpdate({
                  ...textEl,
                  fontWeight: textEl.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              className={`p-1.5 hover:bg-slate-800 ${
                textEl.fontWeight === 'bold' ? 'bg-violet-600 text-white' : 'text-slate-400'
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdate({
                  ...textEl,
                  fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`p-1.5 hover:bg-slate-800 ${
                textEl.fontStyle === 'italic' ? 'bg-violet-600 text-white' : 'text-slate-400'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded overflow-hidden flex-shrink-0">
            <button
              onClick={() => onUpdate({ ...textEl, align: 'left' })}
              className={`p-1.5 hover:bg-slate-800 ${
                textEl.align === 'left' ? 'bg-violet-600 text-white' : 'text-slate-400'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdate({ ...textEl, align: 'center' })}
              className={`p-1.5 hover:bg-slate-800 ${
                textEl.align === 'center' ? 'bg-violet-600 text-white' : 'text-slate-400'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdate({ ...textEl, align: 'right' })}
              className={`p-1.5 hover:bg-slate-800 ${
                textEl.align === 'right' ? 'bg-violet-600 text-white' : 'text-slate-400'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* SHAPE CONTROLS */}
      {isShape && shapeEl && (
        <>
          {/* Fill Color */}
          <button
            onClick={() => {
              setColorPickerTarget('fill');
              setShowColorPicker(!showColorPicker);
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 hover:border-slate-500 flex-shrink-0"
          >
            <span
              className="w-3.5 h-3.5 rounded border border-white/20"
              style={{ backgroundColor: shapeEl.fill || '#8b5cf6' }}
            />
            <span>Fill</span>
          </button>

          {/* Stroke Color */}
          <button
            onClick={() => {
              setColorPickerTarget('stroke');
              setShowColorPicker(!showColorPicker);
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 hover:border-slate-500 flex-shrink-0"
          >
            <span
              className="w-3.5 h-3.5 rounded border border-white/20"
              style={{ backgroundColor: shapeEl.stroke || '#ffffff' }}
            />
            <span>Border</span>
          </button>

          {/* Stroke Width */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-shrink-0">
            <span className="text-[10px] text-slate-400">Border W:</span>
            <input
              type="number"
              min={0}
              max={30}
              value={shapeEl.strokeWidth || 0}
              onChange={(e) => onUpdate({ ...shapeEl, strokeWidth: Math.max(0, Number(e.target.value)) })}
              className="w-8 bg-transparent text-center text-white text-xs focus:outline-none"
            />
          </div>

          {/* Corner Radius for rect */}
          {shapeEl.type === 'rect' && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-shrink-0">
              <CornerDownRight className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400">Radius:</span>
              <input
                type="number"
                min={0}
                max={200}
                value={shapeEl.cornerRadius || 0}
                onChange={(e) => onUpdate({ ...shapeEl, cornerRadius: Math.max(0, Number(e.target.value)) })}
                className="w-10 bg-transparent text-center text-white text-xs focus:outline-none"
              />
            </div>
          )}
        </>
      )}

      {/* IMAGE CONTROLS */}
      {isImage && imageEl && (
        <>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-shrink-0">
            <CornerDownRight className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">Corner Radius:</span>
            <input
              type="number"
              min={0}
              max={200}
              value={imageEl.cornerRadius || 0}
              onChange={(e) => onUpdate({ ...imageEl, cornerRadius: Math.max(0, Number(e.target.value)) })}
              className="w-10 bg-transparent text-center text-white text-xs focus:outline-none"
            />
          </div>
        </>
      )}

      {/* Opacity slider for all */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-shrink-0">
        <span className="text-[10px] text-slate-400">Opacity:</span>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={element.opacity ?? 1}
          onChange={(e) => onUpdate({ ...element, opacity: parseFloat(e.target.value) })}
          className="w-16 accent-violet-500 cursor-pointer"
        />
        <span className="text-[10px] text-slate-300 w-7 font-mono">
          {Math.round((element.opacity ?? 1) * 100)}%
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700 mx-1 flex-shrink-0" />

      {/* COMMON ACTIONS: Order, Duplicate, Lock, Delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onBringForward(element.id)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          title="Bring Forward"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSendBackward(element.id)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          title="Send Backward"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDuplicate(element.id)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          title="Duplicate Element"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onUpdate({ ...element, isLocked: !element.isLocked })}
          className={`p-1.5 rounded ${
            element.isLocked ? 'bg-amber-600/30 text-amber-300' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title={element.isLocked ? 'Unlock Element' : 'Lock Element'}
        >
          {element.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => onDelete(element.id)}
          className="p-1.5 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded"
          title="Delete Element"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown Color Palette Popup */}
      {showColorPicker && (
        <div className="absolute top-full left-10 mt-2 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 w-64 animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">
              Choose {colorPickerTarget === 'fill' ? 'Fill' : 'Border'} Color
            </span>
            <button
              onClick={() => setShowColorPicker(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Color swatches */}
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PALETTE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-7 h-7 rounded border border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="color"
              value={((element as any)[colorPickerTarget] as string) || '#ffffff'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-xs font-mono text-slate-300">Custom Picker</span>
          </div>
        </div>
      )}
    </div>
  );
};
