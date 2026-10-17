import React, { useRef, useState } from 'react';
import { CanvasElement, ActiveSidebarTab, Template, Project } from '../../types/editor';
import { TEMPLATES } from '../../constants/templates';
import { SAMPLE_STICKERS, SAMPLE_PHOTOS } from '../../constants/assets';
import { PALETTE_COLORS } from '../../constants/presets';
import { 
  LayoutTemplate, 
  Type, 
  Shapes, 
  Upload, 
  Palette, 
  Layers, 
  Plus, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Sparkles,
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  MoveRight
} from 'lucide-react';

interface EditorSidebarProps {
  activeTab: ActiveSidebarTab | null;
  onSelectTab: (tab: ActiveSidebarTab | null) => void;
  project: Project;
  onAddElement: (element: Partial<CanvasElement>) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onSelectTemplate: (template: Template) => void;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onReorderElements: (newElements: CanvasElement[]) => void;
  onDeleteElement: (id: string) => void;
  isMobile?: boolean;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeTab,
  onSelectTab,
  project,
  onAddElement,
  onUpdateProject,
  onSelectTemplate,
  selectedId,
  onSelectElement,
  onReorderElements,
  onDeleteElement,
  isMobile = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateSearch, setTemplateSearch] = useState('');

  // Handle local image upload from user phone/computer gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        // Fit within canvas safely
        const maxW = Math.min(img.width, project.width * 0.7);
        const aspect = img.width / img.height;
        const w = Math.round(maxW);
        const h = Math.round(w / aspect);

        onAddElement({
          type: 'image',
          src: dataUrl,
          width: w,
          height: h,
          x: Math.round((project.width - w) / 2),
          y: Math.round((project.height - h) / 2),
          name: file.name.substring(0, 20),
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddStockAsset = (asset: { src: string; width: number; height: number; title: string }) => {
    const maxW = Math.min(asset.width, project.width * 0.5);
    const scale = maxW / asset.width;
    const w = Math.round(asset.width * scale);
    const h = Math.round(asset.height * scale);

    onAddElement({
      type: 'image',
      src: asset.src,
      width: w,
      height: h,
      x: Math.round((project.width - w) / 2),
      y: Math.round((project.height - h) / 2),
      name: asset.title,
    });
  };

  const moveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= project.elements.length) return;

    const copy = [...project.elements];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onReorderElements(copy);
  };

  const tabs = [
    { id: 'templates' as ActiveSidebarTab, label: 'Templates', icon: LayoutTemplate },
    { id: 'elements' as ActiveSidebarTab, label: 'Shapes', icon: Shapes },
    { id: 'text' as ActiveSidebarTab, label: 'Text', icon: Type },
    { id: 'uploads' as ActiveSidebarTab, label: 'Uploads', icon: Upload },
    { id: 'background' as ActiveSidebarTab, label: 'Color', icon: Palette },
    { id: 'layers' as ActiveSidebarTab, label: 'Layers', icon: Layers },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Tab Bar (Left vertical rail on desktop, bottom bar on mobile) */}
      <div className={`
        ${isMobile 
          ? 'fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a] border-t border-slate-800 z-40 flex items-center justify-around px-2' 
          : 'w-18 bg-[#0a0f1d] border-r border-slate-800 flex flex-col items-center py-4 gap-3 z-30 flex-shrink-0'
        }
      `}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(isActive ? null : tab.id)}
              className={`
                flex flex-col items-center justify-center rounded-xl transition-all
                ${isMobile ? 'p-1.5 flex-1 max-w-[65px]' : 'w-14 h-14'}
                ${isActive 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }
              `}
              title={tab.label}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expandable Panel Drawer */}
      {activeTab && (
        <div className={`
          bg-[#101728] border-slate-800 z-30 flex flex-col shadow-2xl overflow-hidden animate-in fade-in
          ${isMobile 
            ? 'fixed bottom-16 left-0 right-0 max-h-[60vh] border-t rounded-t-2xl' 
            : 'w-80 border-r h-full'
          }
        `}>
          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-[#0c1220]">
            <h3 className="font-bold text-sm text-white capitalize flex items-center gap-2 font-['Outfit']">
              {activeTab === 'templates' && <LayoutTemplate className="w-4 h-4 text-violet-400" />}
              {activeTab === 'elements' && <Shapes className="w-4 h-4 text-violet-400" />}
              {activeTab === 'text' && <Type className="w-4 h-4 text-violet-400" />}
              {activeTab === 'uploads' && <Upload className="w-4 h-4 text-violet-400" />}
              {activeTab === 'background' && <Palette className="w-4 h-4 text-violet-400" />}
              {activeTab === 'layers' && <Layers className="w-4 h-4 text-violet-400" />}
              {activeTab}
            </h3>
            <button
              onClick={() => onSelectTab(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {/* 1. TEMPLATES TAB */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Filter templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500"
                />

                <div className="grid grid-cols-2 gap-2.5">
                  {TEMPLATES.filter((t) =>
                    !templateSearch ||
                    t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
                    t.tags.some((tag) => tag.toLowerCase().includes(templateSearch.toLowerCase()))
                  ).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-violet-500 flex flex-col text-left transition-all group"
                    >
                      <div
                        className="w-full h-20 rounded-lg mb-2 flex items-center justify-center p-1 text-[8px] font-bold overflow-hidden shadow-inner"
                        style={{ backgroundColor: template.backgroundColor }}
                      >
                        <span className="text-white drop-shadow line-clamp-1">{template.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-violet-300 line-clamp-1">
                        {template.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {template.width}×{template.height}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. TEXT TAB */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Click a style to add editable text onto artboard:</p>

                {/* Big Heading */}
                <button
                  onClick={() =>
                    onAddElement({
                      type: 'text',
                      text: 'Add a heading',
                      fontSize: 84,
                      fontFamily: 'Outfit',
                      fontWeight: '800',
                      fill: '#ffffff',
                      x: Math.round(project.width * 0.15),
                      y: Math.round(project.height * 0.3),
                      width: Math.round(project.width * 0.7),
                      height: 100,
                    })
                  }
                  className="w-full p-4 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl text-left transition-all hover:bg-slate-800/80 group"
                >
                  <span className="text-2xl font-black text-white group-hover:text-violet-300 font-['Outfit'] block">
                    Add a heading
                  </span>
                  <span className="text-[10px] text-slate-400">Outfit · 84px bold display</span>
                </button>

                {/* Subheading */}
                <button
                  onClick={() =>
                    onAddElement({
                      type: 'text',
                      text: 'Add a subheading',
                      fontSize: 48,
                      fontFamily: 'Inter',
                      fontWeight: '600',
                      fill: '#cbd5e1',
                      x: Math.round(project.width * 0.15),
                      y: Math.round(project.height * 0.45),
                      width: Math.round(project.width * 0.7),
                      height: 60,
                    })
                  }
                  className="w-full p-3.5 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl text-left transition-all hover:bg-slate-800/80 group"
                >
                  <span className="text-lg font-bold text-slate-200 group-hover:text-violet-300 block">
                    Add a subheading
                  </span>
                  <span className="text-[10px] text-slate-400">Inter · 48px semibold</span>
                </button>

                {/* Body Text */}
                <button
                  onClick={() =>
                    onAddElement({
                      type: 'text',
                      text: 'Add body text. Craft engaging stories, descriptions, and details.',
                      fontSize: 28,
                      fontFamily: 'Inter',
                      fontWeight: 'normal',
                      fill: '#94a3b8',
                      x: Math.round(project.width * 0.15),
                      y: Math.round(project.height * 0.58),
                      width: Math.round(project.width * 0.7),
                      height: 80,
                    })
                  }
                  className="w-full p-3 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl text-left transition-all hover:bg-slate-800/80 group"
                >
                  <span className="text-sm text-slate-300 group-hover:text-violet-300 block">
                    Add a little bit of body text
                  </span>
                  <span className="text-[10px] text-slate-400">Inter · 28px regular paragraph</span>
                </button>

                {/* Curated Stylized Preset Text */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Stylized Font Combos
                  </span>

                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'text',
                          text: 'SPECIAL FLASH SALE',
                          fontSize: 64,
                          fontFamily: 'Bebas Neue',
                          fill: '#facc15',
                          letterSpacing: 4,
                          x: 100,
                          y: 200,
                          width: 600,
                          height: 80,
                        })
                      }
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500 text-left"
                    >
                      <span className="font-['Bebas_Neue'] text-xl text-amber-300 tracking-widest block">
                        SPECIAL FLASH SALE
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'text',
                          text: 'Elegance & Harmony',
                          fontSize: 52,
                          fontFamily: 'Playfair Display',
                          fontStyle: 'italic',
                          fill: '#f43f5e',
                          x: 100,
                          y: 200,
                          width: 600,
                          height: 70,
                        })
                      }
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500 text-left"
                    >
                      <span className="font-['Playfair_Display'] italic text-lg text-rose-400 block">
                        Elegance & Harmony
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'text',
                          text: 'CYBER ARCHIVE 2026',
                          fontSize: 40,
                          fontFamily: 'Space Grotesk',
                          fill: '#38bdf8',
                          letterSpacing: 3,
                          x: 100,
                          y: 200,
                          width: 600,
                          height: 60,
                        })
                      }
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500 text-left"
                    >
                      <span className="font-['Space_Grotesk'] text-sm font-bold text-sky-400 tracking-wider block">
                        CYBER ARCHIVE 2026
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ELEMENTS TAB */}
            {activeTab === 'elements' && (
              <div className="space-y-4">
                {/* Geometric Shapes Grid */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Basic Shapes</span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Rectangle */}
                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'rect',
                          width: 250,
                          height: 180,
                          fill: '#8b5cf6',
                          cornerRadius: 16,
                          x: Math.round((project.width - 250) / 2),
                          y: Math.round((project.height - 180) / 2),
                        })
                      }
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
                    >
                      <Square className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] text-slate-300">Rectangle</span>
                    </button>

                    {/* Circle */}
                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'circle',
                          width: 200,
                          height: 200,
                          fill: '#ec4899',
                          x: Math.round(project.width / 2),
                          y: Math.round(project.height / 2),
                        })
                      }
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
                    >
                      <Circle className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] text-slate-300">Circle</span>
                    </button>

                    {/* Triangle */}
                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'triangle',
                          width: 200,
                          height: 200,
                          fill: '#06b6d4',
                          x: Math.round(project.width / 2),
                          y: Math.round(project.height / 2),
                        })
                      }
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
                    >
                      <Triangle className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] text-slate-300">Triangle</span>
                    </button>

                    {/* Star */}
                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'star',
                          width: 200,
                          height: 200,
                          fill: '#f59e0b',
                          numPoints: 5,
                          innerRadius: 40,
                          outerRadius: 90,
                          x: Math.round(project.width / 2),
                          y: Math.round(project.height / 2),
                        })
                      }
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
                    >
                      <Star className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] text-slate-300">Star</span>
                    </button>

                    {/* Line */}
                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'line',
                          width: 300,
                          height: 4,
                          fill: '#ffffff',
                          stroke: '#ffffff',
                          strokeWidth: 4,
                          points: [0, 0, 300, 0],
                          x: Math.round((project.width - 300) / 2),
                          y: Math.round(project.height / 2),
                        })
                      }
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
                    >
                      <Minus className="w-6 h-6 text-slate-300 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] text-slate-300">Line</span>
                    </button>

                    {/* Arrow */}
                    <button
                      onClick={() =>
                        onAddElement({
                          type: 'arrow',
                          width: 300,
                          height: 4,
                          fill: '#8b5cf6',
                          stroke: '#8b5cf6',
                          strokeWidth: 4,
                          points: [0, 0, 300, 0],
                          x: Math.round((project.width - 300) / 2),
                          y: Math.round(project.height / 2),
                        })
                      }
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
                    >
                      <MoveRight className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] text-slate-300">Arrow</span>
                    </button>
                  </div>
                </div>

                {/* Stickers & Badges */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Studio Badges & Stickers
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {SAMPLE_STICKERS.map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => handleAddStockAsset(sticker)}
                        className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-800/80 group"
                      >
                        <img
                          src={sticker.src}
                          alt={sticker.title}
                          className="w-14 h-14 object-contain group-hover:scale-105 transition-transform"
                        />
                        <span className="text-[11px] text-slate-300 text-center line-clamp-1">
                          {sticker.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. UPLOADS TAB */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo from Device
                </button>

                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Free Royalty-Free Stock Photos
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {SAMPLE_PHOTOS.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => handleAddStockAsset(photo)}
                        className="rounded-xl overflow-hidden border border-slate-800 hover:border-violet-500 transition-all group relative"
                      >
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-medium text-white line-clamp-1">
                            {photo.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. BACKGROUND TAB */}
            {activeTab === 'background' && (
              <div className="space-y-4">
                {/* Transparent Toggle */}
                <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.isTransparent ?? false}
                    onChange={(e) => onUpdateProject({ isTransparent: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Transparent Background</span>
                    <span className="text-[10px] text-slate-400">Useful for PNG logos and stickers</span>
                  </div>
                </label>

                {/* Color Swatches */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Background Color
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {PALETTE_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          onUpdateProject({
                            backgroundColor: c,
                            isTransparent: false,
                          })
                        }
                        className={`w-9 h-9 rounded-lg border transition-all ${
                          project.backgroundColor === c && !project.isTransparent
                            ? 'border-violet-400 scale-110 shadow-lg'
                            : 'border-white/10 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-800">
                    <input
                      type="color"
                      value={project.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        onUpdateProject({
                          backgroundColor: e.target.value,
                          isTransparent: false,
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">
                      Custom: {project.backgroundColor}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. LAYERS TAB */}
            {activeTab === 'layers' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 mb-2">
                  Top elements appear in front. Click to select, hide, or reorder:
                </p>

                {project.elements.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Artboard is currently empty.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* Reverse to show top layers at top of list */}
                    {[...project.elements].reverse().map((el, revIndex) => {
                      const actualIndex = project.elements.length - 1 - revIndex;
                      const isSelected = selectedId === el.id;

                      return (
                        <div
                          key={el.id}
                          onClick={() => onSelectElement(el.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-violet-950/60 border-violet-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                            <span className="font-semibold text-[11px] truncate">
                              {el.type === 'text'
                                ? `Text: "${(el as any).text.substring(0, 16)}"`
                                : el.name || `${el.type} shape`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Visibility */}
                            <button
                              onClick={() => {
                                const copy = [...project.elements];
                                copy[actualIndex] = {
                                  ...copy[actualIndex],
                                  isVisible: copy[actualIndex].isVisible === false ? true : false,
                                };
                                onReorderElements(copy);
                              }}
                              className="p-1 hover:text-white text-slate-400"
                              title={el.isVisible === false ? 'Show' : 'Hide'}
                            >
                              {el.isVisible === false ? (
                                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Lock */}
                            <button
                              onClick={() => {
                                const copy = [...project.elements];
                                copy[actualIndex] = {
                                  ...copy[actualIndex],
                                  isLocked: !copy[actualIndex].isLocked,
                                };
                                onReorderElements(copy);
                              }}
                              className="p-1 hover:text-white text-slate-400"
                              title={el.isLocked ? 'Unlock' : 'Lock'}
                            >
                              {el.isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Move Up */}
                            <button
                              disabled={actualIndex === project.elements.length - 1}
                              onClick={() => moveLayer(actualIndex, 'up')}
                              className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                              title="Bring forward"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              disabled={actualIndex === 0}
                              onClick={() => moveLayer(actualIndex, 'down')}
                              className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                              title="Send backward"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => onDeleteElement(el.id)}
                              className="p-1 hover:text-red-400 text-slate-500"
                              title="Delete layer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
