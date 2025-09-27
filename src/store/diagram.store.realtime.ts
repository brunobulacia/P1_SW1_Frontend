// src/stores/diagram.store.realtime.ts
import { useDiagramStore } from "./diagram.store";
import { getSocket } from "@/lib/socket";

const SOURCE_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `client-${Math.random().toString(36).slice(2)}`;

function throttle<T extends (...args: any[]) => void>(fn: T, wait = 0) {
  let last = 0,
    timer: any = null,
    lastArgs: any[] = [];
  return (...args: any[]) => {
    const now = Date.now();
    lastArgs = args;
    if (now - last >= wait) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn(...lastArgs);
      }, wait - (now - last));
    }
  };
}

/**
 * Enlaza el diagrama actual al socket (join/leave room + publish/subscribe)
 * Devuelve una función `teardown()` para limpiar subscripciones al desmontar.
 */
export function initDiagramRealtime(diagramId: string) {
  const socket = getSocket();

  // Marca para evitar emitir/re-guardar cuando aplicamos cambios remotos
  let applyingRemote = false;

  // 1) Unirse a la room del diagrama
  socket.emit("join-diagram", { diagramId });

  // 2) Cuando el backend notifica cambios de otro cliente, aplicamos al store
  const onDiagramUpdated = (payload: any) => {
    if (!payload) return;

    if (String(payload?.id ?? "") !== String(diagramId)) return;

    const { model } = payload;
    const nodes = model?.nodes ?? [];
    const edges = model?.edges ?? [];

    applyingRemote = true;
    try {
      // Aplicamos directo al estado para NO disparar autosave
      useDiagramStore.setState({ nodes, edges });
    } finally {
      // da un pequeño margen para que no se dispare nada pendiente
      setTimeout(() => {
        applyingRemote = false;
      }, 0);
    }
  };

  socket.on("diagram-updated", onDiagramUpdated);

  // 3) Emitir cada cambio local de nodes/edges con throttle
  const emitUpdate = throttle(() => {
    if (applyingRemote) return;
    const st = useDiagramStore.getState();
    socket.emit("update-diagram", {
      id: diagramId,
      model: {
        nodes: st.nodes,
        edges: st.edges,
        metadata: {
          lastModified: new Date().toISOString(),
          version: "1.0",
        },
      },
    });
  }, 0);

  // Suscribirse SOLO a las partes que nos interesan (gracias a subscribeWithSelector)
  const unsubNodes = useDiagramStore.subscribe((s) => s.nodes, emitUpdate);
  const unsubEdges = useDiagramStore.subscribe((s) => s.edges, emitUpdate);

  // 4) Limpieza al salir del editor
  const teardown = () => {
    unsubNodes();
    unsubEdges();
    socket.off("diagram-updated", onDiagramUpdated);
    socket.emit("leave-diagram", { diagramId });
  };

  return teardown;
}
