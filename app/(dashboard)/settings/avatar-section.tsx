"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Image as ImageIcon, Shuffle, Sparkles } from "lucide-react";
import { uploadAvatarAction, setGeneratedAvatarAction, type AvatarState } from "./actions";
import { AVATAR_STYLE_OPTIONS, generateAvatarSvg, type AvatarStyle } from "@/src/lib/avatar";
import { Button } from "@/src/components/ui/button";

const initialState: AvatarState = {};

function randomSeed() {
  return Math.random().toString(36).slice(2, 10);
}

export function AvatarSection({ currentAvatar, username }: { currentAvatar: string | null; username: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"upload" | "generate">("upload");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadAction, uploadPending] = useActionState(async (prev: AvatarState, fd: FormData) => {
    const result = await uploadAvatarAction(prev, fd);
    if (result.success) {
      toast.success("Đã cập nhật avatar");
      setPreviewUrl(null);
      router.refresh();
    }
    return result;
  }, initialState);

  const [style, setStyle] = useState<AvatarStyle>("avataaars");
  const [seed, setSeed] = useState(username || randomSeed());
  const svgPreview = useMemo(() => generateAvatarSvg(style, seed), [style, seed]);
  const [generateState, generateAction, generatePending] = useActionState(async (prev: AvatarState, fd: FormData) => {
    const result = await setGeneratedAvatarAction(prev, fd);
    if (result.success) {
      toast.success("Đã cập nhật avatar");
      router.refresh();
    }
    return result;
  }, initialState);

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-foreground/10">
          {(previewUrl ?? currentAvatar) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl ?? currentAvatar ?? ""} alt="Avatar hiện tại" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("upload")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${mode === "upload" ? "gradient-cyber text-white" : "bg-foreground/5 text-muted"}`}
          >
            <ImageIcon className="mr-1 inline h-3.5 w-3.5" />
            Tải ảnh lên
          </button>
          <button
            onClick={() => setMode("generate")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${mode === "generate" ? "gradient-cyber text-white" : "bg-foreground/5 text-muted"}`}
          >
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            Tạo avatar hoạt hình
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <form action={uploadAction} className="space-y-2">
          <input
            ref={fileInputRef}
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          {uploadState.error && <p className="text-xs text-red-500">{uploadState.error}</p>}
          <Button type="submit" disabled={uploadPending} variant="glass">
            {uploadPending ? "Đang tải lên..." : "Lưu ảnh đại diện"}
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <div
            className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-foreground/10"
            dangerouslySetInnerHTML={{ __html: svgPreview }}
          />
          <div className="flex gap-2">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as AvatarStyle)}
              className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {AVATAR_STYLE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSeed(randomSeed())}
              className="flex items-center gap-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm text-muted hover:bg-foreground/10"
            >
              <Shuffle className="h-4 w-4" />
              Ngẫu nhiên
            </button>
          </div>
          <form action={generateAction}>
            <input type="hidden" name="style" value={style} />
            <input type="hidden" name="seed" value={seed} />
            {generateState.error && <p className="mb-2 text-xs text-red-500">{generateState.error}</p>}
            <Button type="submit" disabled={generatePending} variant="glass" className="w-full">
              {generatePending ? "Đang lưu..." : "Lưu avatar này"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
