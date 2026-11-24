import { type Tag } from "@/lib/utils";

interface InsightCardProps {
  streak: number;
  totalCount: number;
  topTag: Tag | null;
}

export default function InsightCard({ streak, totalCount, topTag }: InsightCardProps) {
  let message: string;
  let gradient: string;
  if (streak >= 7) {
    message = `🔥 You're on a ${streak}-day streak! Incredible consistency.`;
    gradient = "from-[#FF6B2B] to-[#FFD23F]";
  } else if (streak >= 3) {
    message = `💪 ${streak} days in a row — you're building momentum!`;
    gradient = "from-[#4A7BF7] to-[#2EC866]";
  } else if (totalCount > 10 && topTag) {
    message = `🏷 You've been crushing it in ${topTag} lately.`;
    gradient = "from-[#8B6CF6] to-[#FF5DA0]";
  } else if (totalCount > 0) {
    message = `🌱 ${totalCount} ta-das so far. Every win counts!`;
    gradient = "from-[#2EC866] to-[#FFD23F]";
  } else {
    message = "✨ Log your first ta-da to start tracking your wins!";
    gradient = "from-[#FFD23F] to-[#FF6B2B]";
  }

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-4`}>
      <p className="text-sm font-bold text-white drop-shadow-sm">{message}</p>
    </div>
  );
}
