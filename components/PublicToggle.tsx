"use client";

interface PublicToggleProps {
  isPublic: boolean;
  onChange: (value: boolean) => void;
}

export default function PublicToggle({ isPublic, onChange }: PublicToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={`relative w-10 h-6 rounded-full transition-colors ${
          isPublic ? "bg-[#2EC866]" : "bg-[#E2DFD5]"
        }`}
        onClick={() => onChange(!isPublic)}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
            isPublic ? "left-5" : "left-1"
          }`}
        />
      </div>
      <span className="text-sm text-[#8B8680] font-semibold">
        {isPublic ? "Sharing publicly" : "Private"}
      </span>
    </label>
  );
}
