import { Waypoints } from "lucide-react";
import { createProject } from "@/features/projects/actions";
import type { ProjectTemplate } from "@/features/editor/templates";

export function TemplateCardForm({ template }: { template: ProjectTemplate }) {
  return <form action={createProject} className="template-card template-create-card">
    <input type="hidden" name="template" value={template.id} />
    <input type="hidden" name="name" value={template.name} />
    <button type="submit" aria-label={`Criar projeto com o modelo ${template.name}`}>
      <div className={`template-art template-art--${template.projectType}`}><Waypoints size={32} /><small>{template.nodeCount} blocos</small></div>
      <strong>{template.name}</strong><span>{template.description}</span><small>Usar este modelo</small>
    </button>
  </form>;
}
