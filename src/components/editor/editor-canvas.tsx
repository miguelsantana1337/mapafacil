"use client";

import "@xyflow/react/dist/style.css";
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type NodeTypes } from "@xyflow/react";
import { ArrowLeft, Download, Library, Redo2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { JourneyNode } from "./journey-node";
import { NodeLibrary } from "./node-library";
import { PropertiesPanel } from "./properties-panel";
import { useEditorStore } from "@/stores/editor-store";
import type { CanvasNode, ProjectGraph, ProjectNodeType } from "@/types/project";
import { saveProjectGraph } from "@/features/projects/actions";

const nodeTypes: NodeTypes = new Proxy({}, { get: () => JourneyNode }) as NodeTypes;

function Canvas({ initialGraph }: { initialGraph: ProjectGraph }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const flow = useReactFlow<CanvasNode>();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const store = useEditorStore();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches("input,textarea,[contenteditable=true]")) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) store.redo(); else store.undo();
      }
      if (["Backspace", "Delete"].includes(event.key)) store.deleteSelected();
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  useEffect(() => {
    if (store.saveStatus !== "dirty" || store.projectId === "demo") return;
    const timer = window.setTimeout(async () => {
      store.markSaving();
      const result = await saveProjectGraph(store.exportGraph());
      if (result.ok) store.markSaved();
      else { store.markError(); toast.error(result.message ?? "Falha ao salvar"); }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [store]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/mapafacil-node") as ProjectNodeType;
    if (!type || !wrapper.current) return;
    store.addNode(type, flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }, [flow, store]);

  const exportJson = () => {
    const graph = store.exportGraph();
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${graph.project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mapafacil.json`; anchor.click(); URL.revokeObjectURL(url);
    toast.success("Projeto exportado");
  };

  const status = { idle: "Pronto", dirty: "Alterações locais", saving: "Salvando…", saved: "Salvo", error: "Falha ao salvar" }[store.saveStatus];

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <div className="editor-topbar__left"><Link href="/app" aria-label="Voltar ao dashboard"><ArrowLeft size={19} /></Link><span className="topbar-divider" /><input value={store.projectName} onChange={(event) => store.setProjectName(event.target.value)} aria-label="Nome do projeto" /></div>
        <div className="editor-topbar__center"><button onClick={store.undo} aria-label="Desfazer"><Undo2 size={17} /></button><button onClick={store.redo} aria-label="Refazer"><Redo2 size={17} /></button><span className={`save-pill save-pill--${store.saveStatus}`}>{status}</span></div>
        <div className="editor-topbar__right"><button onClick={() => setLibraryOpen((open) => !open)} className="mobile-library"><Library size={16} />Blocos</button><button onClick={exportJson}><Download size={16} />Exportar</button></div>
      </header>
      <div className="editor-workspace">
        <div className={libraryOpen ? "library-wrap is-open" : "library-wrap"}><NodeLibrary onClose={() => setLibraryOpen(false)} /></div>
        <div ref={wrapper} className="flow-wrap" onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}>
          <ReactFlow nodes={store.nodes} edges={store.edges} nodeTypes={nodeTypes} onNodesChange={store.onNodesChange} onEdgesChange={store.onEdgesChange} onConnect={store.onConnect} onNodeClick={(_, node) => store.selectNode(node.id)} onPaneClick={() => store.selectNode(null)} onMoveEnd={(_, viewport) => store.setViewport(viewport)} defaultViewport={initialGraph.project.viewport} fitView fitViewOptions={{ padding: 0.3 }} minZoom={0.2} maxZoom={2.4} deleteKeyCode={null}>
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#c8d6e7" />
            <MiniMap pannable zoomable nodeColor={(node) => String(node.data?.color ?? "#0b68d7")} maskColor="rgba(240,246,252,.72)" />
            <Controls showInteractive={false} />
          </ReactFlow>
          {!store.nodes.length ? <div className="canvas-empty"><strong>Comece adicionando um bloco</strong><span>Arraste um item da biblioteca para o canvas.</span></div> : null}
        </div>
        <PropertiesPanel />
      </div>
    </main>
  );
}

export function EditorCanvas({ initialGraph }: { initialGraph: ProjectGraph }) {
  if (useEditorStore.getState().projectId !== initialGraph.project.id) {
    useEditorStore.getState().hydrate(initialGraph);
  }
  return <ReactFlowProvider><Canvas initialGraph={initialGraph} /></ReactFlowProvider>;
}
