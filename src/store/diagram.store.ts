import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";
import { ClassNodeData, RelationType } from "../types/nodes/nodes";

interface DiagramStore {
  nodes: Node[];
  edges: Edge[];
  connectionMode: RelationType | null;
  isConnecting: boolean;
  selectedNodeForConnection: string | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setConnectionMode: (mode: RelationType | null) => void;
  setIsConnecting: (connecting: boolean) => void;
  setSelectedNodeForConnection: (nodeId: string | null) => void;
  startConnection: (nodeId: string, relationType: RelationType) => void;
  resetConnection: () => void;
  addNode: (nodeType: string) => void;
  addEdge: (
    sourceId: string,
    targetId: string,
    relationType: RelationType
  ) => void;
  addManyToManyRelation: (sourceId: string, targetId: string) => void;
  updateNode: (id: string, changes: Partial<Node>) => void;
  updateEdge: (id: string, changes: Partial<Edge>) => void;
  removeNode: (id: string) => void;
}

const initialNodes: Node[] = [
  {
    id: "n1",
    type: "textUpdater",
    position: { x: 250, y: 100 },
    data: {
      label: "Usuario",
      attributes: [
        {
          id: "attr1",
          name: "id",
          type: "number",
          visibility: "private" as const,
        },
        {
          id: "attr2",
          name: "nombre",
          type: "string",
          visibility: "public" as const,
        },
        {
          id: "attr3",
          name: "email",
          type: "string",
          visibility: "private" as const,
        },
      ],
    } as ClassNodeData,
  },
  {
    id: "n2",
    type: "textUpdater",
    position: { x: 250, y: 350 },
    data: {
      label: "Producto",
      attributes: [
        {
          id: "attr4",
          name: "codigo",
          type: "string",
          visibility: "private" as const,
        },
        {
          id: "attr5",
          name: "precio",
          type: "number",
          visibility: "public" as const,
        },
      ],
    } as ClassNodeData,
  },
  {
    id: "n3",
    type: "textUpdater",
    position: { x: 500, y: 225 },
    data: {
      label: "Pedido",
      attributes: [
        {
          id: "attr6",
          name: "fecha",
          type: "Date",
          visibility: "public" as const,
        },
      ],
    } as ClassNodeData,
  },
];

