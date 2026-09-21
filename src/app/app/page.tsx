import Image from "next/image";
import Link from "next/link";
import { FolderOpen, LayoutTemplate, Plus, Settings } from "lucide-react";
import { projectTemplates } from "@/features/editor/templates";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { ProjectDashboard, type ProjectSummary } from "@/components/dashboard/project-dashboard";
import { TemplateCardForm } from "@/components/dashboard/template-card-form";

export const metadata = { title: "Seus projetos" };
async function getProjects(): Promise<ProjectSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const [{ data }, { data: nodes }] = await Promise.all([
    supabase.from("projects").select("id,name,project_type,updated_at").eq("status", "active").order("updated_at", { ascending: false }),
    supabase.from("project_nodes").select("project_id"),
  ]);
  const counts = (nodes ?? []).reduce<Record<string, number>>((all, node) => ({ ...all, [node.project_id]: (all[node.project_id] ?? 0) + 1 }), {});
  return (data ?? []).map((project) => ({ ...project, node_count: counts[project.id] ?? 0 })) as ProjectSummary[];
}

export default async function DashboardPage() {
  const projects = await getProjects();
  return <main className="dashboard-shell"><aside className="dashboard-sidebar"><Image src="/assets/mapa-facil-horizontal.png" alt="Mapa Fácil" width={158} height={52} /><nav><Link className="active" href="/app"><FolderOpen size={18} />Projetos</Link><Link href="/app/templates"><LayoutTemplate size={18} />Modelos</Link></nav><Link className="settings-link" href="/app/settings"><Settings size={18} />Configurações</Link></aside><section className="dashboard-main"><header><div><span className="eyebrow">MEU WORKSPACE</span><h1>Onde suas ideias ganham forma.</h1></div><Link className="new-project" href="/app/new"><Plus size={17} />Novo projeto</Link></header>{projects.length ? <ProjectDashboard projects={projects} /> : <><section className="welcome-card"><div><span className="eyebrow">PRIMEIRO MAPA</span><h2>Desenhe a jornada antes de operá-la.</h2><p>Escolha uma base, mova cada etapa e adapte o caminho ao seu processo comercial. Você continua com liberdade total para editar.</p></div><Link className="new-project" href="/app/new">Criar do zero</Link></section><div className="dashboard-section-heading"><h2>Comece com uma estrutura</h2><Link href="/app/templates">Ver todos os modelos</Link></div><div className="template-grid">{projectTemplates.map((template) => <TemplateCardForm key={template.id} template={template} />)}</div></>}</section></main>;
}
