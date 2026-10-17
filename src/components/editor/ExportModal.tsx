import React, { useState } from 'react';
import { Project } from '../../types/editor';
import { exportProjectJson } from '../../services/storage';
import confetti from 'canvas-confetti';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  FileCode, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

import { AdsConfig } from '../../types/admin';
import { AdMobBanner } from '../ads/AdMobBanner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onExportImageDataUrl: (format: 'png' | 'jpeg', quality: number, transparent: boolean, pixelRatio: number) => Promise<string | null>;
  adsConfig?: AdsConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onExportImageDataUrl,
  adsConfig,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'json'>('png');
  const [quality, setQuality] = useState(0.92);
  const [transparentBg, setTransparentBg] = useState(project.isTransparent ?? false);
  const [resolutionScale, setResolutionScale] = useState<number>(1); // 1x, 2x for Retina/HD
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8b5cf6', '#ec4899', '#38bdf8', '#facc15'],
      });
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsExporting(true);

    try {
      if (format === 'json') {
        exportProjectJson(project);
        triggerCelebration();
        setSuccessNotice('Pixora project JSON downloaded successfully!');
        setIsExporting(false);
        return;
      }

      const dataUrl = await onExportImageDataUrl(
        format,
        quality,
        transparentBg && format === 'png',
        resolutionScale
      );

      if (!dataUrl) {
        throw new Error('Failed to generate high-resolution raster image.');
      }

      // Trigger download
      const cleanName = (project.title || 'pixora-artwork')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const link = document.createElement('a');
      link.download = `${cleanName}-${resolutionScale}x.${format === 'png' ? 'png' : 'jpg'}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();

      triggerCelebration();
      setSuccessNotice(`Exported ${project.width * resolutionScale}×${project.height * resolutionScale}px ${format.toUpperCase()}!`);
    } catch (err: any) {
      console.error('Export failed', err);
      setErrorMessage(err?.message || 'Export error occurred. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    setErrorMessage(null);
    if (!navigator.share) {
      setErrorMessage('Direct Web Share is not supported on this browser. Use Download instead.');
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await onExportImageDataUrl('png', 0.95, transparentBg, 1);
      if (!dataUrl) throw new Error('Image render failed');

      // Convert data URL to Blob for sharing
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${project.title || 'design'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: project.title,
          text: `Check out my graphic design created with Pixora!`,
          files: [file],
        });
        triggerCelebration();
        setSuccessNotice('Shared successfully!');
      } else {
        await navigator.share({
          title: project.title,
          text: `Created with Pixora: ${project.title}`,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMessage(err.message || 'Share aborted or failed.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const outputWidth = Math.round(project.width * resolutionScale);
  const outputHeight = Math.round(project.height * resolutionScale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#131b2e] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-[#0f172a]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white font-['Outfit']">Export Artwork</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* File Format Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                  format === 'png'
                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>PNG Image</span>
                <span className="text-[10px] font-normal text-violet-300">High Quality & Alpha</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                  format === 'jpeg'
                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>JPEG Photo</span>
                <span className="text-[10px] font-normal text-slate-400">Smaller File Size</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                  format === 'json'
                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span className="flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5" /> Pixora File
                </span>
                <span className="text-[10px] font-normal text-slate-400">Editable Backup</span>
              </button>
            </div>
          </div>

          {/* Options for Raster formats */}
          {format !== 'json' && (
            <div className="space-y-4 pt-1">
              {/* Resolution Multiplier */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Export Resolution</span>
                  <span className="font-mono text-violet-400 font-semibold">
                    {outputWidth} × {outputHeight} px
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionScale(1)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      resolutionScale === 1
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    1× Standard (Clean Web)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionScale(2)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      resolutionScale === 2
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    2× Ultra HD (Print / Retina)
                  </button>
                </div>
              </div>

              {/* Transparent BG toggle for PNG */}
              {format === 'png' && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-700/80 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-600"
                  />
                  <div>
                    <span className="font-medium text-white block">Transparent Background</span>
                    <span className="text-[11px] text-slate-400">
                      Omit artboard background color in the exported PNG
                    </span>
                  </div>
                </label>
              )}

              {/* Quality slider for JPEG */}
              {format === 'jpeg' && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span>JPEG Quality</span>
                    <span className="font-mono font-bold text-violet-400">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Feedback & Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* AdMob Banner Slot */}
          {adsConfig && (
            <div className="pt-1">
              <AdMobBanner adsConfig={adsConfig} placement="export" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownload}
              className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating Art...' : 'Download to Device'}
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                disabled={isExporting}
                onClick={handleNativeShare}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                title="Share directly via mobile sheet"
              >
                <Share2 className="w-4 h-4 text-violet-400" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
