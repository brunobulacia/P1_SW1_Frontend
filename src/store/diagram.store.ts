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
  autoLayout: () => void;
  fitToScreen: () => void;
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

  // Auto-layout usando distribución circular/orgánica
  autoLayout: () => {
    set((state) => {
      const nodes = [...state.nodes];
      const edges = state.edges;

      if (nodes.length === 0) return state;

      // Configuración del layout
      const GRID_SIZE = 20;
      const MIN_DISTANCE = 350; // Distancia mínima entre nodos
      const CENTER_X = 600;
      const CENTER_Y = 400;

      // Crear mapa de conexiones
      const connections = new Map<string, string[]>();
      nodes.forEach((node) => connections.set(node.id, []));

      edges.forEach((edge) => {
        if (connections.has(edge.source)) {
          connections.get(edge.source)!.push(edge.target);
        }
        if (connections.has(edge.target)) {
          connections.get(edge.target)!.push(edge.source);
        }
      });

      // Algoritmo de distribución en espiral/circular
      const updatedNodes = nodes.map((node, index) => {
        if (nodes.length === 1) {
          // Un solo nodo, centrarlo
          return {
            ...node,
            position: {
              x: Math.round(CENTER_X / GRID_SIZE) * GRID_SIZE,
              y: Math.round(CENTER_Y / GRID_SIZE) * GRID_SIZE,
            },
          };
        }

        // Distribución en espiral para múltiples nodos
        const angle = (index * 2 * Math.PI) / nodes.length;
        const radius = Math.max(200, nodes.length * 50); // Radio crece con más nodos

        // Agregar variación para que no sea perfectamente circular
        const radiusVariation = (index % 3) * 100 - 50; // -50, 0, o 50
        const finalRadius = radius + radiusVariation;

        const x = CENTER_X + finalRadius * Math.cos(angle);
        const y = CENTER_Y + finalRadius * Math.sin(angle);

        // Snap to grid
        const snapX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        const snapY = Math.round(y / GRID_SIZE) * GRID_SIZE;

        return {
          ...node,
          position: { x: snapX, y: snapY },
        };
      });

      return {
        ...state,
        nodes: updatedNodes,
      };
    });
  },

  // Centrar el diagrama en la pantalla
  fitToScreen: () => {
    set((state) => {
      const nodes = [...state.nodes];

      if (nodes.length === 0) return state;

      // Encontrar bounds del diagrama
      let minX = Infinity,
        minY = Infinity;
      let maxX = -Infinity,
        maxY = -Infinity;

      nodes.forEach((node) => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + 300); // ancho estimado del nodo
        maxY = Math.max(maxY, node.position.y + 200); // alto estimado del nodo
      });

      // Calcular centro y offset
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const targetX = 400; // centro de la pantalla
      const targetY = 300;

      const offsetX = targetX - centerX;
      const offsetY = targetY - centerY;

      // Aplicar snap to grid al offset
      const GRID_SIZE = 20;
      const snapOffsetX = Math.round(offsetX / GRID_SIZE) * GRID_SIZE;
      const snapOffsetY = Math.round(offsetY / GRID_SIZE) * GRID_SIZE;

      const updatedNodes = nodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x + snapOffsetX,
          y: node.position.y + snapOffsetY,
        },
      }));

      return {
        ...state,
        nodes: updatedNodes,
      };
    });
  },
}));
