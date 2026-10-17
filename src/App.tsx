/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, CanvasElement, Template, TemplateCategory, ActiveSidebarTab } from './types/editor';
import { AdminSettings } from './types/admin';
import { 
  getProjects, 
  saveProject, 
  createProject, 
  deleteProject, 
  duplicateProject 
} from './services/storage';
import { getAdminSettings, isAdminLoggedIn } from './services/adminService';
import { PixoraLogo } from './components/common/PixoraLogo';
import { AnnouncementBanner } from './components/common/AnnouncementBanner';
import { HomeScreen } from './components/home/HomeScreen';
import { ProjectsScreen } from './components/projects/ProjectsScreen';
import { EditorHeader } from './components/editor/EditorHeader';
import { EditorCanvas, EditorCanvasHandle } from './components/editor/EditorCanvas';
import { EditorSidebar } from './components/editor/EditorSidebar';
import { ElementPropertiesBar } from './components/editor/ElementPropertiesBar';
import { NewDesignModal } from './components/editor/NewDesignModal';
import { TemplateGalleryModal } from './components/templates/TemplateGalleryModal';
import { ExportModal } from './components/editor/ExportModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { PublishTemplateModal } from './components/templates/PublishTemplateModal';
import { 
  Home, 
  LayoutTemplate, 
  FolderKanban, 
  Settings as SettingsIcon, 
  Plus, 
  Sliders, 
  ShieldCheck, 
  Wrench, 
  Lock 
} from 'lucide-react';

