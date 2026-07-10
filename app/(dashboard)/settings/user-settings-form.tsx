"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  Bell,
  Check,
  Eye,
  Globe,
  Loader2,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Type,
  Volume2,
} from "lucide-react";
import toast from "react-hot-toast";
import { saveUserSettingsAction, resetUserSettingsAction } from "./settings-actions";

type S = {
  darkMode: boolean;
  reminderEnabled: boolean;
  reminderTimesPerDay: number;
  reminderStartHour: number;
  reminderEndHour: number;
  reminderDays: number[];
  showHanViet: boolean;
  learningMode: string;
  phoneticType: string;
  language: string;
  fontSize: number;
  voiceGender: string;
  voiceSpeed: number;
};

const DEFAULT: S = {
  darkMode: false,
  reminderEnabled: false,
  reminderTimesPerDay: 3,
  reminderStartHour: 8,
  reminderEndHour: 21,
  reminderDays: [1, 2, 3, 4, 5, 6, 7],
  showHanViet: true,
  learningMode: "simplified",
  phoneticType: "pinyin",
  language: "vi",
  fontSize: 16,
  voiceGender: "auto",
  voiceSpeed: 1.0,
};

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors
        ${checked ? "bg-primary" : "bg-foreground/20"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function OptionGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition
            ${value === o.value
              ? "bg-primary text-white"
              : "bg-foreground/8 text-muted hover:bg-foreground/12"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-foreground/8 last:border-none">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function SettingGroup({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/3 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-foreground/10 px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

export function UserSettingsForm({ defaultValues }: { defaultValues: Partial<S> }) {
  const [s, setS] = useState<S>({ ...DEFAULT, ...defaultValues });
  const [isPending, startTransition] = useTransition();
  const [resetPending, startReset] = useTransition();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  function update<K extends keyof S>(key: K, value: S[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveUserSettingsAction(s);
      if (result.success) {
        toast.success("Đã lưu cài đặt");
        // Persist to localStorage for immediate app-wide effect
        localStorage.setItem("edv_fontSize", String(s.fontSize));
        localStorage.setItem("edv_voiceGender", s.voiceGender);
        localStorage.setItem("edv_voiceSpeed", String(s.voiceSpeed));
        document.documentElement.style.fontSize = `${s.fontSize}px`;
      } else {
        toast.error(result.error ?? "Lưu thất bại");
      }
    });
  }

  function handleReset() {
    startReset(async () => {
      const result = await resetUserSettingsAction();
      if (result.success) {
        setS(DEFAULT);
        setShowResetDialog(false);
        localStorage.removeItem("edv_fontSize");
        localStorage.removeItem("edv_voiceGender");
        localStorage.removeItem("edv_voiceSpeed");
        document.documentElement.style.fontSize = "";
        toast.success("Đã khôi phục cài đặt gốc");
      }
    });
  }

  function handleDarkModeToggle(val: boolean) {
    update("darkMode", val);
    setTheme(val ? "dark" : "light");
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-1 flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface/80 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-semibold">Cài đặt</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu
        </button>
      </div>

      {/* Giao diện */}
      <SettingGroup icon={Palette} title="Giao diện">
        <SettingRow
          label="Chế độ tối"
          description="Giảm mỏi mắt khi học ban đêm"
          control={<Toggle checked={isDark} onChange={handleDarkModeToggle} />}
        />
        <SettingRow
          label="Đổi chủ đề"
          description="Màu sắc giao diện"
          control={
            <button
              type="button"
              onClick={() => toast("Tính năng sắp ra mắt! 🎨", { icon: "🚧" })}
              className="rounded-xl border border-foreground/10 px-3 py-1.5 text-xs text-muted transition hover:border-primary hover:text-primary"
            >
              Mặc định
            </button>
          }
        />
        <SettingRow
          label="Đổi bố cục"
          description="Cách sắp xếp các phần trên màn hình"
          control={
            <button
              type="button"
              onClick={() => toast("Tính năng sắp ra mắt! 🔲", { icon: "🚧" })}
              className="rounded-xl border border-foreground/10 px-3 py-1.5 text-xs text-muted transition hover:border-primary hover:text-primary"
            >
              Mặc định
            </button>
          }
        />
      </SettingGroup>

      {/* Nhắc nhở học từ vựng */}
      <SettingGroup icon={Bell} title="Nhắc nhở học từ vựng">
        <SettingRow
          label="Bật nhắc nhở"
          control={<Toggle checked={s.reminderEnabled} onChange={(v) => update("reminderEnabled", v)} />}
        />
        {s.reminderEnabled && (
          <>
            <SettingRow
              label="Số lần nhắc / ngày"
              control={
                <OptionGroup
                  options={[1, 2, 3, 5, 10].map((n) => ({ value: n, label: String(n) }))}
                  value={s.reminderTimesPerDay}
                  onChange={(v) => update("reminderTimesPerDay", v)}
                />
              }
            />
            <SettingRow
              label="Giờ bắt đầu"
              control={
                <select
                  value={s.reminderStartHour}
                  onChange={(e) => update("reminderStartHour", parseInt(e.target.value))}
                  className="rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-sm outline-none focus:border-primary"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                  ))}
                </select>
              }
            />
            <SettingRow
              label="Giờ dừng"
              control={
                <select
                  value={s.reminderEndHour}
                  onChange={(e) => update("reminderEndHour", parseInt(e.target.value))}
                  className="rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-sm outline-none focus:border-primary"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                  ))}
                </select>
              }
            />
            <SettingRow
              label="Ngày trong tuần"
              control={
                <div className="flex gap-1">
                  {WEEK_DAYS.map((d, i) => {
                    const day = i + 1;
                    const on = s.reminderDays.includes(day);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() =>
                          update(
                            "reminderDays",
                            on ? s.reminderDays.filter((x) => x !== day) : [...s.reminderDays, day].sort(),
                          )
                        }
                        className={`h-8 w-8 rounded-full text-xs font-semibold transition
                          ${on ? "bg-primary text-white" : "bg-foreground/8 text-muted hover:bg-foreground/15"}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              }
            />
          </>
        )}
      </SettingGroup>

      {/* Hiển thị */}
      <SettingGroup icon={Eye} title="Hiển thị">
        <SettingRow
          label="Hiện Hán Việt"
          description="Hiển thị nghĩa Hán Việt bên cạnh từ"
          control={<Toggle checked={s.showHanViet} onChange={(v) => update("showHanViet", v)} />}
        />
        <SettingRow
          label="Chế độ học"
          control={
            <OptionGroup
              options={[
                { value: "simplified", label: "Giản thể" },
                { value: "traditional", label: "Phồn thể" },
                { value: "both", label: "Giản + Phồn" },
              ]}
              value={s.learningMode}
              onChange={(v) => update("learningMode", v)}
            />
          }
        />
        <SettingRow
          label="Kiểu phiên âm"
          control={
            <OptionGroup
              options={[
                { value: "pinyin", label: "Bính âm" },
                { value: "bopomofo", label: "Chú âm" },
              ]}
              value={s.phoneticType}
              onChange={(v) => update("phoneticType", v)}
            />
          }
        />
      </SettingGroup>

      {/* Chung */}
      <SettingGroup icon={Globe} title="Chung">
        <SettingRow
          label="Ngôn ngữ"
          control={
            <div className="flex items-center gap-2 rounded-xl border border-foreground/10 px-3 py-1.5">
              <span>🇻🇳</span>
              <span className="text-sm">Tiếng Việt</span>
            </div>
          }
        />
        <SettingRow
          label="Cỡ chữ"
          control={
            <OptionGroup
              options={[
                { value: 16, label: "16" },
                { value: 19, label: "19" },
                { value: 22, label: "22" },
              ]}
              value={s.fontSize}
              onChange={(v) => {
                update("fontSize", v);
                document.documentElement.style.fontSize = `${v}px`;
              }}
            />
          }
        />
      </SettingGroup>

      {/* Giọng nói */}
      <SettingGroup icon={Volume2} title="Giọng nói">
        <SettingRow
          label="Giọng nói"
          control={
            <OptionGroup
              options={[
                { value: "auto", label: "Auto" },
                { value: "male", label: "Nam" },
                { value: "female", label: "Nữ" },
              ]}
              value={s.voiceGender}
              onChange={(v) => update("voiceGender", v)}
            />
          }
        />
        <SettingRow
          label="Tốc độ"
          control={
            <OptionGroup
              options={[
                { value: 0.75, label: "0.75×" },
                { value: 1.0, label: "1.0×" },
                { value: 1.25, label: "1.25×" },
              ]}
              value={s.voiceSpeed}
              onChange={(v) => update("voiceSpeed", v)}
            />
          }
        />
      </SettingGroup>

      {/* Khôi phục cài đặt gốc */}
      <button
        type="button"
        onClick={() => setShowResetDialog(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 py-3.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
      >
        <RotateCcw className="h-4 w-4" />
        Khôi phục cài đặt gốc
      </button>

      {/* Reset confirm dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-foreground/10 bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold">Khôi phục cài đặt?</h3>
            </div>
            <p className="text-sm text-muted">
              Tất cả cài đặt sẽ được đặt về mặc định. Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="flex-1 rounded-xl border border-foreground/10 py-2.5 text-sm font-medium transition hover:bg-foreground/8"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetPending}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {resetPending ? "Đang khôi phục..." : "Khôi phục"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
