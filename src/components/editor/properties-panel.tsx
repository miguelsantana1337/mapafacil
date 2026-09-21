"use client";

import { Copy, Link2, MousePointer2, Trash2, X } from "lucide-react";
import { getNodeDefinition } from "@/features/editor/node-registry";
import { useEditorStore } from "@/stores/editor-store";

const colors = ["#0b68d7", "#7c3aed", "#db2777", "#059669", "#d97706", "#475569"];

export function PropertiesPanel() {
  const node = useEditorStore((state) => state.nodes.find((item) => item.id === state.selectedNodeId));
  const edge = useEditorStore((state) => state.edges.find((item) => item.id === state.selectedEdgeId));
  const updateNode = useEditorStore((state) => state.updateNode);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const selectNode = useEditorStore((state) => state.selectNode);
  const updateEdge = useEditorStore((state) => state.updateEdge);
  const selectEdge = useEditorStore((state) => state.selectEdge);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);

  if (edge) return <aside className="properties-panel"><div className="panel-heading"><div><span>Propriedades</span><strong>Conexão</strong></div><button onClick={() => selectEdge(null)} aria-label="Fechar propriedades"><X size={18} /></button></div><div className="properties-scroll"><label>Rótulo<input value={typeof edge.label === "string" ? edge.label : ""} onChange={(event) => updateEdge(edge.id, { label: event.target.value })} placeholder="Ex.: avançou, não respondeu…" /></label><label>Traçado<select value={edge.type ?? "smoothstep"} onChange={(event) => updateEdge(edge.id, { type: event.target.value })}><option value="smoothstep">Organizado</option><option value="bezier">Curvo</option><option value="straight">Reto</option><option value="step">Em etapas</option></select></label><fieldset><legend>Cor da conexão</legend><div className="color-options">{colors.map((color) => <button key={color} onClick={() => updateEdge(edge.id, { style: { ...edge.style, stroke: color, strokeWidth: 2 } })} aria-label={`Usar cor ${color}`} style={{ background: color }} />)}</div></fieldset><button className="panel-delete" onClick={deleteSelected}><Trash2 size={15} />Excluir conexão</button></div></aside>;
  if (!node) return <aside className="properties-panel properties-panel--empty"><MousePointer2 size={25} /><strong>Personalize sua jornada</strong><p>Selecione um bloco ou uma conexão para editar. Segure Shift para selecionar vários blocos.</p><small><Link2 size={14} />Arraste pelas alças para criar caminhos.</small></aside>;
  const definition = getNodeDefinition(node.type);

  return (
    <aside className="properties-panel">
      <div className="panel-heading">
        <div><span>Propriedades</span><strong>{definition.label}</strong></div>
        <button onClick={() => selectNode(null)} aria-label="Fechar propriedades"><X size={18} /></button>
      </div>
      <div className="properties-scroll">
        <label>Título<input value={node.data.title} onChange={(event) => updateNode(node.id, { title: event.target.value })} /></label>
        <label>Descrição<textarea rows={4} value={node.data.description ?? ""} onChange={(event) => updateNode(node.id, { description: event.target.value })} placeholder="Explique o papel deste bloco na jornada." /></label>
        {Object.entries(node.data.fields ?? {}).map(([key, value]) => (
          <label key={key}>{key.replaceAll("_", " ")}<input value={String(value ?? "")} onChange={(event) => updateNode(node.id, { fields: { ...node.data.fields, [key]: event.target.value } })} /></label>
        ))}
        <fieldset><legend>Cor do bloco</legend><div className="color-options">{colors.map((color) => <button key={color} onClick={() => updateNode(node.id, { color })} aria-label={`Usar cor ${color}`} className={node.data.color === color ? "active" : ""} style={{ background: color }} />)}</div></fieldset>
        <div className="property-actions">
          <button onClick={duplicateSelected}><Copy size={15} />Duplicar</button>
          <button className="danger" onClick={deleteSelected}><Trash2 size={15} />Excluir</button>
        </div>
      </div>
    </aside>
  );
}
