import type { ProjectState } from "./state";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  engine?: string;
  defaults: Record<string, unknown>;
}

export interface ProjectRecord {
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  state: ProjectState;
}

export class ProjectManager {
  private projects = new Map<string, ProjectRecord>();
  private templates = new Map<string, ProjectTemplate>();

  registerTemplate(template: ProjectTemplate): void { this.templates.set(template.id, template); }

  createProject(input: { id: string; name: string; templateId: string }): ProjectRecord {
    const template = this.templates.get(input.templateId);
    if (!template) throw new Error("Unknown project template: " + input.templateId);
    const now = new Date().toISOString();
    const project: ProjectRecord = { id: input.id, name: input.name, templateId: template.id, createdAt: now, updatedAt: now, state: "draft" };
    this.projects.set(project.id, project);
    return project;
  }

  getProject(id: string): ProjectRecord | undefined { return this.projects.get(id); }
  listProjects(): ProjectRecord[] { return [...this.projects.values()]; }
}
