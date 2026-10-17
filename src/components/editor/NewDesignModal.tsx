import React, { useState } from 'react';
import { CANVAS_PRESETS } from '../../constants/presets';
import { CanvasDimensions, Project } from '../../types/editor';
import { createProject } from '../../services/storage';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Square, 
  Smartphone, 
  Tv, 
  FileText, 
  Maximize2, 
  Mail, 
  Hexagon, 
  Image as ImageIcon 
} from 'lucide-react';

interface NewDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const NewDesignModal: React.FC<NewDesignModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [customTitle, setCustomTitle] = useState('');
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);

  if (!isOpen) return null;

  const getPresetIcon = (label: string) => {
    if (label.includes('Instagram')) return <Square className="w-5 h-5 text-pink-400" />;
    if (label.includes('Story') || label.includes('TikTok')) return <Smartphone className="w-5 h-5 text-violet-400" />;
    if (label.includes('YouTube')) return <Tv className="w-5 h-5 text-red-400" />;
    if (label.includes('Poster') || label.includes('Flyer')) return <FileText className="w-5 h-5 text-amber-400" />;
    if (label.includes('Presentation')) return <Maximize2 className="w-5 h-5 text-cyan-400" />;
    if (label.includes('Invitation')) return <Mail className="w-5 h-5 text-emerald-400" />;
    if (label.includes('Logo')) return <Hexagon className="w-5 h-5 text-indigo-400" />;
    return <ImageIcon className="w-5 h-5 text-blue-400" />;
  };

  const handleSelectPreset = (preset: CanvasDimensions) => {
    const project = createProject(
      `${preset.label} Design`,
      preset.width,
      preset.height,
      bgColor,
      [],
      isTransparent
    );
    onProjectCreated(project);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Math.max(100, Math.min(customWidth || 1080, 4000));
    const h = Math.max(100, Math.min(customHeight || 1080, 4000));
    const project = createProject(
      customTitle.trim() || `Custom ${w}×${h}`,
      w,
      h,
      bgColor,
      [],
      isTransparent
    );
    onProjectCreated(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#131b2e] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-[#0f172a]/70">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white font-['Outfit']">Create a New Design</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setTab('presets')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              tab === 'presets'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Popular Formats
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              tab === 'custom'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Custom Size
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'presets' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CANVAS_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex flex-col text-left p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-violet-500 hover:bg-slate-800/80 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 group-hover:scale-105 transition-transform">
                      {getPresetIcon(preset.label)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {preset.width}×{preset.height}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-violet-300 transition-colors">
                    {preset.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Design Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Brand Launch Campaign"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={4000}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={4000}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Background Color & Transparent Options */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Artboard Background
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        setIsTransparent(false);
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-sm font-mono text-slate-300 uppercase">{bgColor}</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={isTransparent}
                      onChange={(e) => setIsTransparent(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-900 border-slate-700"
                    />
                    <span>Transparent Background</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                >
                  Create Artboard
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
