import React, { useState } from 'react';
import { AdsConfig } from '../../types/admin';
import { ExternalLink, Info, X } from 'lucide-react';

interface AdMobBannerProps {
  adsConfig: AdsConfig;
  placement: 'home' | 'export' | 'templates';
  className?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  adsConfig,
  placement,
  className = '',
}) => {
  const [closed, setClosed] = useState(false);

  // Check if ads are enabled globally and for this specific placement
  if (!adsConfig || !adsConfig.enabled || closed) return null;

  if (placement === 'home' && !adsConfig.bannerPlacementHome) return null;
  if (placement === 'export' && !adsConfig.bannerPlacementExport) return null;
  if (placement === 'templates' && !adsConfig.bannerPlacementTemplates) return null;

  return (
    <div
      className={`relative rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0d1322] via-[#12192c] to-[#0d1322] overflow-hidden shadow-lg select-none ${className}`}
    >
      {/* Top tiny Ad Label & Close */}
      <div className="flex items-center justify-between px-3 pt-1.5 pb-1 text-[10px] text-slate-500 border-b border-slate-800/60 bg-[#090d16]/60">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold tracking-wider uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            Ad
          </span>
          <span className="font-mono text-[9px] text-slate-500 hidden sm:inline">
            Unit: {adsConfig.adMobUnitId || 'ca-app-pub-7620404585950475/5436927338'}
          </span>
        </div>

        <button
          onClick={() => setClosed(true)}
          className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
          title="Hide ad"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Ad Content Display */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          {/* Ad Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-md flex-shrink-0">
            ★
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
              <span>{adsConfig.customBannerTitle || 'Supercharge Your Creative Workflow with Pixora Pro'}</span>
              <span className="text-[10px] text-violet-400 font-semibold underline cursor-pointer hidden md:inline">
                Sponsor
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {adsConfig.customBannerDesc || 'High-resolution export, vector stickers, community templates, and zero watermark forever.'}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={adsConfig.customBannerUrl || 'https://google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{adsConfig.customBannerCta || 'Install / Visit'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
