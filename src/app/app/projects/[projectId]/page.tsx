import { EditorCanvas } from "@/components/editor/editor-canvas";
import { getTemplate } from "@/features/editor/templates";
import { loadProjectGraph } from "@/features/projects/queries";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: Promise<{ template?: string }> }) {
  const { projectId } = await params; const query = await searchParams;
  if (projectId === "demo") { const template = getTemplate(query.template ?? "consulting"); return <EditorCanvas initialGraph={template.build(projectId, template.name)} />; }
  const graph = await loadProjectGraph(projectId);
  if (!graph) notFound();
  return <EditorCanvas initialGraph={graph} />;
}
