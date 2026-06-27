"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mic, Volume2 } from "lucide-react";
import { checkAnswerAction, submitQuizAttemptAction } from "./actions";
import { isSpeechSynthesisSupported, speak } from "@/src/lib/speech";
import { createSpeechRecognizer, isSpeechRecognitionSupported } from "@/src/lib/speech-recognition";
import { Button } from "@/src/components/ui/button";
import { GlassCard } from "@/src/components/ui/glass-card";
import { TranslateLookup } from "@/src/components/translate/translate-lookup";

type Question = {
  id: string;
  type: "MULTIPLE_CHOICE" | "FILL_BLANK" | "LISTENING" | "SPEAKING";
  prompt: string;
  options: string[];
};

const inputClass =
  "flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary";

export function QuizSession({
  quizId,
  questions,
  language,
}: {
  quizId: string;
  questions: Question[];
  language: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [listening, setListening] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const answersRef = useRef<{ questionId: string; userAnswer: string }[]>([]);

  const question = questions[index];

  async function submitAnswer(userAnswer: string) {
    if (!userAnswer.trim() || pending || feedback) return;
    setPending(true);
    const check = await checkAnswerAction(question.id, userAnswer);
    setPending(false);
    setFeedback(check);
    answersRef.current.push({ questionId: question.id, userAnswer });
  }

  async function handleNext() {
    setFeedback(null);
    setInput("");
    if (index + 1 >= questions.length) {
      setPending(true);
      const res = await submitQuizAttemptAction(quizId, answersRef.current);
      setPending(false);
      if (typeof res.score === "number" && typeof res.total === "number") {
        setResult({ score: res.score, total: res.total });
      }
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handlePlay() {
    if (!speak(question.prompt, language)) {
      toast.error("Trình duyệt không hỗ trợ đọc to văn bản");
    }
  }

  function handleSpeak() {
    const recognizer = createSpeechRecognizer(language);
    if (!recognizer) {
      toast.error("Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy gõ câu trả lời thay thế.");
      return;
    }
    setListening(true);
    recognizer.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      submitAnswer(transcript);
    };
    recognizer.onend = () => setListening(false);
    recognizer.onerror = () => setListening(false);
    recognizer.start();
  }

  if (done) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-semibold">Hoàn thành quiz!</p>
        {result && (
          <p className="mt-1 text-sm text-muted">
            Đúng {result.score}/{result.total} câu. +{result.score * 3} EXP
          </p>
        )}
        <Button onClick={() => router.push(`/learn/quiz/${quizId}`)} className="mt-4">
          Quay lại quiz
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-muted">
        {index + 1} / {questions.length}
      </p>
      <GlassCard className="p-6">
        {question.type === "LISTENING" ? (
          <div className="text-center">
            <button
              onClick={handlePlay}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-cyber text-white"
              aria-label="Nghe"
            >
              <Volume2 className="h-6 w-6" />
            </button>
            <p className="mt-3 text-sm text-muted">Nhấn để nghe, sau đó gõ lại những gì bạn nghe được</p>
            {!isSpeechSynthesisSupported() && (
              <p className="mt-2 text-xs text-red-500">Trình duyệt này không hỗ trợ đọc to văn bản.</p>
            )}
          </div>
        ) : (
          <TranslateLookup>
            <p className="text-center text-lg font-medium">{question.prompt}</p>
          </TranslateLookup>
        )}

        {question.type === "SPEAKING" && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSpeak}
              disabled={listening || Boolean(feedback)}
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white disabled:opacity-50 ${listening ? "bg-red-500" : "gradient-cyber"}`}
              aria-label="Nói"
            >
              <Mic className="h-6 w-6" />
            </button>
            <p className="mt-2 text-xs text-muted">{listening ? "Đang nghe..." : "Nhấn và đọc to cụm từ trên"}</p>
            {!isSpeechRecognitionSupported() && (
              <p className="mt-2 text-xs text-red-500">
                Trình duyệt này không hỗ trợ nhận diện giọng nói — hãy gõ câu trả lời ở dưới.
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitAnswer(input);
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={Boolean(feedback)}
                className={inputClass}
                placeholder="Hoặc gõ câu trả lời..."
              />
              <Button type="submit" disabled={Boolean(feedback) || pending}>
                Kiểm tra
              </Button>
            </form>
          </div>
        )}

        {question.type === "MULTIPLE_CHOICE" && (
          <div className="mt-4 grid gap-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setInput(opt);
                  submitAnswer(opt);
                }}
                disabled={Boolean(feedback)}
                className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-left text-sm transition hover:border-primary disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {question.type === "FILL_BLANK" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAnswer(input);
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={Boolean(feedback)}
              className={inputClass}
              placeholder="Nhập câu trả lời..."
            />
            <Button type="submit" disabled={Boolean(feedback) || pending}>
              Kiểm tra
            </Button>
          </form>
        )}

        {question.type === "LISTENING" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAnswer(input);
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={Boolean(feedback)}
              className={inputClass}
              placeholder="Bạn nghe được gì?"
            />
            <Button type="submit" disabled={Boolean(feedback) || pending}>
              Kiểm tra
            </Button>
          </form>
        )}

        {feedback && (
          <div
            className={`mt-4 rounded-xl p-3 text-sm ${feedback.correct ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
          >
            {feedback.correct ? "Chính xác!" : `Chưa đúng. Đáp án: ${feedback.correctAnswer}`}
          </div>
        )}
      </GlassCard>

      {feedback && (
        <Button onClick={handleNext} disabled={pending} className="w-full">
          {index + 1 >= questions.length ? "Hoàn thành" : "Câu tiếp theo"}
        </Button>
      )}
    </div>
  );
}
