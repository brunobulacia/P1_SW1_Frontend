import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";
import { Attribute, ClassNodeData, RelationType } from "../types/nodes/nodes";

interface DiagramStore {
  nodes: Node[];
  edges: Edge[];
  connectionMode: RelationType | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setConnectionMode: (mode: RelationType | null) => void;
  addNode: (nodeType: string) => void;
  addEdge: (
    sourceId: string,
    targetId: string,
    relationType: RelationType
  ) => void;
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

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setConnectionMode: (mode) => set({ connectionMode: mode }),

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
    const { edges } = get();

    // Allow unlimited relationships between same nodes
    const newEdge: Edge = {
      id: `edge-${sourceId}-${targetId}-${relationType}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: relationType,
      data: {
        type: relationType,
        sourceCardinality: "",
        targetCardinality: "",
        label: "",
      },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
      connectionMode: null, // Reset connection mode after creating edge
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
