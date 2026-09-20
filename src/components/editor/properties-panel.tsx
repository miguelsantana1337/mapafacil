"use client";

import { Copy, Trash2, X } from "lucide-react";
import { getNodeDefinition } from "@/features/editor/node-registry";
import { useEditorStore } from "@/stores/editor-store";

const colors = ["#0b68d7", "#7c3aed", "#db2777", "#059669", "#d97706", "#475569"];

export function PropertiesPanel() {
  const node = useEditorStore((state) => state.nodes.find((item) => item.id === state.selectedNodeId));
  const updateNode = useEditorStore((state) => state.updateNode);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const selectNode = useEditorStore((state) => state.selectNode);
  const addNode = useEditorStore((state) => state.addNode);
  if (!node) return null;
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
          <button onClick={() => addNode(node.type, { x: node.position.x + 32, y: node.position.y + 32 })}><Copy size={15} />Duplicar</button>
          <button className="danger" onClick={deleteSelected}><Trash2 size={15} />Excluir</button>
        </div>
      </div>
    </aside>
  );
}
