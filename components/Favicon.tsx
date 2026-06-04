"use client";
import { useState } from "react";
import { favicon } from "@/lib/tools";

type Props = {
  domain: string;
  name: string;
  size?: number;
  className?: string;
  rounded?: string;
};

export function Favicon({ domain, name, size = 40, className = "", rounded = "" }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className={`font-display font-extrabold text-[15px] flex items-center justify-center w-full h-full ${className}`}
        style={{ color: "var(--text-2)" }}
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={favicon(domain, 64)}
      alt={`${name} logo`}
      className={className}
      onError={() => setFailed(true)}
      // Explicit width/height prevents Cumulative Layout Shift
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size, objectFit: "cover", borderRadius: rounded || undefined }}
    />
  );
}
