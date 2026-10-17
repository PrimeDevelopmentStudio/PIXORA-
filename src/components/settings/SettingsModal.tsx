import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Database, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Smartphone, 
  Cloud, 
  Wand2, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearStorage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearStorage,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  // Approximate storage calculation
  const getStorageSize = () => {
    try {
      const data = localStorage.getItem('pixora_projects_v1') || '';
      const bytes = new Blob([data]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1048576).toFixed(2)} MB`;
    } catch {
      return 'Unknown';
    }
  };

  const comingSoonFeatures = [
    {
      title: 'AI Image Generator & Assistant',
      desc: 'Generate surreal graphics and AI photo expansions natively on your artboard.',
      icon: Wand2,
      badge: 'Coming Soon',
    },
    {
      title: 'Magic Background Removal',
      desc: 'One-tap subject cutout with precision edge refinement.',
      icon: Sparkles,
      badge: 'Coming Soon',
    },
    {
      title: 'Brand Kits & Custom Fonts',
      desc: 'Save corporate logos, color schemes, and upload TTF/WOFF2 font families.',
      icon: Layers,
      badge: 'Coming Soon',
    },
    {
      title: 'Cloud Sync & Team Collaboration',
      desc: 'Multiplayer editing and shared cloud workspaces across devices.',
      icon: Cloud,
      badge: 'Coming Soon',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#131b2e] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-[#0f172a]">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white font-['Outfit']">Pixora Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Storage & Local Data */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-400" />
              Local Device Storage
            </h3>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Browser Storage Used</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Editable designs stored privately in your browser ({getStorageSize()})
                </p>
              </div>

              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset Data
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearStorage();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Device & Engine Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-violet-400" />
              Runtime Environment
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Graphics Engine</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Konva 2D Hardware Acceleration
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Export Resolution</span>
                <span className="text-white font-semibold">1× Standard & 2× Retina Ultra HD</span>
              </div>
            </div>
          </div>

          {/* Roadmap / Coming Soon Features */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Upcoming Capabilities
            </h3>

            <div className="space-y-2.5">
              {comingSoonFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-violet-950/60 text-violet-400 border border-violet-800/40 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{f.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-violet-950 text-violet-300 border border-violet-800 text-[10px] font-semibold whitespace-nowrap">
                      {f.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
