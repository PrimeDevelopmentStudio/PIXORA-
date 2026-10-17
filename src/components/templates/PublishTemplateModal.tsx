import React, { useState } from 'react';
import { Project, Template, TemplateCategory } from '../../types/editor';
import { addCommunityTemplate, addCustomSystemTemplate, isAdminLoggedIn } from '../../services/adminService';
import { X, Sparkles, Share2, Globe, ShieldCheck, Check } from 'lucide-react';

interface PublishTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  allProjects?: Project[];
  onSuccess: () => void;
}

export const PublishTemplateModal: React.FC<PublishTemplateModalProps> = ({
  isOpen,
  onClose,
  project,
  allProjects = [],
  onSuccess,
}) => {
  const isAdmin = isAdminLoggedIn();
  const [activeProject, setActiveProject] = useState<Project>(project);
  const [title, setTitle] = useState(project.title || 'My Custom Template');
  const [authorName, setAuthorName] = useState(isAdmin ? 'Pixora Official' : 'Community Creator');
  const [category, setCategory] = useState<TemplateCategory>('social');
  const [tagsInput, setTagsInput] = useState('modern, creative, design');
  const [description, setDescription] = useState('An editable custom template created with Pixora.');
  const [publishAsOfficial, setPublishAsOfficial] = useState(isAdmin);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Synchronize when project prop changes
  React.useEffect(() => {
    setActiveProject(project);
    setTitle(project.title || 'My Custom Template');
  }, [project]);

  if (!isOpen) return null;

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'social', label: 'Social Media (Post / Story)' },
    { id: 'youtube', label: 'YouTube Thumbnails' },
    { id: 'posters', label: 'Posters & Flyers' },
    { id: 'invitations', label: 'Invitations & Cards' },
    { id: 'presentations', label: 'Presentations & Slides' },
    { id: 'logos', label: 'Logos & Branding' },
    { id: 'business', label: 'Business & Marketing' },
    { id: 'photo', label: 'Photo Designs' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newTemplate: Template = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim() || 'Untitled Template',
      category,
      categoryLabel: categories.find((c) => c.id === category)?.label.split(' ')[0] || 'Design',
      width: activeProject.width,
      height: activeProject.height,
      backgroundColor: activeProject.backgroundColor,
      isTransparent: activeProject.isTransparent,
      elements: JSON.parse(JSON.stringify(activeProject.elements)),
      tags: tags.length > 0 ? tags : ['custom', 'design'],
      description: description.trim(),
      authorName: authorName.trim() || 'Anonymous Designer',
      isCommunity: !publishAsOfficial,
      createdAt: Date.now(),
    };

    setTimeout(() => {
      if (publishAsOfficial && isAdmin) {
        addCustomSystemTemplate(newTemplate);
        setSuccessNotice('Official System Template published successfully!');
      } else {
        addCommunityTemplate(newTemplate);
        setSuccessNotice('Published to Community Templates! Players can now use this design.');
      }
      setIsPublishing(false);
      onSuccess();
      setTimeout(() => {
        onClose();
        setSuccessNotice(null);
      }, 1500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#131b2e] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-[#0f172a]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Publish as Template
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successNotice ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successNotice}</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-300">
                Turn your design into an editable template that anyone can load and customize.
              </p>

              {allProjects.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Design to Publish
                  </label>
                  <select
                    value={activeProject.id}
                    onChange={(e) => {
                      const found = allProjects.find((p) => p.id === e.target.value);
                      if (found) {
                        setActiveProject(found);
                        setTitle(found.title || 'My Custom Template');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.width}×{p.height} px, {p.elements.length} layers)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Gaming Thumbnail"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Creator / Author Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your name or handle"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="gaming, banner, neon, youtube"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this template is best for..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Admin official override option */}
              {isAdmin && (
                <label className="flex items-center gap-2 p-3 rounded-xl bg-violet-950/40 border border-violet-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishAsOfficial}
                    onChange={(e) => setPublishAsOfficial(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700"
                  />
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-violet-200">
                      Publish directly as Official System Template
                    </span>
                  </div>
                </label>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>{isPublishing ? 'Publishing...' : 'Publish Template'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
