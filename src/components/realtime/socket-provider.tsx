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

      // NEXT_PUBLIC_SOCKET_URL: explicit full URL for production (e.g. Railway).
      // Falls back to hostname:port for LAN/local dev where both run on the
      // same machine — a fixed "localhost" would break cross-device access.
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ??
        `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_SOCKET_PORT ?? "3001"}`;

      activeSocket = io(socketUrl, { auth: { token }, transports: ["websocket", "polling"] });
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
