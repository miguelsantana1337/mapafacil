import { createClient } from "@/lib/supabase/server";
import type { CanvasEdge, CanvasNode, ProjectGraph } from "@/types/project";

export async function loadProjectGraph(projectId: string): Promise<ProjectGraph | null> {
  const supabase = await createClient();
  const [{ data: project }, { data: nodes }, { data: edges }] = await Promise.all([
    supabase.from("projects").select("id,name,project_type,viewport").eq("id", projectId).maybeSingle(),
    supabase.from("project_nodes").select("*").eq("project_id", projectId),
    supabase.from("project_edges").select("*").eq("project_id", projectId),
  ]);
  if (!project) return null;
  return {
    format: "mapafacil", version: 1,
    project: { id: project.id, name: project.name, projectType: project.project_type, viewport: project.viewport as ProjectGraph["project"]["viewport"] },
    nodes: (nodes ?? []).map((node) => ({ id: node.id, type: node.node_type, position: { x: node.position_x, y: node.position_y }, width: node.width ?? undefined, height: node.height ?? undefined, data: node.data, style: node.style, zIndex: node.z_index, draggable: !node.locked } as CanvasNode)),
    edges: (edges ?? []).map((edge) => ({ id: edge.id, source: edge.source_node_id, target: edge.target_node_id, sourceHandle: edge.source_handle, targetHandle: edge.target_handle, type: edge.edge_type, label: edge.label, data: edge.data, style: edge.style } as CanvasEdge)),
  };
}
