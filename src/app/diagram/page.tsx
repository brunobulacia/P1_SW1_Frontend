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
  const isConnecting = useDiagramStore((state) => state.isConnecting);
  const resetConnection = useDiagramStore((state) => state.resetConnection);
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

  // Handler para cancelar la conexión al hacer click en el fondo
  const handlePaneClick = useCallback(() => {
    if (isConnecting) {
      resetConnection();
    }
  }, [isConnecting, resetConnection]);

  return (
    <div className="flex h-screen w-screen">
      {/* Indicador de estado de conexión */}
      {isConnecting && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
            <span>Click en el nodo destino para crear la relación - Presiona ESC para cancelar</span>
          </div>
        </div>
      )}
      
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
          onPaneClick={handlePaneClick}
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