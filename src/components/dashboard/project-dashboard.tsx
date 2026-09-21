"use client";

import Link from "next/link";
import { Archive, Copy, MoreHorizontal, Search, Trash2, Waypoints } from "lucide-react";
import { useMemo, useState } from "react";
import { archiveProject, deleteProject, duplicateProject } from "@/features/projects/actions";

export type ProjectSummary = {
  id: string;
  name: string;
  project_type: "mindmap" | "funnel";
  updated_at: string;
  node_count: number;
};

export function ProjectDashboard({ projects }: { projects: ProjectSummary[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => projects.filter((project) => project.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))), [projects, query]);

  return (
    <>
      <label className="dashboard-search"><Search size={17} /><span className="sr-only">Buscar projetos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar projetos e ideias" /></label>
      <div className="dashboard-section-heading"><h2>Projetos recentes</h2><span>{filtered.length} {filtered.length === 1 ? "projeto" : "projetos"}</span></div>
      {filtered.length ? <div className="template-grid">{filtered.map((project) => (
        <article className="template-card project-card" key={project.id}>
          <Link href={`/app/projects/${project.id}`} className="project-card__link">
            <div className={`template-art template-art--${project.project_type}`}><Waypoints size={32} /><small>{project.node_count} blocos</small></div>
            <strong>{project.name}</strong>
            <span>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(project.updated_at))}</span>
            <small>{project.project_type === "funnel" ? "Funil visual" : "Mapa mental"}</small>
          </Link>
          <details className="project-menu"><summary aria-label={`Ações de ${project.name}`}><MoreHorizontal size={18} /></summary><div>
            <form action={duplicateProject}><input type="hidden" name="projectId" value={project.id} /><button><Copy size={15} />Duplicar</button></form>
            <form action={archiveProject}><input type="hidden" name="projectId" value={project.id} /><button><Archive size={15} />Arquivar</button></form>
            <form action={deleteProject} onSubmit={(event) => { if (!confirm(`Excluir “${project.name}” permanentemente?`)) event.preventDefault(); }}><input type="hidden" name="projectId" value={project.id} /><button className="danger"><Trash2 size={15} />Excluir</button></form>
          </div></details>
        </article>
      ))}</div> : <div className="dashboard-empty"><Waypoints size={32} /><strong>Nenhum projeto encontrado</strong><span>{query ? "Tente buscar por outro nome." : "Crie seu primeiro mapa para começar."}</span></div>}
    </>
  );
}
