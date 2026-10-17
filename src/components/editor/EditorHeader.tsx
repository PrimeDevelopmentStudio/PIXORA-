import React, { useState } from 'react';
import { Project } from '../../types/editor';
import { PixoraLogo } from '../common/PixoraLogo';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Save, 
  Download, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Edit3,
  Share2 
} from 'lucide-react';

interface EditorHeaderProps {
  project: Project;
  onUpdateTitle: (newTitle: string) => void;
  onBack: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSaved: boolean;
  onManualSave: () => void;
  onOpenExport: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onPublishTemplate?: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  project,
  onUpdateTitle,
  onBack,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSaved,
  onManualSave,
  onOpenExport,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onPublishTemplate,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(project.title);
    }
  };

  return (
    <header className="h-14 bg-[#0c111e] border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 z-30 select-none">
      {/* Left: Back & Project Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors flex-shrink-0"
          title="Back to Projects"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="hidden md:block flex-shrink-0">
          <PixoraLogo size="sm" />
        </div>

        <div className="h-5 w-px bg-slate-800 hidden md:block" />

        {/* Title editing */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="px-2 py-1 bg-slate-900 border border-violet-500 rounded text-sm text-white focus:outline-none max-w-[140px] sm:max-w-[220px]"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(project.title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800/80 transition-colors text-xs sm:text-sm font-semibold truncate max-w-[140px] sm:max-w-[220px] group"
              title="Click to rename design"
            >
              <span className="truncate">{project.title}</span>
              <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-violet-400 flex-shrink-0" />
            </button>
          )}

          {/* Canvas size badge */}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex-shrink-0">
            {project.width}×{project.height}
          </span>
        </div>
      </div>

      {/* Middle: Undo / Redo & Zoom */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden p-0.5">
          <button
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 hover:bg-slate-800 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 hover:bg-slate-800 rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="hidden lg:flex items-center bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden p-0.5 text-xs text-slate-300">
          <button
            onClick={onZoomOut}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-[11px] min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitScreen}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded border-l border-slate-800"
            title="Fit to Screen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Save Indicator & Export CTA */}
      <div className="flex items-center gap-2">
        {/* Save button / status */}
        <button
          onClick={onManualSave}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
            isSaved
              ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              : 'bg-violet-950/60 border-violet-600/60 text-violet-300 hover:bg-violet-900/60'
          }`}
          title="Save project locally"
        >
          {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-violet-400 animate-pulse" />}
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Publish as Template CTA */}
        {onPublishTemplate && (
          <button
            onClick={onPublishTemplate}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Publish your design to Community Templates"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Share Template</span>
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
