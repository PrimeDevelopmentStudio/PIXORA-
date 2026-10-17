import { CanvasElement, Project, Template } from '../types/editor';
import { TEMPLATES } from '../constants/templates';

const STORAGE_KEY = 'pixora_projects_v1';

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with starter project
      const initial = seedInitialProjects();
      saveProjects(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = seedInitialProjects();
      saveProjects(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load projects from localStorage', err);
    return seedInitialProjects();
  }
}

function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage (quota or disabled)', err);
  }
}

export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  const updated = {
    ...project,
    updatedAt: Date.now(),
  };

  if (index >= 0) {
    projects[index] = updated;
  } else {
    projects.unshift(updated);
  }

  saveProjects(projects);
}

export function createProject(
  title: string,
  width: number,
  height: number,
  backgroundColor = '#ffffff',
  elements: CanvasElement[] = [],
  isTransparent = false
): Project {
  const newProject: Project = {
    id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim() || 'Untitled Design',
    width: Math.max(100, Math.min(width, 4000)),
    height: Math.max(100, Math.min(height, 4000)),
    backgroundColor,
    isTransparent,
    elements,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const projects = getProjects();
  projects.unshift(newProject);
  saveProjects(projects);
  return newProject;
}

export function createProjectFromTemplate(template: Template): Project {
  // Deep clone elements to give fresh IDs
  const clonedElements: CanvasElement[] = template.elements.map((el, i) => ({
    ...JSON.parse(JSON.stringify(el)),
    id: `el_${Date.now()}_${i}`,
  }));

  return createProject(
    `${template.title} Copy`,
    template.width,
    template.height,
    template.backgroundColor,
    clonedElements,
    template.isTransparent ?? false
  );
}

export function duplicateProject(id: string): Project | null {
  const project = getProject(id);
  if (!project) return null;

  const clonedElements: CanvasElement[] = project.elements.map((el, i) => ({
    ...JSON.parse(JSON.stringify(el)),
    id: `el_${Date.now()}_${i}`,
  }));

  return createProject(
    `${project.title} (Copy)`,
    project.width,
    project.height,
    project.backgroundColor,
    clonedElements,
    project.isTransparent ?? false
  );
}

export function deleteProject(id: string): void {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  saveProjects(filtered);
}

export function exportProjectJson(project: Project): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.title.toLowerCase().replace(/\s+/g, '-')}-pixora.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function importProjectJson(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.width || !parsed.height || !Array.isArray(parsed.elements)) {
          throw new Error('Invalid Pixora project JSON schema');
        }
        const importedProject: Project = {
          ...parsed,
          id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: parsed.title ? `${parsed.title} (Imported)` : 'Imported Design',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        saveProject(importedProject);
        resolve(importedProject);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function seedInitialProjects(): Project[] {
  // Use 2 starter templates as pre-seeded editable user projects
  const starter1 = TEMPLATES[0]; // Flash sale
  const starter2 = TEMPLATES[2]; // YouTube Coding

  return [
    {
      id: 'demo-starter-1',
      title: 'Neon Flash Sale (Demo Project)',
      width: starter1.width,
      height: starter1.height,
      backgroundColor: starter1.backgroundColor,
      elements: JSON.parse(JSON.stringify(starter1.elements)),
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'demo-starter-2',
      title: 'Code Master YouTube Thumbnail',
      width: starter2.width,
      height: starter2.height,
      backgroundColor: starter2.backgroundColor,
      elements: JSON.parse(JSON.stringify(starter2.elements)),
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
  ];
}
