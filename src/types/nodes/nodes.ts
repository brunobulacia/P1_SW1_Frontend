export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}
