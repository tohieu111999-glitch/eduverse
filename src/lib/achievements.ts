import { prisma } from "./prisma";
import { expForLevel } from "./utils";

export const ACHIEVEMENTS = {
  FIRST_POST: {
    name: "Bước Đầu Tiên",
    description: "Đăng bài viết đầu tiên",
    icon: "FileText",
    expReward: 20,
  },
  TEN_POSTS: {
    name: "Cây Bút Cứng",
    description: "Đăng 10 bài viết",
    icon: "PenLine",
    expReward: 50,
  },
  FIRST_SALE: {
    name: "Người Bán Đầu Tiên",
    description: "Bán tài liệu đầu tiên",
    icon: "ShoppingBag",
    expReward: 50,
  },
  FIRST_PURCHASE: {
    name: "Nhà Đầu Tư Tri Thức",
    description: "Mua tài liệu đầu tiên",
    icon: "BookOpenCheck",
    expReward: 20,
  },
  FIRST_TOPUP: {
    name: "Mạnh Thường Quân",
    description: "Nạp coin lần đầu",
    icon: "Coins",
    expReward: 20,
  },
  FIRST_SERVER: {
    name: "Người Kết Nối",
    description: "Tạo nhóm đầu tiên",
    icon: "Users",
    expReward: 30,
  },
  FIRST_REVIEW: {
    name: "Người Học Chăm Chỉ",
    description: "Hoàn thành ôn tập thẻ ghi nhớ đầu tiên",
    icon: "BookOpenCheck",
    expReward: 20,
  },
  FIRST_QUIZ: {
    name: "Nhà Vô Địch Mini Quiz",
    description: "Hoàn thành bài mini quiz đầu tiên",
    icon: "Trophy",
    expReward: 20,
  },
  FIRST_COURSE_ENROLLED: {
    name: "Học Viên Mới",
    description: "Đăng ký khoá học đầu tiên",
    icon: "GraduationCap",
    expReward: 20,
  },
  FIRST_COURSE_COMPLETED: {
    name: "Tốt Nghiệp",
    description: "Hoàn thành khoá học đầu tiên",
    icon: "Award",
    expReward: 50,
  },
  FIRST_COURSE_PUBLISHED: {
    name: "Giảng Viên Mới",
    description: "Khoá học đầu tiên được duyệt",
    icon: "Presentation",
    expReward: 50,
  },
  STREAK_7: {
    name: "Chuỗi 7 Ngày",
    description: "Học liên tục 7 ngày",
    icon: "Flame",
    expReward: 50,
  },
  STREAK_30: {
    name: "Chuỗi 30 Ngày",
    description: "Học liên tục 30 ngày",
    icon: "Flame",
    expReward: 100,
  },
  STREAK_100: {
    name: "Chuỗi 100 Ngày",
    description: "Học liên tục 100 ngày",
    icon: "Crown",
    expReward: 200,
  },
  LEVEL_10: {
    name: "Học Viên",
    description: "Đạt cấp độ 10",
    icon: "Trophy",
    expReward: 0,
  },
  LEVEL_20: {
    name: "Chuyên Gia",
    description: "Đạt cấp độ 20",
    icon: "Trophy",
    expReward: 0,
  },
  LEVEL_50: {
    name: "Học Giả",
    description: "Đạt cấp độ 50",
    icon: "Crown",
    expReward: 0,
  },
  LEVEL_100: {
    name: "Huyền Thoại",
    description: "Đạt cấp độ 100",
    icon: "Crown",
    expReward: 0,
  },
} as const;

export type AchievementCode = keyof typeof ACHIEVEMENTS;

export async function awardAchievement(userId: string, code: AchievementCode) {
  const definition = ACHIEVEMENTS[code];

  const achievement = await prisma.achievement.upsert({
    where: { code },
    create: { code, ...definition },
    update: {},
  });

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return;

  await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });

  // Inlined rather than calling gamification.ts's awardExp, which itself calls
  // back into checkLevelAchievements below — avoids a circular import.
  if (achievement.expReward > 0) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { exp: true, level: true } });
    if (user) {
      let exp = user.exp + achievement.expReward;
      let level = user.level;
      while (exp >= expForLevel(level)) {
        exp -= expForLevel(level);
        level += 1;
      }
      await prisma.user.update({ where: { id: userId }, data: { exp, level } });
    }
  }
}

const LEVEL_MILESTONES: [number, AchievementCode][] = [
  [100, "LEVEL_100"],
  [50, "LEVEL_50"],
  [20, "LEVEL_20"],
  [10, "LEVEL_10"],
];

export async function checkLevelAchievements(userId: string, level: number) {
  for (const [threshold, code] of LEVEL_MILESTONES) {
    if (level >= threshold) await awardAchievement(userId, code);
  }
}