const initialEdges: Edge[] = [
  {
    id: "test-edge-1",
    source: "n1",
    target: "n2",
    type: "association",
    sourceHandle: "bottom",
    targetHandle: "top",
    data: {
      type: "association",
      sourceCardinality: "1",
      targetCardinality: "0..*",
      label: "compra",
    },
  },
];

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  connectionMode: null,
  isConnecting: false,
  selectedNodeForConnection: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setConnectionMode: (mode) => set({ connectionMode: mode }),
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),
  setSelectedNodeForConnection: (nodeId) =>
    set({ selectedNodeForConnection: nodeId }),

  startConnection: (nodeId: string, relationType: RelationType) => {
    set({
      isConnecting: true,
      selectedNodeForConnection: nodeId,
      connectionMode: relationType,
    });
  },

  resetConnection: () => {
    set({
      isConnecting: false,
      selectedNodeForConnection: null,
      connectionMode: null,
    });
  },

  addNode: (nodeType: string) => {
    const { nodes } = get();
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "textUpdater",
      position: {
        x: 200 + Math.random() * 600,
        y: 100 + Math.random() * 400,
      },
      data: {
        label: nodeType,
        attributes: [],
      } as ClassNodeData,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  addEdge: (sourceId: string, targetId: string, relationType: RelationType) => {
    // Si es many-to-many, usar la función especializada
    if (relationType === "many-to-many") {
      get().addManyToManyRelation(sourceId, targetId);
      return;
    }

    const { edges } = get();

    // Calcular handles únicos para evitar solapamiento
    const getUniqueHandles = (sourceId: string, targetId: string) => {
      // Definir todos los handles disponibles por posición
      const sourceHandles = [
        "bottom",
        "bottom-left",
        "bottom-right",
        "right",
        "right-top",
        "right-bottom",
        "left",
        "left-top",
        "left-bottom",
        "top",
        "top-left",
        "top-right",
      ];

      const targetHandles = [
        "top",
        "top-left",
        "top-right",
        "left",
        "left-top",
        "left-bottom",
        "right",
        "right-top",
        "right-bottom",
        "bottom",
        "bottom-left",
        "bottom-right",
      ];

      // Contar conexiones existentes desde el nodo source
      const sourceConnections = edges.filter((e) => e.source === sourceId);
      const targetConnections = edges.filter((e) => e.target === targetId);

      // Obtener handles ya usados
      const usedSourceHandles = sourceConnections.map((e) => e.sourceHandle);
      const usedTargetHandles = targetConnections.map((e) => e.targetHandle);

      // Seleccionar el primer handle disponible
      const sourceHandle =
        sourceHandles.find((h) => !usedSourceHandles.includes(h)) ||
        sourceHandles[sourceConnections.length % sourceHandles.length];
      const targetHandle =
        targetHandles.find((h) => !usedTargetHandles.includes(h)) ||
        targetHandles[targetConnections.length % targetHandles.length];

      return { sourceHandle, targetHandle };
    };

    const { sourceHandle, targetHandle } = getUniqueHandles(sourceId, targetId);

    // Allow unlimited relationships between same nodes
    const newEdge: Edge = {
      id: `edge-${sourceId}-${targetId}-${relationType}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: relationType,
      sourceHandle,
      targetHandle,
      data: {
        type: relationType,
        sourceCardinality: "",
        targetCardinality: "",
        label: "",
      },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
      connectionMode: null,
      isConnecting: false,
      selectedNodeForConnection: null,
    }));
  },

  addManyToManyRelation: (sourceId: string, targetId: string) => {
    const { nodes, edges } = get();

    // Obtener información de los nodos source y target
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) return;

    // Calcular posición de la clase de asociación (punto medio)
    const associationX = (sourceNode.position.x + targetNode.position.x) / 2;
    const associationY =
      (sourceNode.position.y + targetNode.position.y) / 2 + 80; // Abajo del centro

    // Crear la clase de asociación intermedia
    const associationClassId = `association-${sourceId}-${targetId}-${Date.now()}`;
    const associationClass: Node = {
      id: associationClassId,
      type: "textUpdater",
      position: { x: associationX, y: associationY },
      data: {
        label: `AssociationClass1`,
        attributes: [
          {
            id: `attr-${Date.now()}`,
            name: "id",
            type: "number",
            visibility: "private" as const,
          },
        ],
        isAssociationClass: true, // Marcar como clase de asociación
      } as ClassNodeData,
    };

    // Función para obtener handles únicos
    const getUniqueHandles = (sourceId: string, targetId: string) => {
      const sourceHandles = [
        "bottom",
        "bottom-left",
        "bottom-right",
        "right",
        "right-top",
        "right-bottom",
        "left",
        "left-top",
        "left-bottom",
        "top",
        "top-left",
        "top-right",
      ];
      const targetHandles = [
        "top",
        "top-left",
        "top-right",
        "left",
        "left-top",
        "left-bottom",
        "right",
        "right-top",
        "right-bottom",
        "bottom",
        "bottom-left",
        "bottom-right",
      ];

      const sourceConnections = edges.filter((e) => e.source === sourceId);
      const targetConnections = edges.filter((e) => e.target === targetId);

      const usedSourceHandles = sourceConnections.map((e) => e.sourceHandle);
      const usedTargetHandles = targetConnections.map((e) => e.targetHandle);

      const sourceHandle =
        sourceHandles.find((h) => !usedSourceHandles.includes(h)) ||
        sourceHandles[sourceConnections.length % sourceHandles.length];
      const targetHandle =
        targetHandles.find((h) => !usedTargetHandles.includes(h)) ||
        targetHandles[targetConnections.length % targetHandles.length];

      return { sourceHandle, targetHandle };
    };

    // Crear relación directa entre las dos clases principales (many-to-many)
    const { sourceHandle: mainSourceHandle, targetHandle: mainTargetHandle } =
      getUniqueHandles(sourceId, targetId);
    const mainEdge: Edge = {
      id: `edge-${sourceId}-${targetId}-many-to-many-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: "association",
      sourceHandle: mainSourceHandle,
      targetHandle: mainTargetHandle,
      data: {
        type: "association",
        sourceCardinality: "*",
        targetCardinality: "*",
        label: "",
        associationClass: associationClassId, // Referencia a la clase de asociación
      },
    };

    set((state) => ({
      nodes: [...state.nodes, associationClass],
      edges: [...state.edges, mainEdge],
      connectionMode: null,
      isConnecting: false,
      selectedNodeForConnection: null,
    }));
  },

  updateNode: (id: string, changes: Partial<Node>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...changes } : node
      ),
    }));
  },

  updateEdge: (id: string, changes: Partial<Edge>) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id ? { ...edge, ...changes } : edge
      ),
    }));
  },

  removeNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    }));
  },
}));
