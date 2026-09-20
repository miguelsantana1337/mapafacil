import type { Edge, Node, Viewport } from "@xyflow/react";

export type ProjectType = "mindmap" | "funnel";
export type ProjectStatus = "active" | "archived";

export const funnelNodeTypes = [
  "traffic", "creative", "landing_page", "sales_page", "form", "checkout",
  "whatsapp", "email", "crm", "meeting", "proposal", "sale", "upsell",
  "downsell", "remarketing", "delay", "condition", "note", "text", "custom",
] as const;

export const mindMapNodeTypes = [
  "root", "topic", "subtopic", "idea", "note", "task", "decision", "text",
] as const;

export type FunnelNodeType = (typeof funnelNodeTypes)[number];
export type MindMapNodeType = (typeof mindMapNodeTypes)[number];
export type ProjectNodeType = FunnelNodeType | MindMapNodeType;

export type NodeFieldValue = string | number | boolean | null;
export type MapaFacilNodeData = Record<string, unknown> & {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  fields?: Record<string, NodeFieldValue>;
};

export type CanvasNode = Node<MapaFacilNodeData, ProjectNodeType>;
export type CanvasEdge = Edge<Record<string, unknown>>;

export type ProjectGraph = {
  format: "mapafacil";
  version: 1;
  project: {
    id: string;
    name: string;
    projectType: ProjectType;
    viewport: Viewport;
  };
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};
