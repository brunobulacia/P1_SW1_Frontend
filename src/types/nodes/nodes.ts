import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

export interface Attribute {
  id: string;
  name: string;
  type: string;
  visibility: "public" | "private" | "protected";
}

export interface ClassNodeData {
  label: string;
  attributes: Attribute[];
  methods?: string[];
  [key: string]: any; // Para compatibilidad con ReactFlow
}

export interface Node extends ReactFlowNode {
  data: ClassNodeData;
}

// Tipos de relaciones UML
export type RelationType =
  | "association" // Asociación (línea simple)
  | "aggregation" // Agregación (diamante vacío)
  | "composition" // Composición (diamante lleno)
  | "inheritance" // Herencia (flecha triangular vacía)
  | "realization" // Realización (flecha triangular vacía con línea punteada)
  | "dependency"; // Dependencia (línea punteada con flecha)

export interface RelationshipData {
  type: RelationType;
  label?: string;
  sourceCardinality?: string; // ej: "1", "0..*", "1..*"
  targetCardinality?: string;
  sourceRole?: string; // nombre del rol en el extremo source
  targetRole?: string; // nombre del rol en el extremo target
  [key: string]: any;
}

export interface Edge extends ReactFlowEdge {
  data?: RelationshipData;
}
