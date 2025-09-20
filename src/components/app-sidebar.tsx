"use client";

import {
  UmlClassIcon,
  UmlAssociationIcon,
  UmlAggregationIcon,
  UmlCompositionIcon,
  UmlGeneralizationIcon,
  UmlNoteIcon,
  UmlDependencyIcon,
  UmlRealizationIcon,
} from "@/components/custom/icons/UMLIcons";

import { useDiagramStore } from "@/store/diagram.store";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useState } from "react";
import { RelationType } from "@/types/nodes/nodes";

// Elementos (nodos)
const nodeItems = [
  { title: "Clase", icon: UmlClassIcon, type: "class" },
  { title: "Nota", icon: UmlNoteIcon, type: "note" },
];

// Relaciones (edges)
const relationshipItems = [
  { title: "Asociación", icon: UmlAssociationIcon, type: "association" as RelationType },
  { title: "Agregación", icon: UmlAggregationIcon, type: "aggregation" as RelationType },
  { title: "Composición", icon: UmlCompositionIcon, type: "composition" as RelationType },
  { title: "Herencia", icon: UmlGeneralizationIcon, type: "inheritance" as RelationType },
  { title: "Realización", icon: UmlRealizationIcon, type: "realization" as RelationType },
  { title: "Dependencia", icon: UmlDependencyIcon, type: "dependency" as RelationType },
];

export function AppSidebar() {
  const addNode = useDiagramStore((state) => state.addNode);
  const setConnectionMode = useDiagramStore((state) => state.setConnectionMode);
  const currentConnectionMode = useDiagramStore((state) => state.connectionMode);
  
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleAddNode = (nodeType: string) => {
    setSelectedTool(null);
    setConnectionMode(null);
    addNode(nodeType);
  };

  const handleSelectRelationship = (relationType: RelationType) => {
    setSelectedTool(relationType);
    setConnectionMode(relationType);
  };

  const handleSelectPointer = () => {
    setSelectedTool(null);
    setConnectionMode(null);
  };

  return (
    <Sidebar>
      <SidebarContent>
        {/* Herramienta de selección */}
        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={handleSelectPointer}
                    className={`w-full ${selectedTool === null ? 'bg-blue-100 border-blue-500' : ''}`}
                  >
                    <span className="text-lg">👆</span>
                    <span>Seleccionar</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Elementos (Nodos) */}
        <SidebarGroup>
          <SidebarGroupLabel>Elementos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nodeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={() => handleAddNode(item.title)}
                      className={`w-full ${selectedTool === item.type ? 'bg-blue-100 border-blue-500' : ''}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Relaciones (Edges) */}
        <SidebarGroup>
          <SidebarGroupLabel>Relaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {relationshipItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={() => handleSelectRelationship(item.type)}
                      className={`w-full ${selectedTool === item.type ? 'bg-blue-100 border-blue-500' : ''}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}