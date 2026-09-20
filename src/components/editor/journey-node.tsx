"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getNodeDefinition } from "@/features/editor/node-registry";
import type { CanvasNode } from "@/types/project";

export function JourneyNode({ data, type, selected }: NodeProps<CanvasNode>) {
  const definition = getNodeDefinition(type);
  const Icon = definition.icon;
  const isCondition = type === "condition" || type === "decision";

  return (
    <article className={`journey-node ${selected ? "is-selected" : ""} ${isCondition ? "is-condition" : ""}`} style={{ "--node-accent": data.color ?? definition.color } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="journey-handle" />
      <div className="journey-node__icon"><Icon size={18} strokeWidth={1.9} /></div>
      <div className="journey-node__copy">
        <span>{definition.label}</span>
        <strong>{data.title}</strong>
        {data.description ? <p>{data.description}</p> : null}
      </div>
      {isCondition ? (
        <>
          <Handle type="source" id="yes" position={Position.Right} className="journey-handle journey-handle--yes" style={{ top: "35%" }} />
          <Handle type="source" id="no" position={Position.Right} className="journey-handle journey-handle--no" style={{ top: "70%" }} />
          <small className="branch-label branch-label--yes">SIM</small>
          <small className="branch-label branch-label--no">NÃO</small>
        </>
      ) : <Handle type="source" position={Position.Right} className="journey-handle" />}
    </article>
  );
}
