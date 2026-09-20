import Image from "next/image";
import Link from "next/link";
import { FolderOpen, LayoutTemplate, Plus, Search, Settings, Waypoints } from "lucide-react";
import { projectTemplates } from "@/features/editor/templates";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Seus projetos" };
type ProjectSummary = { id: string; name: string; project_type: "mindmap" | "funnel"; updated_at: string };

async function getProjects(): Promise<ProjectSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id,name,project_type,updated_at").eq("status", "active").order("updated_at", { ascending: false });
  return (data ?? []) as ProjectSummary[];
}

export default async function DashboardPage() {
  const projects = await getProjects();
  return <main className="dashboard-shell"><aside className="dashboard-sidebar"><Image src="/assets/mapa-facil-horizontal.png" alt="Mapa Fácil" width={158} height={52} /><nav><Link className="active" href="/app"><FolderOpen size={18} />Projetos</Link><Link href="/app/templates"><LayoutTemplate size={18} />Modelos</Link></nav><Link className="settings-link" href="/app/settings"><Settings size={18} />Configurações</Link></aside><section className="dashboard-main"><header><div><span className="eyebrow">MEU WORKSPACE</span><h1>Onde suas ideias ganham forma.</h1></div><Link className="new-project" href="/app/new"><Plus size={17} />Novo projeto</Link></header><label className="dashboard-search"><Search size={17} /><input placeholder="Buscar projetos e ideias" /></label>{projects.length ? <><div className="dashboard-section-heading"><h2>Projetos recentes</h2></div><div className="template-grid">{projects.map((project) => <Link key={project.id} href={`/app/projects/${project.id}`} className="template-card"><div className={`template-art template-art--${project.project_type}`}><Waypoints size={32} /></div><strong>{project.name}</strong><span>Atualizado em {new Intl.DateTimeFormat("pt-BR").format(new Date(project.updated_at))}</span><small>{project.project_type === "funnel" ? "Funil visual" : "Mapa mental"}</small></Link>)}</div></> : <><div className="dashboard-section-heading"><h2>Comece com uma estrutura</h2><Link href="/app/templates">Ver todos os modelos</Link></div><div className="template-grid">{projectTemplates.map((template) => <Link key={template.id} href={`/app/projects/demo?template=${template.id}`} className="template-card"><div className={`template-art template-art--${template.projectType}`}><Waypoints size={32} /></div><strong>{template.name}</strong><span>{template.description}</span><small>{template.projectType === "funnel" ? "Funil visual" : "Mapa mental"}</small></Link>)}</div></>}</section></main>;
}
