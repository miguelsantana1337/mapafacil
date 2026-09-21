"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange, type Viewport } from "@xyflow/react";
import { create } from "zustand";
import type { CanvasEdge, CanvasNode, ProjectGraph, ProjectType } from "@/types/project";
import { createCanvasNode } from "@/features/editor/templates";

type Snapshot = { nodes: CanvasNode[]; edges: CanvasEdge[] };
type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";
type EditorState = {
  projectId: string; projectName: string; projectType: ProjectType; nodes: CanvasNode[]; edges: CanvasEdge[]; viewport: Viewport;
  selectedNodeId: string | null; selectedEdgeId: string | null; history: Snapshot[]; historyIndex: number; clipboard: Snapshot | null;
  saveStatus: SaveStatus; lastSavedAt: string | null;
  hydrate: (graph: ProjectGraph) => void; importGraph: (graph: ProjectGraph) => void; setProjectName: (name: string) => void;
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void; onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void; onConnect: (connection: Connection) => void;
  addNode: (type: CanvasNode["type"], position: { x: number; y: number }) => void; updateNode: (id: string, data: Partial<CanvasNode["data"]>) => void; updateEdge: (id: string, patch: Partial<CanvasEdge>) => void;
  deleteSelected: () => void; duplicateSelected: () => void; copySelected: () => void; pasteClipboard: () => void; selectAll: () => void; alignSelected: (axis: "horizontal" | "vertical") => void;
  selectNode: (id: string | null) => void; selectEdge: (id: string | null) => void; setViewport: (viewport: Viewport) => void; commitSnapshot: () => void;
  markSaving: () => void; markSaved: () => void; markError: () => void; undo: () => void; redo: () => void; exportGraph: () => ProjectGraph;
};

const initial = { projectId: "", projectName: "Projeto", projectType: "funnel" as ProjectType, nodes: [] as CanvasNode[], edges: [] as CanvasEdge[], viewport: { x: 0, y: 0, zoom: 1 }, selectedNodeId: null, selectedEdgeId: null, history: [] as Snapshot[], historyIndex: -1, clipboard: null as Snapshot | null, saveStatus: "idle" as SaveStatus, lastSavedAt: null as string | null };

