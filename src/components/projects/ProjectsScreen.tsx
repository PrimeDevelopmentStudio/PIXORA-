import React, { useState } from 'react';
import { Project } from '../../types/editor';
import { duplicateProject, deleteProject, exportProjectJson, importProjectJson } from '../../services/storage';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Calendar, 
  Edit3, 
  Sparkles,
  ArrowRight,
  Maximize2,
  Share2
} from 'lucide-react';

interface ProjectsScreenProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onNewDesign: () => void;
  onRefreshProjects: () => void;
  onPublishTemplate?: (project: Project) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  onOpenProject,
  onNewDesign,
  onRefreshProjects,
  onPublishTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateProject(id);
    onRefreshProjects();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(id);
    setDeleteConfirmId(null);
    onRefreshProjects();
  };

  const handleExportJson = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    exportProjectJson(project);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProjectJson(file);
      onRefreshProjects();
      onOpenProject(imported);
    } catch (err: any) {
      alert(`Import failed: ${err?.message || 'Invalid Pixora file'}`);
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-violet-400" />
            My Designs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            All your editable graphic design projects stored securely in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Import JSON file */}
          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <Upload className="w-4 h-4 text-violet-400" />
            <span>Import Project</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Create Design CTA */}
          <button
            onClick={onNewDesign}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Design</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by project name..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-violet-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            {searchQuery ? `No designs matching "${searchQuery}"` : 'No designs yet'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Start from scratch or pick a template from our design library to begin creating!
          </p>
          <button
            onClick={onNewDesign}
            className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl"
          >
            Create Your First Design
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProjects.map((project) => {
            const isEditing = editingTitleId === project.id;
            const isDeleting = deleteConfirmId === project.id;

            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project)}
                className="group flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/80 overflow-hidden shadow-lg hover:shadow-violet-900/20 transition-all cursor-pointer"
              >
                {/* Visual Artboard Preview Canvas */}
                <div
                  className="relative w-full h-48 bg-[#090d16] flex items-center justify-center p-3 overflow-hidden border-b border-slate-800/80"
                >
                  <div
                    className="relative rounded shadow overflow-hidden group-hover:scale-105 transition-transform"
                    style={{
                      width: project.width > project.height ? '85%' : '60%',
                      aspectRatio: `${project.width} / ${project.height}`,
                      backgroundColor: project.isTransparent ? '#1e293b' : project.backgroundColor,
                    }}
                  >
                    {project.elements.slice(0, 4).map((el, idx) => {
                      const relX = (el.x / project.width) * 100;
                      const relY = (el.y / project.height) * 100;
                      const relW = (el.width / project.width) * 100;
                      const relH = (el.height / project.height) * 100;

                      if (el.type === 'text') {
                        return (
                          <div
                            key={idx}
                            className="absolute font-bold overflow-hidden text-ellipsis whitespace-nowrap"
                            style={{
                              left: `${relX}%`,
                              top: `${relY}%`,
                              width: `${relW}%`,
                              color: (el as any).fill,
                              fontSize: '5px',
                            }}
                          >
                            {(el as any).text}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={idx}
                          className="absolute rounded-sm"
                          style={{
                            left: `${relX}%`,
                            top: `${relY}%`,
                            width: `${relW}%`,
                            height: `${relH}%`,
                            backgroundColor: (el as any).fill,
                            opacity: el.opacity ?? 1,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-violet-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5">
                      Open Design
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="p-4 flex flex-col justify-between flex-1 bg-slate-900">
                  <div>
                    {isEditing ? (
                      <div
                        className="flex items-center gap-1.5 mb-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          autoFocus
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              // Save inline
                              project.title = newTitle.trim() || project.title;
                              setEditingTitleId(null);
                              onRefreshProjects();
                            }
                          }}
                          className="px-2 py-1 bg-slate-800 border border-violet-500 rounded text-xs text-white w-full"
                        />
                        <button
                          onClick={() => {
                            project.title = newTitle.trim() || project.title;
                            setEditingTitleId(null);
                            onRefreshProjects();
                          }}
                          className="px-2 py-1 bg-violet-600 text-white text-xs font-bold rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
                          {project.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(project.id);
                            setNewTitle(project.title);
                          }}
                          className="text-slate-500 hover:text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                      <span className="font-mono">{project.width}×{project.height} px</span>
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Bottom Row Actions */}
                  <div
                    className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-slate-500">
                      {project.elements.length} {project.elements.length === 1 ? 'layer' : 'layers'}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Share / Publish as Template */}
                      {onPublishTemplate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublishTemplate(project);
                          }}
                          className="p-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 rounded"
                          title="Publish as Community Template"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Duplicate */}
                      <button
                        onClick={(e) => handleDuplicate(project.id, e)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                        title="Duplicate project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Export JSON */}
                      <button
                        onClick={(e) => handleExportJson(project, e)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                        title="Download JSON backup"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      {!isDeleting ? (
                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded"
                          title="Delete design"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(project.id, e)}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded"
                          >
                            Delete?
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] text-slate-400 hover:text-white px-1"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
