// src/hooks/useSocket.ts
"use client";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => console.log("🔌 Socket conectado:", s.id);
    const onDisconnect = () => console.log("🔌 Socket desconectado");

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      // NO desconectar aquí si quieres reusar socket across pages
      // s.disconnect();
    };
  }, []);

  return socket;
}
