import { create } from "zustand";
import { Node, Edge } from "../types/nodes/nodes";

interface DiagramStore {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (nodeType: string) => void;
  updateNode: (id: string, changes: Partial<Node>) => void;
  removeNode: (id: string) => void;
}

const initialNodes: Node[] = [
  {
    id: "n1",
    type: "textUpdater",
    position: { x: 250, y: 100 },
    data: { label: "Clase" },
  },
  {
    id: "n2",
    type: "textUpdater",
    position: { x: 250, y: 250 },
    data: { label: "Asociación" },
  },
  {
    id: "n3",
    type: "textUpdater",
    position: { x: 500, y: 175 },
    data: { label: "Herencia" },
  },
];

const initialEdges: Edge[] = [];

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (nodeType: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "textUpdater",
      position: {
        x: 200 + Math.random() * 600,
        y: 100 + Math.random() * 400,
      },
      data: { label: nodeType },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  updateNode: (id: string, changes: Partial<Node>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...changes } : node
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
