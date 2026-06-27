"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSocket } from "./socket-provider";
import { RTC_CONFIG } from "@/src/lib/webrtc-config";

type CallType = "audio" | "video";

type CallerInfo = { id: string; displayName: string | null; username: string | null; avatar: string | null };

type IncomingCall = {
  from: CallerInfo;
  conversationId: string;
  callType: CallType;
  offer: RTCSessionDescriptionInit;
};

type ActiveCall = {
  conversationId: string;
  callType: CallType;
  peerId: string;
  peerName: string;
  status: "ringing" | "connecting" | "connected";
};

type CallContextValue = {
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (toUserId: string, toName: string, conversationId: string, callType: CallType) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
};

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerUserIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    peerUserIdRef.current = null;
    conversationIdRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
  }, []);

  const createPeerConnection = useCallback(
    (toUserId: string) => {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      pc.onicecandidate = (e) => {
        if (e.candidate) socket?.emit("call:ice-candidate", { toUserId, candidate: e.candidate });
      };
      pc.ontrack = (e) => setRemoteStream(e.streams[0]);
      pcRef.current = pc;
      peerUserIdRef.current = toUserId;
      return pc;
    },
    [socket],
  );

  const startCall = useCallback(
    async (toUserId: string, toName: string, conversationId: string, callType: CallType) => {
      if (!socket) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: callType === "video", audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        conversationIdRef.current = conversationId;

        const pc = createPeerConnection(toUserId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call:invite", { toUserId, conversationId, callType, offer });
        setActiveCall({ conversationId, callType, peerId: toUserId, peerName: toName, status: "ringing" });

        ringTimeoutRef.current = setTimeout(() => {
          toast.error("Người dùng không phản hồi");
          socket.emit("call:end", { toUserId, conversationId });
          cleanup();
        }, 30000);
      } catch {
        toast.error("Không thể truy cập camera/microphone");
      }
    },
    [socket, createPeerConnection, cleanup],
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !incomingCall) return;
    const call = incomingCall;
    setIncomingCall(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: call.callType === "video", audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      conversationIdRef.current = call.conversationId;

      const pc = createPeerConnection(call.from.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { toUserId: call.from.id, conversationId: call.conversationId, answer });

      setActiveCall({
        conversationId: call.conversationId,
        callType: call.callType,
        peerId: call.from.id,
        peerName: call.from.displayName ?? call.from.username ?? "Người dùng",
        status: "connected",
      });
    } catch {
      toast.error("Không thể truy cập camera/microphone");
    }
  }, [socket, incomingCall, createPeerConnection]);

  const rejectCall = useCallback(() => {
    if (socket && incomingCall) {
      socket.emit("call:reject", { toUserId: incomingCall.from.id, conversationId: incomingCall.conversationId });
    }
    setIncomingCall(null);
  }, [socket, incomingCall]);

  const endCall = useCallback(() => {
    if (socket && peerUserIdRef.current && conversationIdRef.current) {
      socket.emit("call:end", { toUserId: peerUserIdRef.current, conversationId: conversationIdRef.current });
    }
    cleanup();
  }, [socket, cleanup]);

  useEffect(() => {
    if (!socket) return;

    function handleIncoming(data: IncomingCall) {
      setIncomingCall((prev) => prev ?? data);
    }
    function handleAnswered(data: { conversationId: string; answer: RTCSessionDescriptionInit }) {
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = null;
      }
      pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
      setActiveCall((prev) => (prev ? { ...prev, status: "connected" } : prev));
    }
    function handleIceCandidate(data: { candidate: RTCIceCandidateInit }) {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
    }
    function handleRejected() {
      toast.error("Cuộc gọi bị từ chối");
      cleanup();
    }
    function handleEnded() {
      cleanup();
    }

    socket.on("call:incoming", handleIncoming);
    socket.on("call:answered", handleAnswered);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:rejected", handleRejected);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:answered", handleAnswered);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:rejected", handleRejected);
      socket.off("call:ended", handleEnded);
    };
  }, [socket, cleanup]);

  return (
    <CallContext.Provider
      value={{ incomingCall, activeCall, localStream, remoteStream, startCall, acceptCall, rejectCall, endCall }}
    >
      {children}
    </CallContext.Provider>
  );
}
