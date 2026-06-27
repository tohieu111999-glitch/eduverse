// Free public STUN server (no API key) — sufficient for most home/office NATs.
// Calls across more restrictive networks would additionally need a TURN
// server (self-hosted coturn, or a paid service like Twilio/Xirsys) — out of
// scope for this pass.
export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
