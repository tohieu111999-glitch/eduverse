"use client";

import { useCallback, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCall } from "./call-provider";
import { GlassCard } from "@/src/components/ui/glass-card";

// A callback ref (not useEffect + object ref) so srcObject gets set correctly
// however mount and stream-ready order interleave: when the stream changes
// after the <video> is already mounted, React re-invokes this callback because
// its identity changes with `stream`; when the <video> mounts after the stream
// was already set (e.g. the call-acceptor's local preview, whose state lands
// across several renders before the element exists), React still invokes it
// with the current `stream` the moment the node attaches. A plain
// `useEffect` reading `ref.current` only catches the first case.
function useMediaRef(stream: MediaStream | null) {
  return useCallback(
    (node: HTMLVideoElement | null) => {
      if (node) node.srcObject = stream;
    },
    [stream],
  );
}

export function CallUI() {
  const { incomingCall, activeCall, localStream, remoteStream, acceptCall, rejectCall, endCall } = useCall();
  const localVideoRef = useMediaRef(localStream);
  const remoteVideoRef = useMediaRef(remoteStream);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  function toggleMute() {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted((m) => !m);
  }

  function toggleCamera() {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = cameraOff));
    setCameraOff((c) => !c);
  }

  const callerName = incomingCall ? incomingCall.from.displayName ?? incomingCall.from.username ?? "Người dùng" : "";

  return (
    <>
      {incomingCall && !activeCall && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <GlassCard className="flex items-center gap-4 p-4">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full gradient-cyber text-sm font-semibold text-white">
              {incomingCall.from.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={incomingCall.from.avatar} alt={callerName} className="h-full w-full object-cover" />
              ) : (
                callerName.charAt(0).toUpperCase()
              )}
            </span>
            <div>
              <p className="text-sm font-medium">{callerName}</p>
              <p className="text-xs text-muted">{incomingCall.callType === "video" ? "Gọi video đến..." : "Gọi điện đến..."}</p>
            </div>
            <button
              onClick={rejectCall}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/15 text-red-500 hover:bg-red-500/25"
              aria-label="Từ chối"
            >
              <PhoneOff className="h-4 w-4" />
            </button>
            <button
              onClick={acceptCall}
              className="flex h-9 w-9 items-center justify-center rounded-full gradient-cyber text-white"
              aria-label="Trả lời"
            >
              <Phone className="h-4 w-4" />
            </button>
          </GlassCard>
        </div>
      )}

      {activeCall && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
          {activeCall.callType === "video" ? (
            <div className="relative h-full w-full">
              <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-28 right-4 h-32 w-24 rounded-xl border border-white/20 object-cover"
              />
              <div className="absolute left-0 top-0 w-full p-4 text-center text-white">
                <p className="text-sm font-medium">{activeCall.peerName}</p>
                <p className="text-xs text-white/60">{activeCall.status === "ringing" ? "Đang gọi..." : "Đang kết nối"}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-white">
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              <span className="flex h-24 w-24 items-center justify-center rounded-full gradient-cyber text-3xl font-semibold">
                {activeCall.peerName.charAt(0).toUpperCase()}
              </span>
              <p className="mt-4 text-lg font-medium">{activeCall.peerName}</p>
              <p className="text-sm text-white/60">{activeCall.status === "ringing" ? "Đang gọi..." : "Đang kết nối"}</p>
            </div>
          )}

          <div className="absolute bottom-8 flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Tắt/mở mic"
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            {activeCall.callType === "video" && (
              <button
                onClick={toggleCamera}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Tắt/mở camera"
              >
                {cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={endCall}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              aria-label="Kết thúc cuộc gọi"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
