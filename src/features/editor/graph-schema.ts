import { z } from "zod";

const positionSchema = z.object({ x: z.number(), y: z.number() });
const viewportSchema = z.object({ x: z.number(), y: z.number(), zoom: z.number().positive().max(4) });
const nodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: positionSchema,
  data: z.object({ title: z.string().min(1).max(240) }).passthrough(),
}).passthrough();
const edgeSchema = z.object({
  id: z.string().min(1), source: z.string().min(1), target: z.string().min(1),
}).passthrough();

export const projectGraphSchema = z.object({
  format: z.literal("mapafacil"),
  version: z.literal(1),
  project: z.object({
    id: z.string().min(1), name: z.string().min(1).max(160),
    projectType: z.enum(["mindmap", "funnel"]), viewport: viewportSchema,
  }),
  nodes: z.array(nodeSchema).max(2000),
  edges: z.array(edgeSchema).max(4000),
}).superRefine((graph, context) => {
  const ids = new Set(graph.nodes.map((node) => node.id));
  graph.edges.forEach((edge, index) => {
    if (!ids.has(edge.source) || !ids.has(edge.target)) {
      context.addIssue({ code: "custom", path: ["edges", index], message: "A conexão referencia um bloco inexistente." });
    }
  });
});
