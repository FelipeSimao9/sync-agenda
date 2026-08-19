"use client";

import { motion } from "framer-motion";
import { SafeImg } from "./ui";

type Props = {
  name: string;
  photo?: string;
  size?: number;
  /** desenha o anel (pathLength 0→1) na entrada */
  animateRing?: boolean;
  /** anel lime parcial em volta da foto (padrão true) */
  ring?: boolean;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * Avatar circular com anel `lime` parcial (~270°) — citação direta das artes
 * do evento. Foto ausente ou quebrada cai em iniciais lime sobre ink-deep.
 */
export default function Avatar({
  name,
  photo,
  size = 56,
  animateRing = false,
  ring = true,
}: Props) {
  const stroke = Math.max(2, Math.round(size / 24));
  const pad = ring ? stroke + 3 : 0;
  const r = (size - stroke) / 2;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {ring && (
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        {animateRing ? (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E5F27E"
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        ) : (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E5F27E"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        )}
      </svg>
      )}
      <div
        className="absolute overflow-hidden rounded-full bg-ink-deep"
        style={{ inset: pad }}
      >
        <SafeImg
          src={photo}
          alt={name}
          className="h-full w-full object-cover"
          fallback={
            <div
              className="flex h-full w-full items-center justify-center font-bold text-lime"
              style={{ fontSize: Math.max(11, size * 0.28) }}
            >
              {initials(name)}
            </div>
          }
        />
      </div>
    </div>
  );
}
