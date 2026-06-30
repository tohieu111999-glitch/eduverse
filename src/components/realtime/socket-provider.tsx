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

      // Always computed from the current page's host, not a fixed env var —
      // a hardcoded "localhost" URL only ever resolves to the visiting
      // device itself, breaking realtime delivery for anyone viewing the
      // site from a different device (LAN IP, real domain, etc.) than
      // whichever machine the app happened to be built on.
      const socketPort = process.env.NEXT_PUBLIC_SOCKET_PORT ?? "3001";
      const socketUrl = `${window.location.protocol}//${window.location.hostname}:${socketPort}`;

      activeSocket = io(socketUrl, { auth: { token } });
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
