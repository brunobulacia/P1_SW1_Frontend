import { Manager } from "socket.io-client";

export const connectToServer = () => {
  const manager = new Manager("http://localhost:4000");
  const socket = manager.socket("/");
};
