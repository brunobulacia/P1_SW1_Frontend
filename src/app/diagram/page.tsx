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
import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TextUpdaterNode } from "@/components/custom/nodes/nodes";
import { AssociationEdge, AggregationEdge, CompositionEdge, InheritanceEdge, DependencyEdge, RealizationEdge } from "@/components/custom/edges/UMLEdges";
import { useDiagramStore } from "@/store/diagram.store";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
  const searchParams = useSearchParams();
  const diagramId = searchParams.get('id');

  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);
  const connectionMode = useDiagramStore((state) => state.connectionMode);
  const isConnecting = useDiagramStore((state) => state.isConnecting);
  const resetConnection = useDiagramStore((state) => state.resetConnection);
  const addEdgeToStore = useDiagramStore((state) => state.addEdge);
  const autoLayout = useDiagramStore((state) => state.autoLayout);
  const loadDiagram = useDiagramStore((state) => state.loadDiagram);
  const loadDiagramById = useDiagramStore((state) => state.loadDiagramById);
  const currentDiagramId = useDiagramStore((state) => state.currentDiagramId);
  const isLoading = useDiagramStore((state) => state.isLoading);
  const cleanRelationshipLabels = useDiagramStore((state) => state.cleanRelationshipLabels);
  const printDiagramToConsole = useDiagramStore((state) => state.printDiagramToConsole);

  // Cargar diagrama específico cuando hay ID en la URL
  useEffect(() => {
    if (diagramId && diagramId !== currentDiagramId) {
      console.log(`📋 Cargando diagrama con ID: ${diagramId}`);
      loadDiagramById(diagramId);
    } else if (!diagramId) {
      // Si no hay ID, cargar desde localStorage como antes
      try {
        loadDiagram();
        cleanRelationshipLabels();
        console.log('✅ Diagrama cargado desde localStorage');
      } catch (error) {
        console.log('ℹ️ No se encontró diagrama guardado, usando configuración inicial');
      }
    }
  }, [diagramId, currentDiagramId, loadDiagramById, loadDiagram, cleanRelationshipLabels]);

  // Auto-layout automático cuando cambian los nodos o edges (pero no durante loading)
  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      const timer = setTimeout(() => {
        autoLayout();
      }, 300); // Delay para que se carguen completamente
      
      return () => clearTimeout(timer);
    }
  }, [nodes.length, edges.length, isLoading, autoLayout]);

  // Agregar función global para ver el diagrama en consola
  useEffect(() => {
    (window as any).printDiagram = printDiagramToConsole;
    console.log('🎨 Tip: Escribe "printDiagram()" en la consola para ver el JSON completo del diagrama');
  }, [printDiagramToConsole]);

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
    if (isConnecting || connectionMode) {
      resetConnection();
    }
  }, [isConnecting, connectionMode, resetConnection]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen">
        {/* Loading state */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">
                {diagramId ? `Cargando diagrama ${diagramId}...` : 'Cargando diagrama...'}
              </span>
            </div>
          </div>
        )}

        {/* Indicadores de estado de conexión */}
        {connectionMode && !isConnecting && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
              <span>Paso 1: Click en el nodo ORIGEN para la relación "{connectionMode}" - Presiona ESC para cancelar</span>
            </div>
          </div>
        )}
        
        {isConnecting && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
              <span>Paso 2: Click en el nodo DESTINO para crear la relación "{connectionMode}" - Presiona ESC para cancelar</span>
            </div>
          </div>
        )}
        
        {/* Indicador del diagrama actual */}
        {diagramId && !isLoading && (
          <div className="fixed top-4 right-4 z-40 bg-green-600 text-white px-3 py-1 rounded-lg shadow-lg text-sm">
          Diagrama: {diagramId}
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
            snapToGrid={true}
            snapGrid={[20, 20]}
            style={{ 
              ...rfStyle, 
              width: '100%', 
              height: '100%'
            }}
          >
            <Controls />
            <Background 
              variant={BackgroundVariant.Lines  } 
              gap={50} 
              size={1} 
              color="#ddd" 
            />
          </ReactFlow>
        </div>
      </div>
    </ProtectedRoute>
  );
}