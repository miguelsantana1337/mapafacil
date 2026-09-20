"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange, type Viewport } from "@xyflow/react";
import { create } from "zustand";
import type { CanvasEdge, CanvasNode, ProjectGraph, ProjectType } from "@/types/project";
import { createCanvasNode } from "@/features/editor/templates";

type Snapshot = { nodes: CanvasNode[]; edges: CanvasEdge[] };
type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";
type EditorState = {
  projectId: string;
  projectName: string;
  projectType: ProjectType;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedNodeId: string | null;
  history: Snapshot[];
  historyIndex: number;
  saveStatus: SaveStatus;
  hydrate: (graph: ProjectGraph) => void;
  setProjectName: (name: string) => void;
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: CanvasNode["type"], position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<CanvasNode["data"]>) => void;
  deleteSelected: () => void;
  selectNode: (id: string | null) => void;
  setViewport: (viewport: Viewport) => void;
  markSaving: () => void;
  markSaved: () => void;
  markError: () => void;
  undo: () => void;
  redo: () => void;
  exportGraph: () => ProjectGraph;
};

const initial: Omit<EditorState, "hydrate" | "setProjectName" | "onNodesChange" | "onEdgesChange" | "onConnect" | "addNode" | "updateNode" | "deleteSelected" | "selectNode" | "setViewport" | "markSaving" | "markSaved" | "markError" | "undo" | "redo" | "exportGraph"> = {
  projectId: "", projectName: "Projeto", projectType: "funnel", nodes: [], edges: [],
  viewport: { x: 0, y: 0, zoom: 1 }, selectedNodeId: null, history: [], historyIndex: -1, saveStatus: "idle",
};

function checkpoint(state: EditorState, nodes: CanvasNode[], edges: CanvasEdge[]) {
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
  if (history.length > 50) history.shift();
  return { history, historyIndex: history.length - 1, saveStatus: "dirty" as const };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initial,
  hydrate: (graph) => set({ projectId: graph.project.id, projectName: graph.project.name, projectType: graph.project.projectType, nodes: graph.nodes, edges: graph.edges, viewport: graph.project.viewport, history: [{ nodes: structuredClone(graph.nodes), edges: structuredClone(graph.edges) }], historyIndex: 0, saveStatus: "idle" }),
  setProjectName: (projectName) => set({ projectName, saveStatus: "dirty" }),
  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes), saveStatus: changes.some((change) => change.type !== "select") ? "dirty" : state.saveStatus })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges), saveStatus: changes.some((change) => change.type !== "select") ? "dirty" : state.saveStatus })),
  onConnect: (connection) => set((state) => { const edges = addEdge({ ...connection, id: crypto.randomUUID(), type: "smoothstep" }, state.edges); return { edges, ...checkpoint(state, state.nodes, edges) }; }),
  addNode: (type, position) => set((state) => { const nodes = [...state.nodes, createCanvasNode(type, position)]; return { nodes, selectedNodeId: nodes.at(-1)!.id, ...checkpoint(state, nodes, state.edges) }; }),
  updateNode: (id, data) => set((state) => { const nodes = state.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node); return { nodes, ...checkpoint(state, nodes, state.edges) }; }),
  deleteSelected: () => set((state) => { if (!state.selectedNodeId) return state; const nodes = state.nodes.filter((node) => node.id !== state.selectedNodeId); const edges = state.edges.filter((edge) => edge.source !== state.selectedNodeId && edge.target !== state.selectedNodeId); return { nodes, edges, selectedNodeId: null, ...checkpoint(state, nodes, edges) }; }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  setViewport: (viewport) => set({ viewport, saveStatus: "dirty" }),
  markSaving: () => set({ saveStatus: "saving" }), markSaved: () => set({ saveStatus: "saved" }), markError: () => set({ saveStatus: "error" }),
  undo: () => set((state) => { const index = Math.max(0, state.historyIndex - 1); const snap = state.history[index]; return snap ? { nodes: structuredClone(snap.nodes), edges: structuredClone(snap.edges), historyIndex: index, saveStatus: "dirty" } : state; }),
  redo: () => set((state) => { const index = Math.min(state.history.length - 1, state.historyIndex + 1); const snap = state.history[index]; return snap ? { nodes: structuredClone(snap.nodes), edges: structuredClone(snap.edges), historyIndex: index, saveStatus: "dirty" } : state; }),
  exportGraph: () => { const state = get(); return { format: "mapafacil", version: 1, project: { id: state.projectId, name: state.projectName, projectType: state.projectType, viewport: state.viewport }, nodes: state.nodes, edges: state.edges }; },
}));
