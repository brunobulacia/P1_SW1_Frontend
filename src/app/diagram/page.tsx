"use client";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  Connection,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
import { TextUpdaterNode } from "@/components/custom/nodes/nodes";
import { AssociationEdge, AggregationEdge, CompositionEdge, InheritanceEdge, DependencyEdge, RealizationEdge } from "@/components/custom/edges/UMLEdges";
import { useDiagramStore } from "@/store/diagram.store";

const nodeTypes = {
  textUpdater: TextUpdaterNode,
};

const edgeTypes = {
  association: AssociationEdge,
  aggregation: AggregationEdge,
  composition: CompositionEdge,
  inheritance: InheritanceEdge,
  dependency: DependencyEdge,
  realization: RealizationEdge,
};

const rfStyle = {
  backgroundColor: '#f0f0f0',
};

export default function App() {
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);
  const connectionMode = useDiagramStore((state) => state.connectionMode);
  const addEdgeToStore = useDiagramStore((state) => state.addEdge);

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
    (connection: Connection) => {
      if (connectionMode && connection.source && connection.target) {
        addEdgeToStore(connection.source, connection.target, connectionMode);
      } else {
        // Default connection (association)
        if (connection.source && connection.target) {
          addEdgeToStore(connection.source, connection.target, 'association');
        }
      }
    },
    [connectionMode, addEdgeToStore]
  );

  return (
    <div className="flex h-screen w-screen">
      <div 
        className="flex-1 h-screen" 
        style={{ 
          width: '100%',
          height: '100vh',
          minHeight: '100vh'
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={connectionMode ? ConnectionMode.Loose : ConnectionMode.Strict}
          style={{ 
            ...rfStyle, 
            width: '100%', 
            height: '100%'
          }}
        >
          <Controls />
          <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}