"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { projectGraphSchema } from "@/features/editor/graph-schema";
import { getTemplate } from "@/features/editor/templates";
import { createClient } from "@/lib/supabase/server";
import type { ProjectGraph } from "@/types/project";

async function getAuthContext() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: membership } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", auth.user.id).order("created_at").limit(1).single();
  if (!membership) throw new Error("Workspace pessoal não encontrado.");
  return { supabase, user: auth.user, workspaceId: membership.workspace_id };
}

async function insertGraph(graph: ProjectGraph, userId: string) {
  const supabase = await createClient();
  if (graph.nodes.length) {
    const { error } = await supabase.from("project_nodes").insert(graph.nodes.map((node) => ({ id: node.id, project_id: graph.project.id, node_type: node.type, position_x: node.position.x, position_y: node.position.y, data: node.data, style: node.style ?? {}, z_index: node.zIndex ?? 0, locked: !node.draggable, created_by: userId })));
    if (error) throw new Error("Não foi possível criar os blocos iniciais.");
  }
  if (graph.edges.length) {
    const { error } = await supabase.from("project_edges").insert(graph.edges.map((edge) => ({ id: edge.id, project_id: graph.project.id, source_node_id: edge.source, target_node_id: edge.target, source_handle: edge.sourceHandle, target_handle: edge.targetHandle, edge_type: edge.type ?? "smoothstep", label: typeof edge.label === "string" ? edge.label : null, data: edge.data ?? {}, style: edge.style ?? {}, created_by: userId })));
    if (error) throw new Error("Não foi possível criar as conexões iniciais.");
  }
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "Novo projeto").trim().slice(0, 160) || "Novo projeto";
  const template = getTemplate(String(formData.get("template") ?? "funnel-blank"));
  const { supabase, user, workspaceId } = await getAuthContext();
  const { data: project, error } = await supabase.from("projects").insert({ workspace_id: workspaceId, created_by: user.id, name, project_type: template.projectType }).select("id").single();
  if (error || !project) redirect(`/app/new?erro=${encodeURIComponent("Não foi possível criar o projeto. Tente novamente.")}`);
  const graph = template.build(project.id, name);
  try {
    await insertGraph(graph, user.id);
  } catch (error) {
    await supabase.from("projects").delete().eq("id", project.id);
    console.error("Falha ao criar estrutura inicial do projeto", error);
    redirect(`/app/new?erro=${encodeURIComponent("O projeto não pôde ser concluído. Tente novamente.")}`);
  }
  revalidatePath("/app");
  redirect(`/app/projects/${project.id}`);
}

export async function archiveProject(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const { supabase } = await getAuthContext();
  await supabase.from("projects").update({ status: "archived" }).eq("id", projectId);
  revalidatePath("/app");
}

export async function deleteProject(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const { supabase } = await getAuthContext();
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/app");
}

export async function duplicateProject(formData: FormData) {
  const sourceId = String(formData.get("projectId") ?? "");
  const { supabase, user, workspaceId } = await getAuthContext();
  const { data: source } = await supabase.from("projects").select("name,project_type,viewport").eq("id", sourceId).single();
  if (!source) throw new Error("Projeto original não encontrado.");
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    supabase.from("project_nodes").select("*").eq("project_id", sourceId),
    supabase.from("project_edges").select("*").eq("project_id", sourceId),
  ]);
  const { data: copy } = await supabase.from("projects").insert({ workspace_id: workspaceId, created_by: user.id, name: `${source.name} — cópia`, project_type: source.project_type, viewport: source.viewport }).select("id").single();
  if (!copy) throw new Error("Não foi possível duplicar o projeto.");
  const idMap = new Map((nodes ?? []).map((node) => [node.id, crypto.randomUUID()]));
  const graph: ProjectGraph = {
    format: "mapafacil", version: 1,
    project: { id: copy.id, name: `${source.name} — cópia`, projectType: source.project_type, viewport: source.viewport as ProjectGraph["project"]["viewport"] },
    nodes: (nodes ?? []).map((node) => ({ id: idMap.get(node.id)!, type: node.node_type, position: { x: node.position_x, y: node.position_y }, data: node.data, style: node.style, draggable: !node.locked })),
    edges: (edges ?? []).map((edge) => ({ id: crypto.randomUUID(), source: idMap.get(edge.source_node_id)!, target: idMap.get(edge.target_node_id)!, sourceHandle: edge.source_handle, targetHandle: edge.target_handle, type: edge.edge_type, label: edge.label, data: edge.data, style: edge.style })),
  };
  await insertGraph(graph, user.id);
  revalidatePath("/app");
}

export async function saveProjectVersion(input: unknown): Promise<{ ok: boolean; version?: number; message?: string }> {
  const parsed = projectGraphSchema.safeParse(input);
  if (!parsed.success || parsed.data.project.id === "demo") return { ok: false, message: "Este projeto não pode ser versionado." };
  const { supabase, user } = await getAuthContext();
  const { data: latest } = await supabase.from("project_versions").select("version_number").eq("project_id", parsed.data.project.id).order("version_number", { ascending: false }).limit(1).maybeSingle();
  const version = (latest?.version_number ?? 0) + 1;
  const { error } = await supabase.from("project_versions").insert({ project_id: parsed.data.project.id, version_number: version, snapshot: parsed.data, created_by: user.id, reason: "Versão manual" });
  return error ? { ok: false, message: "Não foi possível salvar a versão." } : { ok: true, version };
}

export async function enableProjectSharing(projectId: string): Promise<{ ok: boolean; token?: string; message?: string }> {
  const { supabase } = await getAuthContext();
  const { data, error } = await supabase.from("projects").update({ is_public: true }).eq("id", projectId).select("share_token").single();
  return error || !data ? { ok: false, message: "Não foi possível criar o link." } : { ok: true, token: data.share_token };
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
