import { ListChecks } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { GlassCard } from "@/src/components/ui/glass-card";
import { incrementQuestProgress, getTodayQuestsWithProgress, QUEST_CODES } from "@/src/lib/daily-quests";
import { QuestClient } from "./quest-client";

export async function QuestWidget() {
  const session = await auth();
  if (!session?.user) return null;

  // Auto-complete LOGIN quest on every dashboard visit
  await incrementQuestProgress(session.user.id, QUEST_CODES.LOGIN, 1);

  const rows = await getTodayQuestsWithProgress(session.user.id);
  if (rows.length === 0) return null;

  const completedCount = rows.filter((r) => r.progress?.completed).length;

  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Nhiệm vụ hôm nay</h2>
        </div>
        <span className="text-xs font-medium text-muted">
          <span className={`${completedCount === rows.length ? "text-primary" : ""}`}>
            {completedCount}
          </span>/{rows.length} hoàn thành
        </span>
      </div>
      <QuestClient rows={rows} />
    </GlassCard>
  );
}
