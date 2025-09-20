"use client";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
import { TextUpdaterNode } from "@/components/custom/nodes/nodes";
import { useDiagramStore } from "@/store/diagram.store";

const nodeTypes = {
  textUpdater: TextUpdaterNode,
};

const rfStyle = {
  backgroundColor: '#f0f0f0',
};

export default function App() {
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );
  
  const onConnect = useCallback(
    (params: any) =>
      setEdges(addEdge(params, edges)),
    [edges, setEdges]
  );

  return (

    <div className="flex h-screen w-screen">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          style={{ 
            ...rfStyle, 
          }}
        >
          <Controls />
          <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
        </ReactFlow>
      </div>
  );
}