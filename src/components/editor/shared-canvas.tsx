"use client";

import "@xyflow/react/dist/style.css";
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, type NodeTypes } from "@xyflow/react";
import { JourneyNode } from "./journey-node";
import type { ProjectGraph } from "@/types/project";

const nodeTypes: NodeTypes = new Proxy({}, { get: () => JourneyNode }) as NodeTypes;

export function SharedCanvas({ graph }: { graph: ProjectGraph }) {
  return <main className="shared-shell"><header><div><span className="eyebrow">MAPA COMPARTILHADO</span><strong>{graph.project.name}</strong></div><span>Somente leitura</span></header><div className="shared-flow"><ReactFlow nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} fitView fitViewOptions={{ padding: .25, maxZoom: 1 }}><Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#c8d6e7" /><MiniMap pannable zoomable /><Controls showInteractive={false} /></ReactFlow></div></main>;
}
