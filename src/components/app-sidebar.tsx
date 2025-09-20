"use client";

import {
  UmlClassIcon,
  UmlAssociationIcon,
  UmlAggregationIcon,
  UmlCompositionIcon,
  UmlGeneralizationIcon,
  UmlNoteIcon,
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

const items = [
  { title: "Clase", icon: UmlClassIcon },
  { title: "Asociación", icon: UmlAssociationIcon },
  { title: "Agregación", icon: UmlAggregationIcon },
  { title: "Composición", icon: UmlCompositionIcon },
  { title: "Herencia", icon: UmlGeneralizationIcon },
  { title: "Nota", icon: UmlNoteIcon },
];

export function AppSidebar() {
  const addNode = useDiagramStore((state) => state.addNode);
  
  const handleAddNode = (nodeType: string) => {
    addNode(nodeType);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Elementos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button onClick={() => handleAddNode(item.title)}>
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