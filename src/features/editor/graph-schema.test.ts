import { describe, expect, it } from "vitest";
import { projectGraphSchema } from "./graph-schema";
import { getTemplate } from "./templates";

describe("projectGraphSchema", () => {
  it("aceita um template oficial", () => {
    const graph = getTemplate("consulting").build("project-1", "Consultoria");
    expect(projectGraphSchema.safeParse(graph).success).toBe(true);
  });

  it("rejeita conexão para bloco inexistente", () => {
    const graph = getTemplate("funnel-blank").build("project-1", "Funil");
    graph.edges.push({ id: "edge-1", source: graph.nodes[0].id, target: "missing" });
    expect(projectGraphSchema.safeParse(graph).success).toBe(false);
  });
});
