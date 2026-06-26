"use client";

import { Search } from "lucide-react";

type CoachSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function CoachSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: CoachSearchInputProps) {
  return (
    <div className={className}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]"
          aria-hidden
        />
        <input
          type="search"
          className="coach-input coach-input-icon"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
