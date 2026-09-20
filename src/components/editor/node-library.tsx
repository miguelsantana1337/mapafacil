"use client";

import { Search, Shapes, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getRegistryForProject } from "@/features/editor/node-registry";
import { useEditorStore } from "@/stores/editor-store";

export function NodeLibrary({ onClose }: { onClose?: () => void }) {
  const projectType = useEditorStore((state) => state.projectType);
  const [query, setQuery] = useState("");
  const definitions = useMemo(() => getRegistryForProject(projectType).filter((item) => `${item.label} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [projectType, query]);
  const categories = [...new Set(definitions.map((item) => item.category))];

  return (
    <aside className="node-library">
      <div className="panel-heading">
        <div><span>Biblioteca</span><strong>Blocos</strong></div>
        {onClose ? <button onClick={onClose} aria-label="Fechar biblioteca"><X size={18} /></button> : <Shapes size={19} />}
      </div>
      <label className="library-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar bloco" /></label>
      <div className="library-scroll">
        {categories.map((category) => (
          <section key={category} className="library-category">
            <h3>{category}</h3>
            <div className="library-items">
              {definitions.filter((item) => item.category === category).map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.type} draggable onDragStart={(event) => { event.dataTransfer.setData("application/mapafacil-node", item.type); event.dataTransfer.effectAllowed = "move"; }} title={item.description}>
                    <i style={{ "--item-color": item.color } as React.CSSProperties}><Icon size={16} /></i>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
