import React, { useState } from 'react';
import { Project, Template, TemplateCategory } from '../../types/editor';
import { TEMPLATES } from '../../constants/templates';
import { CANVAS_PRESETS } from '../../constants/presets';
import { PixoraLogo } from '../common/PixoraLogo';
import { createProjectFromTemplate } from '../../services/storage';
import { 
  Search, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  FolderKanban, 
  Smartphone, 
  Tv, 
  FileText, 
  Mail, 
  Maximize2, 
  Hexagon, 
  Briefcase, 
  Camera, 
  Clock, 
  Flame, 
  Sliders,
  ShieldCheck 
} from 'lucide-react';

import { AdsConfig } from '../../types/admin';
import { AdMobBanner } from '../ads/AdMobBanner';

interface HomeScreenProps {
  onNewDesign: () => void;
  onOpenProject: (project: Project) => void;
  onOpenTemplates: (category?: TemplateCategory) => void;
  onOpenProjects: () => void;
  recentProjects: Project[];
  hiddenTemplateIds?: string[];
  customTemplates?: Template[];
  communityTemplates?: Template[];
  adsConfig?: AdsConfig;
  onOpenAdmin?: () => void;
  onPublishTemplate?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNewDesign,
  onOpenProject,
  onOpenTemplates,
  onOpenProjects,
  recentProjects,
  hiddenTemplateIds = [],
  customTemplates = [],
  communityTemplates = [],
  adsConfig,
  onOpenAdmin,
  onPublishTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');

