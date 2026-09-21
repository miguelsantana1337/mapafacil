import { notFound } from "next/navigation";
import { SharedCanvas } from "@/components/editor/shared-canvas";
import { createClient } from "@/lib/supabase/server";
import type { CanvasEdge, CanvasNode, ProjectGraph } from "@/types/project";

export default async function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("id,name,project_type,viewport").eq("share_token", token).eq("is_public", true).maybeSingle();
  if (!project) notFound();
  const [{ data: nodes }, { data: edges }] = await Promise.all([supabase.from("project_nodes").select("*").eq("project_id", project.id), supabase.from("project_edges").select("*").eq("project_id", project.id)]);
  const graph: ProjectGraph = { format: "mapafacil", version: 1, project: { id: project.id, name: project.name, projectType: project.project_type, viewport: project.viewport as ProjectGraph["project"]["viewport"] }, nodes: (nodes ?? []).map((node) => ({ id: node.id, type: node.node_type, position: { x: node.position_x, y: node.position_y }, data: node.data, style: node.style, draggable: false } as CanvasNode)), edges: (edges ?? []).map((edge) => ({ id: edge.id, source: edge.source_node_id, target: edge.target_node_id, type: edge.edge_type, label: edge.label, data: edge.data, style: edge.style } as CanvasEdge)) };
  return <SharedCanvas graph={graph} />;
}
