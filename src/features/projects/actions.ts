"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { projectGraphSchema } from "@/features/editor/graph-schema";
import { getTemplate } from "@/features/editor/templates";
import { createClient } from "@/lib/supabase/server";
import type { ProjectGraph } from "@/types/project";

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "Novo projeto").trim().slice(0, 160) || "Novo projeto";
  const template = getTemplate(String(formData.get("template") ?? "funnel-blank"));
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: membership, error: membershipError } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", auth.user.id).order("created_at").limit(1).single();
  if (membershipError || !membership) throw new Error("Workspace pessoal não encontrado.");
  const { data: project, error } = await supabase.from("projects").insert({ workspace_id: membership.workspace_id, created_by: auth.user.id, name, project_type: template.projectType }).select("id").single();
  if (error || !project) throw new Error("Não foi possível criar o projeto.");
  const graph = template.build(project.id, name);
  if (graph.nodes.length) {
    const { error: nodesError } = await supabase.from("project_nodes").insert(graph.nodes.map((node) => ({ id: node.id, project_id: project.id, node_type: node.type, position_x: node.position.x, position_y: node.position.y, data: node.data, style: node.style ?? {}, z_index: node.zIndex ?? 0, locked: !node.draggable, created_by: auth.user!.id })));
    if (nodesError) throw new Error("Projeto criado, mas os blocos iniciais falharam.");
  }
  if (graph.edges.length) {
    const { error: edgesError } = await supabase.from("project_edges").insert(graph.edges.map((edge) => ({ id: edge.id, project_id: project.id, source_node_id: edge.source, target_node_id: edge.target, source_handle: edge.sourceHandle, target_handle: edge.targetHandle, edge_type: edge.type ?? "smoothstep", label: typeof edge.label === "string" ? edge.label : null, data: edge.data ?? {}, style: edge.style ?? {}, created_by: auth.user!.id })));
    if (edgesError) throw new Error("Projeto criado, mas as conexões iniciais falharam.");
  }
  redirect(`/app/projects/${project.id}`);
}

export async function saveProjectGraph(input: unknown): Promise<{ ok: boolean; message?: string }> {
  const result = projectGraphSchema.safeParse(input);
  if (!result.success) return { ok: false, message: "O desenho contém dados inválidos." };
  const graph = result.data as ProjectGraph;
  if (graph.project.id === "demo") return { ok: true };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Sua sessão expirou." };
  const { error: projectError } = await supabase.from("projects").update({ name: graph.project.name, viewport: graph.project.viewport }).eq("id", graph.project.id);
  if (projectError) return { ok: false, message: "Não foi possível atualizar o projeto." };
  const [{ data: oldNodes }, { data: oldEdges }] = await Promise.all([
    supabase.from("project_nodes").select("id").eq("project_id", graph.project.id),
    supabase.from("project_edges").select("id").eq("project_id", graph.project.id),
  ]);
  const nodeIds = new Set(graph.nodes.map((node) => node.id)); const edgeIds = new Set(graph.edges.map((edge) => edge.id));
  const deletedEdges = (oldEdges ?? []).filter((row) => !edgeIds.has(row.id)).map((row) => row.id);
  const deletedNodes = (oldNodes ?? []).filter((row) => !nodeIds.has(row.id)).map((row) => row.id);
  if (deletedEdges.length) await supabase.from("project_edges").delete().in("id", deletedEdges);
  if (deletedNodes.length) await supabase.from("project_nodes").delete().in("id", deletedNodes);
  if (graph.nodes.length) {
    const { error } = await supabase.from("project_nodes").upsert(graph.nodes.map((node) => ({ id: node.id, project_id: graph.project.id, node_type: node.type, position_x: node.position.x, position_y: node.position.y, width: node.width, height: node.height, data: node.data, style: node.style ?? {}, z_index: node.zIndex ?? 0, locked: !node.draggable, created_by: auth.user!.id })));
    if (error) return { ok: false, message: "Falha ao salvar os blocos." };
  }
  if (graph.edges.length) {
    const { error } = await supabase.from("project_edges").upsert(graph.edges.map((edge) => ({ id: edge.id, project_id: graph.project.id, source_node_id: edge.source, target_node_id: edge.target, source_handle: edge.sourceHandle, target_handle: edge.targetHandle, edge_type: edge.type ?? "smoothstep", label: typeof edge.label === "string" ? edge.label : null, data: edge.data ?? {}, style: edge.style ?? {}, created_by: auth.user!.id })));
    if (error) return { ok: false, message: "Falha ao salvar as conexões." };
  }
  revalidatePath("/app");
  return { ok: true };
}
