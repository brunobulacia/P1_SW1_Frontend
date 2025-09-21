import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

export interface Attribute {
  id: string;
  name: string;
  type: string;
  visibility: "public" | "private" | "protected";
}

export interface Method {
  id: string;
  name: string;
  returnType: string;
  parameters?: string;
  visibility: "public" | "private" | "protected";
}

export interface ClassNodeData {
  label: string;
  attributes: Attribute[];
  methods: Method[];
  isAssociationClass?: boolean; // Para identificar clases de asociación
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
  | "dependency" // Dependencia (línea punteada con flecha)
  | "many-to-many" // Relación muchos-a-muchos con clase de asociación
  | "association-class"; // Línea punteada desde relación principal a clase de asociación

export interface RelationshipData {
  type: RelationType;
  label?: string;
  sourceCardinality?: string; // ej: "1", "0..*", "1..*"
  targetCardinality?: string;
  sourceRole?: string; // nombre del rol en el extremo source
  targetRole?: string; // nombre del rol en el extremo target
  associationClass?: string; // ID de la clase de asociación para relaciones many-to-many
  [key: string]: any;
}

export interface Edge extends ReactFlowEdge {
  data?: RelationshipData;
}
