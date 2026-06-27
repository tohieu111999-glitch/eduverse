"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let activeSocket: Socket | null = null;
    let cancelled = false;

    async function connect() {
      const res = await fetch("/api/realtime/token");
      if (!res.ok || cancelled) return;
      const { token } = await res.json();
      if (cancelled) return;

      activeSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { auth: { token } });
      setSocket(activeSocket);
    }

    connect();

    return () => {
      cancelled = true;
      activeSocket?.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
