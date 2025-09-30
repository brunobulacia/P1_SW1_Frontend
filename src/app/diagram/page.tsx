// app/diagram/page.tsx
"use client";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TextUpdaterNode } from "@/components/custom/nodes/nodes";
import {
  AssociationEdge,
  AggregationEdge,
  CompositionEdge,
  InheritanceEdge,
  DependencyEdge,
  RealizationEdge,
} from "@/components/custom/edges/UMLEdges";
import { useDiagramStore } from "@/store/diagram.store";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDiagramRealtime } from "@/hooks/useDiagramRealtime";
import { ChatInterface, type Message } from "@/components/chat/chat-interface";
import { ActiveParticipants } from "@/components/diagram/active-participants";

const nodeTypes = { textUpdater: TextUpdaterNode };
const edgeTypes = {
  association: AssociationEdge,
  aggregation: AggregationEdge,
  composition: CompositionEdge,
  inheritance: InheritanceEdge,
  dependency: DependencyEdge,
  realization: RealizationEdge,
};
const rfStyle = { backgroundColor: "#f0f0f0" };

export default function DiagramPage() {
  const searchParams = useSearchParams();
  const diagramId = searchParams.get("id");
  const [messages, setMessages] = useState<Message[]>([]);
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);
  const connectionMode = useDiagramStore((state) => state.connectionMode);
  const isConnecting = useDiagramStore((state) => state.isConnecting);
  const resetConnection = useDiagramStore((state) => state.resetConnection);
  const addEdgeToStore = useDiagramStore((state) => state.addEdge);
  const autoLayout = useDiagramStore((state) => state.autoLayout);
  const isLoading = useDiagramStore((state) => state.isLoading);
  const printDiagramToConsole = useDiagramStore(
    (state) => state.printDiagramToConsole
  );

  // 👇 carga inicial + realtime (API si hay id, localStorage si no)
  useDiagramRealtime(diagramId);

  // Desactivar auto-layout: mantener posiciones de las clases al agregar nuevas
  // Si en algún momento deseas reactivar, vuelve a habilitar este efecto o agrega un botón que llame a autoLayout() manualmente.
  // useEffect(() => {
  //   if (!isLoading && nodes.length > 0) {
  //     const timer = setTimeout(() => { autoLayout(); }, 300);
  //     return () => clearTimeout(timer);
  //   }
  // }, [nodes.length, edges.length, isLoading, autoLayout]);

  useEffect(() => {
    (window as any).printDiagram = printDiagramToConsole;
    console.log('🎨 Tip: "printDiagram()" en consola muestra el JSON completo');
  }, [printDiagramToConsole]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connectionMode && connection.source && connection.target) {
        addEdgeToStore(connection.source, connection.target, connectionMode);
      } else if (connection.source && connection.target) {
        addEdgeToStore(connection.source, connection.target, "association");
      }
    },
    [connectionMode, addEdgeToStore]
  );
  const handlePaneClick = useCallback(() => {
    if (isConnecting || connectionMode) resetConnection();
  }, [isConnecting, connectionMode, resetConnection]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  const handleSendAssistantMessage = async (content: string) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleDiagramGenerated = (diagram: any) => {
    // Actualizar el store del diagrama con el nuevo diagrama generado
    console.log('🎨 Frontend recibió diagrama:', diagram);
    console.log('📊 Nodos:', diagram.nodes?.length || 0);
    console.log('🔗 Edges:', diagram.edges?.length || 0);
    console.log('📋 Detalle edges:', diagram.edges);
    
    // Verificar el formato de cada edge
    if (diagram.edges && diagram.edges.length > 0) {
      console.log('🔍 Análisis de edges:');
      diagram.edges.forEach((edge: any, index: number) => {
        console.log(`  Edge ${index}:`, {
          id: edge.id,
          type: edge.type,
          source: edge.source,
          target: edge.target,
          data: edge.data,
          hasRequiredFields: !!(edge.id && edge.source && edge.target)
        });
      });
    }
    
    // Verificar el estado actual del store
    console.log('🔍 Estado actual del store:');
    console.log('  - Nodos en store:', nodes.length);
    console.log('  - Edges en store:', edges.length);
    
    setNodes(diagram.nodes || []);
    setEdges(diagram.edges || []);
    
    // Verificar el estado después de la actualización
    setTimeout(() => {
      console.log('✅ Estado después de actualización:');
      console.log('  - Nodos en store:', nodes.length);
      console.log('  - Edges en store:', edges.length);
    }, 100);
    
    // Opcional: mostrar notificación de éxito
    console.log('Diagrama generado exitosamente:', diagram);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">
                {diagramId
                  ? `Cargando diagrama ${diagramId}...`
                  : "Cargando diagrama..."}
              </span>
            </div>
          </div>
        )}

        {connectionMode && !isConnecting && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
              <span>
                Paso 1: Click en ORIGEN para la relación "{connectionMode}" -
                ESC para cancelar
              </span>
            </div>
          </div>
        )}
        {isConnecting && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
              <span>
                Paso 2: Click en DESTINO para crear la relación "
                {connectionMode}" - ESC para cancelar
              </span>
            </div>
          </div>
        )}
        {diagramId && !isLoading && (
          <div className="fixed top-4 right-4 z-40 flex items-center space-x-3">
            <ActiveParticipants diagramId={diagramId} />
            <div className="bg-green-600 text-white px-3 py-1 rounded-lg shadow-lg text-sm">
              Diagrama: {diagramId}
            </div>
          </div>
        )}

        <div
          className="flex-1 h-screen"
          style={{ width: "100%", height: "100vh", minHeight: "100vh" }}
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
            connectionMode={
              connectionMode ? ConnectionMode.Loose : ConnectionMode.Strict
            }
            snapToGrid
            snapGrid={[20, 20]}
            style={{ ...rfStyle, width: "100%", height: "100%" }}
          >
            <Controls />
            <Background
              variant={BackgroundVariant.Lines}
              gap={50}
              size={1}
              color="#ddd"
            />
          </ReactFlow>
        </div>
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          onSendAssistantMessage={handleSendAssistantMessage}
          onDiagramGenerated={handleDiagramGenerated}
          diagramId={diagramId || undefined}
          isLoading={isLoading}
          placeholder="Inserta un mensaje..."
        />
      </div>
    </ProtectedRoute>
  );
}
