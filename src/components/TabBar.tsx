"use client";

import { motion } from "framer-motion";
import { Radio, CalendarDays, Ticket } from "lucide-react";

export type Tab = "ingressos" | "agora" | "agenda";
export const TAB_ORDER: Tab[] = ["ingressos", "agora", "agenda"];

export default function TabBar({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  const items: { id: Tab; label: string; icon: typeof Radio }[] = [
    { id: "ingressos", label: "Ingressos", icon: Ticket },
    { id: "agora", label: "Agora", icon: Radio },
    { id: "agenda", label: "Agenda", icon: CalendarDays },
  ];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center">
      <div
        className="pointer-events-auto flex gap-1 rounded-full border border-white/10 bg-ink-deep/70 p-1.5 backdrop-blur-xl"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}
      >
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(item.id)}
              className={`relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${
                active ? "text-ink-deep" : "text-mist"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-lime"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <Icon size={17} strokeWidth={1.75} className="relative" />
              <span className="relative">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
