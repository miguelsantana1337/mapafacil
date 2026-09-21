"use client";

import "@xyflow/react/dist/style.css";
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type NodeTypes } from "@xyflow/react";
import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, ArrowLeft, Copy, Download, Expand, FileJson, HelpCircle, ImageDown, Library, Redo2, Save, Share2, Undo2, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { JourneyNode } from "./journey-node";
import { NodeLibrary } from "./node-library";
import { PropertiesPanel } from "./properties-panel";
import { useEditorStore } from "@/stores/editor-store";
import type { CanvasNode, ProjectGraph, ProjectNodeType } from "@/types/project";
import { enableProjectSharing, saveProjectGraph } from "@/features/projects/actions";
import { saveProjectVersion } from "@/features/projects/actions";
import { projectGraphSchema } from "@/features/editor/graph-schema";
import { toPng } from "html-to-image";

const nodeTypes: NodeTypes = new Proxy({}, { get: () => JourneyNode }) as NodeTypes;

function Canvas({ initialGraph }: { initialGraph: ProjectGraph }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const flow = useReactFlow<CanvasNode>();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const store = useEditorStore();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches("input,textarea,[contenteditable=true]")) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) store.redo(); else store.undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") { event.preventDefault(); store.copySelected(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") { event.preventDefault(); store.pasteClipboard(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") { event.preventDefault(); store.duplicateSelected(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") { event.preventDefault(); store.selectAll(); }
      if (event.key === "?") setHelpOpen(true);
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

  const exportPng = async () => {
    const element = wrapper.current?.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!element) return;
    try { const url = await toPng(element, { backgroundColor: "#f8fbfe", pixelRatio: 2 }); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${store.projectName}.png`; anchor.click(); toast.success("Imagem exportada"); }
    catch { toast.error("Não foi possível gerar a imagem."); }
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    try { const parsed = projectGraphSchema.safeParse(JSON.parse(await file.text())); if (!parsed.success) throw new Error(); const graph = parsed.data as ProjectGraph; store.importGraph({ ...graph, project: { ...graph.project, id: store.projectId } }); flow.fitView({ padding: 0.25 }); toast.success("Mapa importado e pronto para salvar"); }
    catch { toast.error("Arquivo inválido. Use um JSON exportado pelo Mapa Fácil."); }
  };

  const createVersion = async () => { const result = await saveProjectVersion(store.exportGraph()); if (result.ok) toast.success(`Versão ${result.version} salva`); else toast.error(result.message); };
  const shareProject = async () => { const result = await enableProjectSharing(store.projectId); if (!result.ok || !result.token) return toast.error(result.message); const url = `${window.location.origin}/share/${result.token}`; await navigator.clipboard.writeText(url); toast.success("Link somente leitura copiado"); };

  const status = { idle: "Pronto", dirty: "Alterações locais", saving: "Salvando…", saved: "Salvo", error: "Falha ao salvar" }[store.saveStatus];

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <div className="editor-topbar__left"><Link href="/app" aria-label="Voltar ao dashboard"><ArrowLeft size={19} /></Link><span className="topbar-divider" /><input value={store.projectName} onChange={(event) => store.setProjectName(event.target.value)} aria-label="Nome do projeto" /></div>
        <div className="editor-topbar__center"><button onClick={store.undo} aria-label="Desfazer"><Undo2 size={17} /></button><button onClick={store.redo} aria-label="Refazer"><Redo2 size={17} /></button><span className={`save-pill save-pill--${store.saveStatus}`}>{status}</span></div>
        <div className="editor-topbar__right"><button onClick={() => setLibraryOpen((open) => !open)} className="mobile-library"><Library size={16} />Blocos</button><button onClick={createVersion} title="Salvar versão"><Save size={16} />Versão</button><button onClick={shareProject} title="Compartilhar somente leitura"><Share2 size={16} />Compartilhar</button><details className="export-menu"><summary><Download size={16} />Exportar</summary><div><button onClick={exportPng}><ImageDown size={15} />Imagem PNG</button><button onClick={exportJson}><FileJson size={15} />Projeto JSON</button><button onClick={() => window.print()}><Download size={15} />Imprimir / PDF</button></div></details></div>
      </header>
      <div className="editor-workspace">
        <div className={libraryOpen ? "library-wrap is-open" : "library-wrap"}><NodeLibrary onClose={() => setLibraryOpen(false)} /></div>
        <div ref={wrapper} className="flow-wrap" onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}>
          <ReactFlow nodes={store.nodes} edges={store.edges} nodeTypes={nodeTypes} onNodesChange={store.onNodesChange} onEdgesChange={store.onEdgesChange} onConnect={store.onConnect} onNodeClick={(_, node) => store.selectNode(node.id)} onEdgeClick={(_, edge) => store.selectEdge(edge.id)} onPaneClick={() => { store.selectNode(null); store.selectEdge(null); }} onNodeDragStop={store.commitSnapshot} onMoveEnd={(_, viewport) => store.setViewport(viewport)} defaultViewport={initialGraph.project.viewport} fitView fitViewOptions={{ padding: 0.28, maxZoom: 1 }} minZoom={0.2} maxZoom={2.4} deleteKeyCode={null} selectionOnDrag multiSelectionKeyCode="Shift">
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#c8d6e7" />
            <MiniMap pannable zoomable nodeColor={(node) => String(node.data?.color ?? "#0b68d7")} maskColor="rgba(240,246,252,.72)" />
            <Controls showInteractive={false} />
          </ReactFlow>
          <nav className="canvas-command-rail" aria-label="Comandos do canvas"><button onClick={store.duplicateSelected} title="Duplicar (Ctrl/⌘ D)"><Copy size={17} /></button><button onClick={() => store.alignSelected("horizontal")} title="Alinhar horizontalmente"><AlignHorizontalSpaceAround size={17} /></button><button onClick={() => store.alignSelected("vertical")} title="Alinhar verticalmente"><AlignVerticalSpaceAround size={17} /></button><button onClick={() => flow.fitView({ padding: 0.25, maxZoom: 1 })} title="Enquadrar mapa"><Expand size={17} /></button><button onClick={() => fileInput.current?.click()} title="Importar JSON"><Upload size={17} /></button><button onClick={() => setHelpOpen(true)} title="Atalhos"><HelpCircle size={17} /></button></nav>
          <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => importJson(event.target.files?.[0])} />
          {!store.nodes.length ? <div className="canvas-empty"><strong>Comece adicionando um bloco</strong><span>Arraste um item da biblioteca para o canvas.</span></div> : null}
        </div>
        <PropertiesPanel />
      </div>
      {helpOpen ? <div className="modal-backdrop" onClick={() => setHelpOpen(false)}><section className="shortcut-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setHelpOpen(false)}>×</button><span className="eyebrow">ATALHOS</span><h2>Trabalhe no ritmo da ideia.</h2><dl><div><dt>⌘/Ctrl + C / V</dt><dd>Copiar e colar seleção</dd></div><div><dt>⌘/Ctrl + D</dt><dd>Duplicar blocos</dd></div><div><dt>Shift + clique</dt><dd>Selecionar vários</dd></div><div><dt>⌘/Ctrl + Z</dt><dd>Desfazer</dd></div><div><dt>Delete</dt><dd>Excluir seleção</dd></div></dl></section></div> : null}
    </main>
  );
}

export function EditorCanvas({ initialGraph }: { initialGraph: ProjectGraph }) {
  if (useEditorStore.getState().projectId !== initialGraph.project.id) {
    useEditorStore.getState().hydrate(initialGraph);
  }
  return <ReactFlowProvider><Canvas initialGraph={initialGraph} /></ReactFlowProvider>;
}
