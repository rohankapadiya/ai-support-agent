"use client";
import { motion } from "framer-motion";
import {
  PackageSearch, XCircle, MapPin, Boxes, UserRound, LifeBuoy, X, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Action = {
  icon: LucideIcon;
  label: string;
  hint: string;
  text: string;
  mode: "send" | "fill";
};

export const ACTIONS: Action[] = [
  { icon: PackageSearch, label: "Track an order", hint: "Status, tracking number, delivery date",
    text: "Where is my order ", mode: "fill" },
  { icon: XCircle, label: "Cancel an order", hint: "Only while it's still processing",
    text: "I want to cancel order ", mode: "fill" },
  { icon: MapPin, label: "Change address", hint: "Only while it's still processing",
    text: "Change the delivery address of order ", mode: "fill" },
  { icon: Boxes, label: "Check stock", hint: "Availability and price",
    text: "Do you have a Smart Watch in stock?", mode: "send" },
  { icon: UserRound, label: "My profile", hint: "Name, email and phone on file",
    text: "Show my account details", mode: "send" },
  { icon: LifeBuoy, label: "Report a problem", hint: "Creates a ticket for our team",
    text: "My item arrived damaged and I need help", mode: "send" },
];

export const CANT = [
  "Cancel or edit orders that have already shipped",
  "Issue refunds or take payments (I'll raise a ticket instead)",
  "Place new orders",
  "Show other customers' orders",
  "Chat about topics outside this store",
];

export function CantBox() {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-2 text-sm font-medium text-rose-300">What I can't do</p>
      <ul className="space-y-1.5">
        {CANT.map((t) => (
          <li key={t} className="flex items-start gap-2 text-sm text-gray-400">
            <X className="mt-0.5 size-4 shrink-0 text-rose-400" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Capabilities({ name, onPick }: { name: string; onPick: (a: Action) => void }) {
  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
          <Sparkles className="size-6 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          Hi {name || "there"}, how can I help?
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Tap a card below or just type your own question.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(a)}
              className="glass group flex items-center gap-3 rounded-2xl p-4 text-left transition hover:border-indigo-400/40 hover:bg-white/[0.07]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-500/25">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-white">{a.label}</span>
                <span className="block text-xs text-gray-400">{a.hint}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4">
        <CantBox />
      </div>
    </div>
  );
}

export function QuickChips({ onPick }: { onPick: (a: Action) => void }) {
  return (
    <div className="scroll-thin flex gap-2 overflow-x-auto pb-2">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            onClick={() => onPick(a)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white"
          >
            <Icon className="size-3.5" />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}