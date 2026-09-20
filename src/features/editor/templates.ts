import { type XYPosition } from "@xyflow/react";
import type { CanvasEdge, CanvasNode, ProjectGraph, ProjectType } from "@/types/project";
import { getNodeDefinition } from "./node-registry";

const id = () => crypto.randomUUID();

export function createCanvasNode(type: CanvasNode["type"], position: XYPosition, title?: string): CanvasNode {
  const definition = getNodeDefinition(type);
  return {
    id: id(),
    type,
    position,
    data: {
      title: title ?? definition.label,
      description: "",
      color: definition.color,
      icon: definition.type,
      fields: { ...definition.defaults },
    },
  };
}

function connect(source: CanvasNode, target: CanvasNode, label?: string): CanvasEdge {
  return {
    id: id(), source: source.id, target: target.id, label, type: "smoothstep",
    style: { stroke: "#7290b7", strokeWidth: 1.8 },
  };
}

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  build: (projectId: string, name: string) => ProjectGraph;
};

function graph(projectId: string, name: string, projectType: ProjectType, nodes: CanvasNode[], edges: CanvasEdge[] = []): ProjectGraph {
  return { format: "mapafacil", version: 1, project: { id: projectId, name, projectType, viewport: { x: 0, y: 0, zoom: 1 } }, nodes, edges };
}

const blank = (projectType: ProjectType) => (projectId: string, name: string) => {
  const node = createCanvasNode(projectType === "funnel" ? "custom" : "root", { x: 420, y: 260 }, projectType === "funnel" ? "Comece sua jornada" : "Ideia central");
  return graph(projectId, name, projectType, [node]);
};

const consulting = (projectId: string, name: string) => {
  const types: CanvasNode["type"][] = ["traffic", "landing_page", "whatsapp", "crm", "meeting", "proposal", "sale"];
  const labels = ["Meta Ads", "Landing page", "WhatsApp", "Qualificação", "Reunião", "Proposta", "Venda"];
  const nodes = types.map((type, index) => createCanvasNode(type, { x: 130 + index * 245, y: 280 }, labels[index]));
  return graph(projectId, name, "funnel", nodes, nodes.slice(1).map((node, index) => connect(nodes[index], node)));
};

const metaWhatsapp = (projectId: string, name: string) => {
  const traffic = createCanvasNode("traffic", { x: 180, y: 260 }, "Meta Ads");
  const whatsapp = createCanvasNode("whatsapp", { x: 500, y: 260 }, "Atendimento no WhatsApp");
  const sale = createCanvasNode("sale", { x: 820, y: 260 }, "Venda");
  return graph(projectId, name, "funnel", [traffic, whatsapp, sale], [connect(traffic, whatsapp, "Clicou"), connect(whatsapp, sale, "Comprou")]);
};

export const projectTemplates: ProjectTemplate[] = [
  { id: "mindmap-blank", name: "Mapa em branco", description: "Comece somente com uma ideia central.", projectType: "mindmap", build: blank("mindmap") },
  { id: "funnel-blank", name: "Funil em branco", description: "Canvas livre para desenhar qualquer jornada.", projectType: "funnel", build: blank("funnel") },
  { id: "meta-whatsapp", name: "Meta Ads → WhatsApp", description: "Aquisição, conversa e venda.", projectType: "funnel", build: metaWhatsapp },
  { id: "consulting", name: "Funil de consultoria", description: "Da campanha à proposta e venda.", projectType: "funnel", build: consulting },
];

export function getTemplate(id: string) {
  return projectTemplates.find((template) => template.id === id) ?? projectTemplates[0];
}
