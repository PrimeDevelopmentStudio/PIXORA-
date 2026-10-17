import React, { useState } from 'react';
import { TEMPLATES } from '../../constants/templates';
import { Template, TemplateCategory, Project } from '../../types/editor';
import { AdsConfig } from '../../types/admin';
import { createProjectFromTemplate } from '../../services/storage';
import { AdMobBanner } from '../ads/AdMobBanner';
import { X, Search, Sparkles, Plus, ArrowRight, Users, Award, Upload } from 'lucide-react';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (project: Project) => void;
  onNewBlank: () => void;
  onOpenPublishModal?: () => void;
  initialCategory?: TemplateCategory;
  hiddenTemplateIds?: string[];
  customTemplates?: Template[];
  communityTemplates?: Template[];
  adsConfig?: AdsConfig;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onNewBlank,
  onOpenPublishModal,
  initialCategory = 'all',
  hiddenTemplateIds = [],
  customTemplates = [],
  communityTemplates = [],
  adsConfig,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>(initialCategory);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'official' | 'community'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'social', label: 'Social Media' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'posters', label: 'Posters' },
    { id: 'invitations', label: 'Invitations' },
    { id: 'presentations', label: 'Presentations' },
    { id: 'logos', label: 'Logos' },
    { id: 'business', label: 'Business' },
    { id: 'photo', label: 'Photo Designs' },
  ];

  // Combine all sources
  const combined = [...customTemplates, ...TEMPLATES, ...communityTemplates];

  const filteredTemplates = combined.filter((tpl) => {
    if (hiddenTemplateIds.includes(tpl.id)) return false;

    // Filter by source
    if (sourceFilter === 'official' && tpl.isCommunity) return false;
    if (sourceFilter === 'community' && !tpl.isCommunity) return false;

    // Filter by category
    const matchesCat = selectedCategory === 'all' || tpl.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.categoryLabel.toLowerCase().includes(q) ||
      tpl.tags.some((t) => t.toLowerCase().includes(q)) ||
      (tpl.authorName && tpl.authorName.toLowerCase().includes(q)) ||
      (tpl.description && tpl.description.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleApplyTemplate = (template: Template) => {
    const project = createProjectFromTemplate(template);
    onSelectTemplate(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-6xl h-[92vh] bg-[#0e1424] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-800 gap-4 bg-[#0a0f1d]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                Template Library
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official studio creations + Player community designs. Click to customize anything.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates or creators..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Filters: Source (Official / Community) + Categories */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-[#0f172a]/70 flex flex-wrap items-center justify-between gap-3">
          {/* Source Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === 'all'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Designs ({combined.length})
            </button>
            <button
              onClick={() => setSourceFilter('official')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                sourceFilter === 'official'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Official ({TEMPLATES.length + customTemplates.length})
            </button>
            <button
              onClick={() => setSourceFilter('community')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                sourceFilter === 'community'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Community ({communityTemplates.length})
            </button>
          </div>

          {/* Player Submit Template CTA */}
          {onOpenPublishModal && (
            <button
              onClick={() => {
                onClose();
                onOpenPublishModal();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-violet-400" />
              <span>Share My Design as Template</span>
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-[#0c1220]/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40 space-y-5">
          {/* AdMob Banner Slot (if enabled) */}
          {adsConfig && (
            <AdMobBanner adsConfig={adsConfig} placement="templates" className="mb-2" />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {/* Blank Canvas Option */}
            <div
              onClick={() => {
                onClose();
                onNewBlank();
              }}
              className="group cursor-pointer border-2 border-dashed border-slate-700/80 hover:border-violet-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all bg-slate-900/30 hover:bg-slate-900/60 min-h-[260px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                <Plus className="w-7 h-7" />
              </div>
              <h3 className="text-white font-bold text-base group-hover:text-violet-300">
                Start from Blank
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Create a custom artboard with your exact required dimensions.
              </p>
            </div>

            {/* Template Cards */}
            {filteredTemplates.map((template) => {
              const aspectRatio = template.width / template.height;
              const isTall = aspectRatio < 0.8;
              const isWide = aspectRatio > 1.3;

              return (
                <div
                  key={template.id}
                  className="group flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/80 overflow-hidden shadow-lg hover:shadow-violet-900/20 transition-all duration-200"
                >
                  {/* Scaled Visual Preview Window */}
                  <div
                    className="relative w-full h-52 bg-[#060810] flex items-center justify-center p-3 overflow-hidden cursor-pointer"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    {/* Simulated Miniature Render */}
                    <div
                      className="relative rounded shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105"
                      style={{
                        width: isWide ? '90%' : isTall ? '50%' : '70%',
                        aspectRatio: `${template.width} / ${template.height}`,
                        backgroundColor: template.backgroundColor,
                      }}
                    >
                      {template.elements.slice(0, 5).map((el, i) => {
                        const relX = (el.x / template.width) * 100;
                        const relY = (el.y / template.height) * 100;
                        const relW = (el.width / template.width) * 100;
                        const relH = (el.height / template.height) * 100;

                        if (el.type === 'text') {
                          return (
                            <div
                              key={i}
                              className="absolute font-bold overflow-hidden whitespace-nowrap text-ellipsis"
                              style={{
                                left: `${relX}%`,
                                top: `${relY}%`,
                                width: `${relW}%`,
                                color: (el as any).fill,
                                fontSize: '6px',
                                opacity: el.opacity ?? 1,
                              }}
                            >
                              {(el as any).text}
                            </div>
                          );
                        }

                        if (el.type === 'circle') {
                          return (
                            <div
                              key={i}
                              className="absolute rounded-full"
                              style={{
                                left: `${relX - relW / 2}%`,
                                top: `${relY - relH / 2}%`,
                                width: `${relW}%`,
                                height: `${relH}%`,
                                backgroundColor: (el as any).fill || '#8b5cf6',
                                opacity: el.opacity ?? 1,
                              }}
                            />
                          );
                        }

                        return (
                          <div
                            key={i}
                            className="absolute rounded-sm"
                            style={{
                              left: `${relX}%`,
                              top: `${relY}%`,
                              width: `${relW}%`,
                              height: `${relH}%`,
                              backgroundColor: (el as any).fill || '#8b5cf6',
                              opacity: el.opacity ?? 1,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Community / Creator Badge */}
                    {template.isCommunity && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-700/80 text-[10px] text-cyan-300 font-bold flex items-center gap-1 shadow">
                        <Users className="w-3 h-3" />
                        <span>Community</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-violet-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(template);
                        }}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-transform group-hover:scale-105"
                      >
                        Customize This Template
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex flex-col justify-between flex-1 bg-slate-900/90 border-t border-slate-800/80">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                        <span className="text-violet-400 font-semibold">{template.categoryLabel}</span>
                        <span className="font-mono">{template.width}×{template.height}</span>
                      </div>
                      <h4 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-violet-300 transition-colors">
                        {template.title}
                      </h4>

                      {/* Author attribution if community */}
                      {template.authorName && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          By: <span className="text-slate-300 font-medium">{template.authorName}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="mt-3 w-full py-2 bg-slate-800 hover:bg-violet-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-base font-semibold text-slate-300">
                No templates found matching your criteria.
              </p>
              <p className="text-xs mt-1">
                Be the first to share a community template or clear your search filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSourceFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