  const categories: {
    id: TemplateCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'all', label: 'All Templates', icon: Sparkles },
    { id: 'social', label: 'Social Media', icon: Smartphone },
    { id: 'youtube', label: 'YouTube', icon: Tv },
    { id: 'posters', label: 'Posters', icon: FileText },
    { id: 'invitations', label: 'Invitations', icon: Mail },
    { id: 'presentations', label: 'Presentations', icon: Maximize2 },
    { id: 'logos', label: 'Logos', icon: Hexagon },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'photo', label: 'Photo Designs', icon: Camera },
  ];

  const handleSelectTemplate = (template: Template) => {
    const project = createProjectFromTemplate(template);
    onOpenProject(project);
  };

  const allAvailableTemplates = [...customTemplates, ...TEMPLATES, ...communityTemplates];

  const filteredTemplates = allAvailableTemplates.filter((tpl) => {
    if (hiddenTemplateIds.includes(tpl.id)) return false;
    const matchesCat = activeCategory === 'all' || tpl.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.categoryLabel.toLowerCase().includes(q) ||
      (tpl.authorName && tpl.authorName.toLowerCase().includes(q)) ||
      tpl.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/60 via-[#131b2e] to-[#0a0f1d] border border-violet-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Pixora Studio 2026 · Real-time Artboard Graphic Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
            What will you <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300">
              design today?
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl">
            Create stunning social media posts, YouTube thumbnails, posters, presentations, and brand logos with full layers, typography, and high-res export.
          </p>

          {/* Search Bar on Hero */}
          <div className="relative max-w-xl pt-2">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 16+ templates (e.g. YouTube, Sale, Event, Poster)..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500 shadow-xl"
            />
            <button
              onClick={onNewDesign}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic in Hero */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden lg:block overflow-hidden">
          <div className="w-96 h-96 rounded-full bg-violet-600/40 blur-3xl absolute -right-20 -top-20" />
          <div className="w-80 h-80 rounded-full bg-pink-600/30 blur-2xl absolute right-10 bottom-0" />
        </div>
      </div>

      {/* Quick Create Dimension Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
            <Flame className="w-5 h-5 text-amber-400" />
            Quick Create Blank Artboard
          </h2>
          <button
            onClick={onNewDesign}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            Custom Size
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CANVAS_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                const project = createProjectFromTemplate({
                  id: 'blank',
                  title: `${preset.label} Design`,
                  category: preset.category || 'social',
                  categoryLabel: preset.label,
                  width: preset.width,
                  height: preset.height,
                  backgroundColor: '#ffffff',
                  elements: [],
                  tags: [],
                });
                onOpenProject(project);
              }}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500 flex flex-col text-left transition-all hover:bg-slate-800/60 group"
            >
              <span className="text-xs font-bold text-white group-hover:text-violet-300 line-clamp-1">
                {preset.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                {preset.width}×{preset.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Projects Section */}
      {recentProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
              <Clock className="w-5 h-5 text-violet-400" />
              Recent Designs
            </h2>
            <button
              onClick={onOpenProjects}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View All ({recentProjects.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentProjects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenProject(p)}
                className="group p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500 cursor-pointer transition-all flex flex-col"
              >
                <div
                  className="w-full h-36 rounded-xl bg-[#090d16] flex items-center justify-center p-2 overflow-hidden mb-3 border border-slate-800/80 group-hover:scale-[1.02] transition-transform"
                >
                  <div
                    className="relative rounded shadow overflow-hidden"
                    style={{
                      width: p.width > p.height ? '80%' : '55%',
                      aspectRatio: `${p.width} / ${p.height}`,
                      backgroundColor: p.isTransparent ? '#1e293b' : p.backgroundColor,
                    }}
                  >
                    {p.elements.slice(0, 3).map((el, idx) => (
                      <div
                        key={idx}
                        className="absolute rounded-sm"
                        style={{
                          left: `${(el.x / p.width) * 100}%`,
                          top: `${(el.y / p.height) * 100}%`,
                          width: `${(el.width / p.width) * 100}%`,
                          height: `${(el.height / p.height) * 100}%`,
                          backgroundColor: (el as any).fill || '#8b5cf6',
                          opacity: el.opacity ?? 1,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white group-hover:text-violet-300 truncate">
                    {p.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {p.width}×{p.height}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills & Template Showcase */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Featured Templates
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any design to load actual editable shapes, fonts, and layers immediately into your artboard workspace.
            </p>
          </div>

          <button
            onClick={() => onOpenTemplates(activeCategory)}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 self-start sm:self-auto"
          >
            Explore Library ({TEMPLATES.length}+)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.slice(0, 8).map((template) => {
            const aspectRatio = template.width / template.height;
            const isWide = aspectRatio > 1.3;
            const isTall = aspectRatio < 0.8;

            return (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="group flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-violet-500 overflow-hidden shadow-lg hover:shadow-violet-900/20 transition-all cursor-pointer"
              >
                {/* Scaled Preview */}
                <div
                  className="relative w-full h-48 bg-[#070912] flex items-center justify-center p-3 overflow-hidden border-b border-slate-800/80"
                >
                  <div
                    className="relative rounded shadow-md overflow-hidden group-hover:scale-105 transition-transform"
                    style={{
                      width: isWide ? '90%' : isTall ? '50%' : '70%',
                      aspectRatio: `${template.width} / ${template.height}`,
                      backgroundColor: template.backgroundColor,
                    }}
                  >
                    {template.elements.slice(0, 4).map((el, i) => {
                      const relX = (el.x / template.width) * 100;
                      const relY = (el.y / template.height) * 100;
                      const relW = (el.width / template.width) * 100;
                      const relH = (el.height / template.height) * 100;

                      if (el.type === 'text') {
                        return (
                          <div
                            key={i}
                            className="absolute font-bold overflow-hidden text-ellipsis whitespace-nowrap"
                            style={{
                              left: `${relX}%`,
                              top: `${relY}%`,
                              width: `${relW}%`,
                              color: el.fill,
                              fontSize: '5px',
                            }}
                          >
                            {el.text}
                          </div>
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

                  <div className="absolute inset-0 bg-violet-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5">
                      Customize
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1 bg-slate-900/90">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
                      <span className="text-violet-400 font-semibold">{template.categoryLabel}</span>
                      <span className="font-mono">{template.width}×{template.height}</span>
                    </div>
                    <h3 className="font-bold text-xs text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
                      {template.title}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(template);
                    }}
                    className="mt-2.5 w-full py-1.5 bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Creator Hub Banner (Normal players can add templates) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#11192e] via-[#1a233d] to-[#12192e] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-600/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              Community Template Hub
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
              Share Your Designs as Public Templates
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mt-0.5">
              Any player or designer can publish editable templates for the Pixora community. Let other creators customize your work!
            </p>
          </div>
        </div>

        <button
          onClick={onPublishTemplate}
          className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Design as Template</span>
        </button>
      </div>

      {/* AdMob Monetization Banner */}
      {adsConfig && (
        <div className="pt-2">
          <AdMobBanner adsConfig={adsConfig} placement="home" />
        </div>
      )}

      {/* Discrete Footer & Owner Admin Access */}
      <footer className="pt-8 pb-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <PixoraLogo size="sm" />
          <span>© 2026 Pixora. Create Anything.</span>
        </div>

        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/50 text-slate-400 hover:text-violet-300 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Owner Admin</span>
          </button>
        )}
      </footer>
    </div>
  );
};
