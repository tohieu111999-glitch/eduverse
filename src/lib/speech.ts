// Text-to-speech for "Nghe hiểu" (listening) questions — browser-native
// SpeechSynthesis, no API key or server round-trip needed.
export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: string): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
  return true;
}
