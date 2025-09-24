'use client';
import AuthPage from "@/components/auth/auth";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { useSocket } from "@/socket/useSocket";
import { useEffect } from "react";



export default function HomePage() {
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      console.log("Socket conectado:", socket.id);
    }
  }, [socket]);

  return (
    <PublicRoute>
      <AuthPage />
    </PublicRoute>
  );
}
