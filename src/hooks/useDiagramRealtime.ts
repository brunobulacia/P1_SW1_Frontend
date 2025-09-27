// src/hooks/useDiagramRealtime.ts
"use client";
import { useEffect } from "react";
import { initDiagramRealtime } from "@/store/diagram.store.realtime";
import { useDiagramStore } from "@/store/diagram.store";

export function useDiagramRealtime(diagramId: string | null) {
  const loadDiagramById = useDiagramStore((s) => s.loadDiagramById);
  const loadDiagram = useDiagramStore((s) => s.loadDiagram);
  const cleanRelationshipLabels = useDiagramStore(
    (s) => s.cleanRelationshipLabels
  );

  useEffect(() => {
    if (diagramId) {
      // Cargar desde API
      loadDiagramById(diagramId);
      // Enlazar realtime
      const teardown = initDiagramRealtime(diagramId);
      return () => teardown();
    } else {
      // Sin ID → localStorage
      try {
        loadDiagram();
        cleanRelationshipLabels();
        console.log("✅ Diagrama cargado desde localStorage");
      } catch {
        console.log("ℹ️ No se encontró diagrama en localStorage");
      }
    }
  }, [diagramId, loadDiagramById, loadDiagram, cleanRelationshipLabels]);
}