export default function App() {
  // Navigation: 'home' | 'projects' | 'editor'
  const [view, setView] = useState<'home' | 'projects' | 'editor'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Admin & Owner states
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(getAdminSettings());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminLoggedIn());

  // Editor specific states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<ActiveSidebarTab | null>('templates');
  const [zoom, setZoom] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoActionRef = useRef<boolean>(false);

  // Modals
  const [isNewDesignOpen, setIsNewDesignOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState<TemplateCategory>('all');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Screen size tracking
  const [isMobile, setIsMobile] = useState(false);

  const canvasRef = useRef<EditorCanvasHandle>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load
  useEffect(() => {
    const loaded = getProjects();
    setProjects(loaded);
    setAdminSettings(getAdminSettings());
    setIsAdmin(isAdminLoggedIn());

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const refreshProjectsList = useCallback(() => {
    const loaded = getProjects();
    setProjects(loaded);
  }, []);

  const refreshAdminSettings = useCallback(() => {
    const updated = getAdminSettings();
    setAdminSettings(updated);
    setIsAdmin(isAdminLoggedIn());
  }, []);

  // Open Admin Handler
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn()) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Open a project into the Editor
  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setSelectedId(null);
    setHistory([JSON.parse(JSON.stringify(project.elements))]);
    setHistoryIndex(0);
    setIsSaved(true);
    setView('editor');
    setActiveSidebarTab(null);
  };

  // Push history snapshot on change
  const recordHistory = useCallback((elements: CanvasElement[]) => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }

    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const nextHistory = [...sliced, JSON.parse(JSON.stringify(elements))];
      // Limit to last 30 states
      if (nextHistory.length > 30) {
        nextHistory.shift();
      }
      return nextHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [historyIndex]);

  // Debounced auto-save whenever currentProject changes
  const triggerAutoSave = useCallback((projectToSave: Project) => {
    setIsSaved(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveProject(projectToSave);
      setIsSaved(true);
      refreshProjectsList();
    }, 800);
  }, [refreshProjectsList]);

  // Update a single element on canvas
  const handleUpdateElement = useCallback((updated: CanvasElement) => {
    if (!currentProject) return;

    const newElements = currentProject.elements.map((el) =>
      el.id === updated.id ? updated : el
    );

    const updatedProject = {
      ...currentProject,
      elements: newElements,
      updatedAt: Date.now(),
    };

    setCurrentProject(updatedProject);
    recordHistory(newElements);
    triggerAutoSave(updatedProject);
  }, [currentProject, recordHistory, triggerAutoSave]);

  // Add a new element to current project
  const handleAddElement = useCallback((elementPartial: Partial<CanvasElement>) => {
    if (!currentProject) return;

    const newId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newElement = {
      id: newId,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      ...elementPartial,
    } as CanvasElement;

    const newElements = [...currentProject.elements, newElement];
    const updatedProject = {
      ...currentProject,
      elements: newElements,
      updatedAt: Date.now(),
    };

    setCurrentProject(updatedProject);
    setSelectedId(newId);
    recordHistory(newElements);
    triggerAutoSave(updatedProject);
  }, [currentProject, recordHistory, triggerAutoSave]);

  // Delete an element
  const handleDeleteElement = useCallback((id: string) => {
    if (!currentProject) return;

    const newElements = currentProject.elements.filter((el) => el.id !== id);
    const updatedProject = {
      ...currentProject,
      elements: newElements,
      updatedAt: Date.now(),
    };

    setCurrentProject(updatedProject);
    if (selectedId === id) setSelectedId(null);
    recordHistory(newElements);
    triggerAutoSave(updatedProject);
  }, [currentProject, selectedId, recordHistory, triggerAutoSave]);

  // Duplicate an element
  const handleDuplicateElement = useCallback((id: string) => {
    if (!currentProject) return;

    const target = currentProject.elements.find((el) => el.id === id);
    if (!target) return;

    const cloned: CanvasElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: target.x + 25,
      y: target.y + 25,
    };

    const newElements = [...currentProject.elements, cloned];
    const updatedProject = {
      ...currentProject,
      elements: newElements,
      updatedAt: Date.now(),
    };

    setCurrentProject(updatedProject);
    setSelectedId(cloned.id);
    recordHistory(newElements);
    triggerAutoSave(updatedProject);
  }, [currentProject, recordHistory, triggerAutoSave]);

  // Reorder elements
  const handleReorderElements = useCallback((newElements: CanvasElement[]) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      elements: newElements,
      updatedAt: Date.now(),
    };

    setCurrentProject(updatedProject);
    recordHistory(newElements);
    triggerAutoSave(updatedProject);
  }, [currentProject, recordHistory, triggerAutoSave]);

  // Bring forward / send backward
  const handleBringForward = (id: string) => {
    if (!currentProject) return;
    const idx = currentProject.elements.findIndex((el) => el.id === id);
    if (idx < 0 || idx >= currentProject.elements.length - 1) return;

    const copy = [...currentProject.elements];
    const [moved] = copy.splice(idx, 1);
    copy.splice(idx + 1, 0, moved);
    handleReorderElements(copy);
  };

  const handleSendBackward = (id: string) => {
    if (!currentProject) return;
    const idx = currentProject.elements.findIndex((el) => el.id === id);
    if (idx <= 0) return;

    const copy = [...currentProject.elements];
    const [moved] = copy.splice(idx, 1);
    copy.splice(idx - 1, 0, moved);
    handleReorderElements(copy);
  };

  // Update whole project attributes
  const handleUpdateProject = (updates: Partial<Project>) => {
    if (!currentProject) return;
    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: Date.now(),
    };
    setCurrentProject(updatedProject);
    triggerAutoSave(updatedProject);
  };

  // Undo / Redo logic
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo || !currentProject) return;
    const prevIdx = historyIndex - 1;
    const targetElements = history[prevIdx];
    if (!targetElements) return;

    isUndoRedoActionRef.current = true;
    setHistoryIndex(prevIdx);

    const updatedProject = {
      ...currentProject,
      elements: JSON.parse(JSON.stringify(targetElements)),
    };
    setCurrentProject(updatedProject);
    triggerAutoSave(updatedProject);
  }, [canUndo, currentProject, history, historyIndex, triggerAutoSave]);

  const handleRedo = useCallback(() => {
    if (!canRedo || !currentProject) return;
    const nextIdx = historyIndex + 1;
    const targetElements = history[nextIdx];
    if (!targetElements) return;

    isUndoRedoActionRef.current = true;
    setHistoryIndex(nextIdx);

    const updatedProject = {
      ...currentProject,
      elements: JSON.parse(JSON.stringify(targetElements)),
    };
    setCurrentProject(updatedProject);
    triggerAutoSave(updatedProject);
  }, [canRedo, currentProject, history, historyIndex, triggerAutoSave]);

  // Global Keyboard shortcuts in Editor
  useEffect(() => {
    if (view !== 'editor') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Delete selected: Delete / Backspace
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteElement(selectedId);
      }
      // Escape: Deselect
      else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, selectedId, handleUndo, handleRedo, handleDeleteElement]);

  // Handle Export image data URL from Konva
  const handleExportDataUrl = async (
    format: 'png' | 'jpeg',
    quality: number,
    transparent: boolean,
    pixelRatio: number
  ) => {
    if (!canvasRef.current) return null;
    return await canvasRef.current.exportDataUrl(format, quality, transparent, pixelRatio);
  };

  // Selected element object
  const selectedElement = currentProject?.elements.find((el) => el.id === selectedId) || null;

  // Maintenance mode screen for regular visitors
  const isLockedByMaintenance = adminSettings.maintenanceMode && !isAdminLoggedIn();

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden font-['Inter']">
      {/* GLOBAL OWNER ANNOUNCEMENT BANNER */}
      {view !== 'editor' && (
        <AnnouncementBanner
          announcement={adminSettings.announcement}
          onActionClick={() => {
            setGalleryCategory('all');
            setIsTemplateGalleryOpen(true);
          }}
        />
      )}

      {/* GLOBAL TOP NAV (Visible when on Home or Projects view) */}
      {view !== 'editor' && (
        <nav className="h-16 border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('home')} className="flex items-center">
              <PixoraLogo size="md" showTagline={!isMobile} />
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-300">
              <button
                onClick={() => setView('home')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  view === 'home' ? 'text-violet-400 bg-violet-600/10' : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => {
                  setGalleryCategory('all');
                  setIsTemplateGalleryOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
              >
                <LayoutTemplate className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={() => setView('projects')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  view === 'projects' ? 'text-violet-400 bg-violet-600/10' : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                My Projects
              </button>
            </div>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Owner Admin Button */}
            <button
              onClick={handleOpenAdmin}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-violet-950/80 border-violet-500/80 text-violet-200 shadow-md shadow-violet-900/30'
                  : 'bg-slate-800/60 hover:bg-violet-950/60 text-slate-300 hover:text-violet-300 border-slate-700/60 hover:border-violet-500/50'
              }`}
              title="Admin Panel (Secured)"
            >
              <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-emerald-400' : 'text-violet-400'}`} />
              {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              <span className="hidden sm:inline">{isAdmin ? 'Admin Portal' : 'Admin'}</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Settings & Storage"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsNewDesignOpen(true)}
              className="px-3.5 py-2 sm:px-4 sm:py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Design</span>
            </button>
          </div>
        </nav>
      )}

      {/* MAINTENANCE OVERLAY (If enabled by owner and user not logged in as admin) */}
      {isLockedByMaintenance ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-[#131b2e] border border-slate-700/80 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Wrench className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white font-['Outfit']">System Maintenance</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {adminSettings.maintenanceMessage || 'Pixora is currently undergoing scheduled maintenance. Please check back shortly.'}
            </p>
            <div className="pt-4 border-t border-slate-800 flex justify-center">
              <button
                onClick={handleOpenAdmin}
                className="text-xs text-slate-500 hover:text-violet-400 flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                Owner Login
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* VIEW 1: HOME SCREEN */}
          {view === 'home' && (
            <HomeScreen
              recentProjects={projects}
              onNewDesign={() => setIsNewDesignOpen(true)}
              onOpenProject={handleOpenProject}
              onOpenTemplates={(cat) => {
                setGalleryCategory(cat || 'all');
                setIsTemplateGalleryOpen(true);
              }}
              onOpenProjects={() => setView('projects')}
              hiddenTemplateIds={adminSettings.hiddenTemplateIds}
              customTemplates={adminSettings.customTemplates}
              communityTemplates={adminSettings.communityTemplates}
              adsConfig={adminSettings.adsConfig}
              onOpenAdmin={handleOpenAdmin}
              onPublishTemplate={() => {
                if (projects.length > 0) {
                  setCurrentProject(projects[0]);
                  setIsPublishModalOpen(true);
                } else {
                  setIsNewDesignOpen(true);
                }
              }}
            />
          )}

          {/* VIEW 2: PROJECTS SCREEN */}
          {view === 'projects' && (
            <ProjectsScreen
              projects={projects}
              onOpenProject={handleOpenProject}
              onNewDesign={() => setIsNewDesignOpen(true)}
              onRefreshProjects={refreshProjectsList}
              onPublishTemplate={(p) => {
                setCurrentProject(p);
                setIsPublishModalOpen(true);
              }}
            />
          )}

          {/* VIEW 3: FULLSCREEN DESIGN EDITOR */}
          {view === 'editor' && currentProject && (
            <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0f19] overflow-hidden select-none">
              {/* Header */}
              <EditorHeader
                project={currentProject}
                onUpdateTitle={(title) => handleUpdateProject({ title })}
                onBack={() => {
                  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                  saveProject(currentProject);
                  refreshProjectsList();
                  setView('home');
                }}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                isSaved={isSaved}
                onManualSave={() => {
                  saveProject(currentProject);
                  setIsSaved(true);
                  refreshProjectsList();
                }}
                onOpenExport={() => setIsExportOpen(true)}
                onPublishTemplate={() => setIsPublishModalOpen(true)}
                zoom={zoom}
                onZoomIn={() => canvasRef.current?.zoomIn()}
                onZoomOut={() => canvasRef.current?.zoomOut()}
                onFitScreen={() => canvasRef.current?.fitToScreen()}
              />

              {/* Contextual Properties Bar (When element selected) */}
              {selectedElement && (
                <ElementPropertiesBar
                  element={selectedElement}
                  onUpdate={handleUpdateElement}
                  onDuplicate={handleDuplicateElement}
                  onDelete={handleDeleteElement}
                  onBringForward={handleBringForward}
                  onSendBackward={handleSendBackward}
                />
              )}

              {/* Editor Workspace: Sidebar + Canvas */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar / Tools */}
                <EditorSidebar
                  activeTab={activeSidebarTab}
                  onSelectTab={setActiveSidebarTab}
                  project={currentProject}
                  onAddElement={handleAddElement}
                  onUpdateProject={handleUpdateProject}
                  onSelectTemplate={(tpl) => {
                    const cloned: CanvasElement[] = tpl.elements.map((el, i) => ({
                      ...JSON.parse(JSON.stringify(el)),
                      id: `el_${Date.now()}_${i}`,
                    }));
                    handleUpdateProject({
                      width: tpl.width,
                      height: tpl.height,
                      backgroundColor: tpl.backgroundColor,
                      elements: cloned,
                    });
                    recordHistory(cloned);
                    setActiveSidebarTab(null);
                  }}
                  selectedId={selectedId}
                  onSelectElement={setSelectedId}
                  onReorderElements={handleReorderElements}
                  onDeleteElement={handleDeleteElement}
                  isMobile={isMobile}
                />

                {/* Interactive Canvas Workspace */}
                <main className="flex-1 h-full relative overflow-hidden">
                  <EditorCanvas
                    ref={canvasRef}
                    project={currentProject}
                    selectedId={selectedId}
                    onSelectElement={setSelectedId}
                    onUpdateElement={handleUpdateElement}
                    zoom={zoom}
                    onZoomChange={setZoom}
                  />
                </main>
              </div>
            </div>
          )}
        </>
      )}

      {/* MOBILE BOTTOM NAVIGATION (Home/Projects views only) */}
      {view !== 'editor' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a] border-t border-slate-800 z-40 flex items-center justify-around px-2">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl ${
              view === 'home' ? 'text-violet-400' : 'text-slate-400'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          <button
            onClick={() => {
              setGalleryCategory('all');
              setIsTemplateGalleryOpen(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400"
          >
            <LayoutTemplate className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Templates</span>
          </button>
          <button
            onClick={() => setIsNewDesignOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-violet-400 -mt-3 bg-violet-600/20 border border-violet-500/40 rounded-full w-12 h-12"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setView('projects')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl ${
              view === 'projects' ? 'text-violet-400' : 'text-slate-400'
            }`}
          >
            <FolderKanban className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Projects</span>
          </button>
          <button
            onClick={handleOpenAdmin}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400"
          >
            <ShieldCheck className="w-5 h-5 mb-0.5 text-violet-400" />
            <span className="text-[10px] font-semibold">Owner</span>
          </button>
        </div>
      )}

      {/* MODAL 1: Create New Design */}
      <NewDesignModal
        isOpen={isNewDesignOpen}
        onClose={() => setIsNewDesignOpen(false)}
        onProjectCreated={(newProject) => {
          refreshProjectsList();
          handleOpenProject(newProject);
        }}
      />

      {/* MODAL 2: Template Library */}
      <TemplateGalleryModal
        isOpen={isTemplateGalleryOpen}
        initialCategory={galleryCategory}
        hiddenTemplateIds={adminSettings.hiddenTemplateIds}
        customTemplates={adminSettings.customTemplates}
        communityTemplates={adminSettings.communityTemplates}
        adsConfig={adminSettings.adsConfig}
        onOpenPublishModal={() => {
          if (projects.length > 0) {
            setCurrentProject(projects[0]);
            setIsPublishModalOpen(true);
          } else {
            setIsNewDesignOpen(true);
          }
        }}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={(tplProject) => {
          refreshProjectsList();
          handleOpenProject(tplProject);
        }}
        onNewBlank={() => {
          setIsNewDesignOpen(true);
        }}
      />

      {/* MODAL 3: Export Artwork */}
      {currentProject && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          project={currentProject}
          onExportImageDataUrl={handleExportDataUrl}
          adsConfig={adminSettings.adsConfig}
        />
      )}

      {/* MODAL 4: Settings & Storage */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearStorage={() => {
          localStorage.removeItem('pixora_projects_v1');
          refreshProjectsList();
          if (view === 'editor') setView('home');
        }}
      />

      {/* MODAL 5: Owner Admin Authentication */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          refreshAdminSettings();
          setIsAdminPanelOpen(true);
        }}
      />

      {/* MODAL 6: Full Owner Admin Dashboard Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          refreshAdminSettings();
        }}
        onRefreshAppState={refreshAdminSettings}
      />

      {/* MODAL 7: Publish Design as Template (For Players & Owner) */}
      {(currentProject || projects.length > 0) && (
        <PublishTemplateModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          project={currentProject || projects[0]}
          allProjects={projects}
          onSuccess={() => {
            refreshAdminSettings();
          }}
        />
      )}
    </div>
  );
}
