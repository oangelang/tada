export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize = size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-lg";

  return (
    <div className={`font-[var(--font-heading)] font-extrabold ${textSize} flex items-center gap-1`}>
      <span className="text-[#8B8680] line-through decoration-[#FF6B2B] decoration-2">
        to-do
      </span>
      <span className="text-[#8B8680] mx-0.5">&rarr;</span>
      <span className="bg-gradient-to-r from-[#FF6B2B] via-[#FFD23F] to-[#2EC866] bg-clip-text text-transparent">
        ta-da!
      </span>
    </div>
  );
}
