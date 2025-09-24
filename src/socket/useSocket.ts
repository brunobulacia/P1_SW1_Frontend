// src/socket/useSocket.ts
"use client";
import { useEffect, useState } from "react";
import { Manager, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

export function useSocket(): Socket<DefaultEventsMap, DefaultEventsMap> | null {
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  useEffect(() => {
    const manager = new Manager("http://localhost:4000");
    const socketInstance = manager.socket("/");
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, []);

  return socket;
}
