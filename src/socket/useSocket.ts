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

export function useSocketListeners(socket: Socket | null) {
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log("Conectado al servidor de sockets con ID:", socket.id);
    };

    const onDisconnect = () => {
      console.log("Desconectado del servidor de sockets");
    };

    const onMessage = (data: any) => {
      console.log("Mensaje recibido:", data);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    // socket.emit("generate-invite", "Hola desde el cliente");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, [socket]);
}