function checkpoint(state: EditorState, nodes: CanvasNode[], edges: CanvasEdge[]) {
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
  if (history.length > 50) history.shift();
  return { history, historyIndex: history.length - 1, saveStatus: "dirty" as const };
}
const chosenNodes = (state: EditorState) => state.nodes.filter((node) => node.selected || node.id === state.selectedNodeId);
const withoutSelection = <T extends { selected?: boolean }>(item: T): T => { const copy = { ...item }; delete copy.selected; return copy; };

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initial,
  hydrate: (graph) => set({ ...initial, projectId: graph.project.id, projectName: graph.project.name, projectType: graph.project.projectType, nodes: graph.nodes, edges: graph.edges, viewport: graph.project.viewport, history: [{ nodes: structuredClone(graph.nodes), edges: structuredClone(graph.edges) }], historyIndex: 0 }),
  importGraph: (graph) => set((state) => ({ projectName: graph.project.name, nodes: graph.nodes, edges: graph.edges, viewport: graph.project.viewport, selectedNodeId: null, selectedEdgeId: null, ...checkpoint(state, graph.nodes, graph.edges) })),
  setProjectName: (projectName) => set({ projectName, saveStatus: "dirty" }),
  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes), saveStatus: changes.some((change) => change.type !== "select") ? "dirty" : state.saveStatus })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges), saveStatus: changes.some((change) => change.type !== "select") ? "dirty" : state.saveStatus })),
  onConnect: (connection) => set((state) => { const edges = addEdge({ ...connection, id: crypto.randomUUID(), type: "smoothstep", style: { stroke: "#7290b7", strokeWidth: 2 } }, state.edges); return { edges, ...checkpoint(state, state.nodes, edges) }; }),
  addNode: (type, position) => set((state) => { const node = { ...createCanvasNode(type, position), selected: true }; const nodes = [...state.nodes.map((item) => ({ ...item, selected: false })), node]; return { nodes, selectedNodeId: node.id, selectedEdgeId: null, ...checkpoint(state, nodes, state.edges) }; }),
  updateNode: (id, data) => set((state) => { const nodes = state.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node); return { nodes, ...checkpoint(state, nodes, state.edges) }; }),
  updateEdge: (id, patch) => set((state) => { const edges = state.edges.map((edge) => edge.id === id ? { ...edge, ...patch } : edge); return { edges, ...checkpoint(state, state.nodes, edges) }; }),
  deleteSelected: () => set((state) => { const ids = new Set(chosenNodes(state).map((node) => node.id)); const nodes = state.nodes.filter((node) => !ids.has(node.id)); const edges = state.edges.filter((edge) => edge.id !== state.selectedEdgeId && !ids.has(edge.source) && !ids.has(edge.target)); if (nodes.length === state.nodes.length && edges.length === state.edges.length) return state; return { nodes, edges, selectedNodeId: null, selectedEdgeId: null, ...checkpoint(state, nodes, edges) }; }),
  copySelected: () => set((state) => { const selected = chosenNodes(state); const ids = new Set(selected.map((node) => node.id)); return { clipboard: { nodes: structuredClone(selected), edges: structuredClone(state.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))) } }; }),
  pasteClipboard: () => set((state) => { if (!state.clipboard?.nodes.length) return state; const ids = new Map(state.clipboard.nodes.map((node) => [node.id, crypto.randomUUID()])); const pasted = state.clipboard.nodes.map((node) => ({ ...structuredClone(node), id: ids.get(node.id)!, position: { x: node.position.x + 36, y: node.position.y + 36 }, selected: true })); const edges = [...state.edges, ...state.clipboard.edges.map((edge) => ({ ...structuredClone(edge), id: crypto.randomUUID(), source: ids.get(edge.source)!, target: ids.get(edge.target)! }))]; const nodes = [...state.nodes.map((node) => ({ ...node, selected: false })), ...pasted]; return { nodes, edges, selectedNodeId: pasted.at(-1)!.id, ...checkpoint(state, nodes, edges) }; }),
  duplicateSelected: () => { get().copySelected(); get().pasteClipboard(); },
  selectAll: () => set((state) => ({ nodes: state.nodes.map((node) => ({ ...node, selected: true })), selectedNodeId: state.nodes.at(-1)?.id ?? null })),
  alignSelected: (axis) => set((state) => { const selected = chosenNodes(state); if (selected.length < 2) return state; const key = axis === "horizontal" ? "y" : "x"; const value = selected.reduce((sum, node) => sum + node.position[key], 0) / selected.length; const ids = new Set(selected.map((node) => node.id)); const nodes = state.nodes.map((node) => ids.has(node.id) ? { ...node, position: { ...node.position, [key]: value } } : node); return { nodes, ...checkpoint(state, nodes, state.edges) }; }),
  selectNode: (selectedNodeId) => set({ selectedNodeId, selectedEdgeId: null }), selectEdge: (selectedEdgeId) => set({ selectedEdgeId, selectedNodeId: null }),
  setViewport: (viewport) => set({ viewport, saveStatus: "dirty" }), commitSnapshot: () => set((state) => checkpoint(state, state.nodes, state.edges)),
  markSaving: () => set({ saveStatus: "saving" }), markSaved: () => set({ saveStatus: "saved", lastSavedAt: new Date().toISOString() }), markError: () => set({ saveStatus: "error" }),
  undo: () => set((state) => { const index = Math.max(0, state.historyIndex - 1); const snap = state.history[index]; return snap ? { nodes: structuredClone(snap.nodes), edges: structuredClone(snap.edges), historyIndex: index, saveStatus: "dirty" } : state; }),
  redo: () => set((state) => { const index = Math.min(state.history.length - 1, state.historyIndex + 1); const snap = state.history[index]; return snap ? { nodes: structuredClone(snap.nodes), edges: structuredClone(snap.edges), historyIndex: index, saveStatus: "dirty" } : state; }),
  exportGraph: () => { const state = get(); return { format: "mapafacil", version: 1, project: { id: state.projectId, name: state.projectName, projectType: state.projectType, viewport: state.viewport }, nodes: state.nodes.map(withoutSelection), edges: state.edges.map(withoutSelection) }; },
}));
