"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, ChevronDown, Wrench } from "lucide-react";

export type Trace = {
  tool: string;
  args: Record<string, unknown>;
  result: { error?: string } & Record<string, unknown>;
};
export type Msg = { role: "user" | "assistant"; content: string; trace?: Trace[] };

function ToolChip({ t }: { t: Trace }) {
  const [open, setOpen] = useState(false);
  const failed = !!t.result?.error;
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-400 transition hover:text-gray-200"
      >
        <span className={`size-1.5 rounded-full ${failed ? "bg-amber-400" : "bg-emerald-400"}`} />
        <Wrench className="size-3" />
        {t.tool}({Object.values(t.args).join(", ")})
        <ChevronDown className={`size-3 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <pre className="scroll-thin mt-1 max-h-48 overflow-auto rounded-lg bg-black/40 p-2 text-[11px] text-emerald-200">
          {JSON.stringify(t.result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function ChatMessage({ m }: { m: Msg }) {
  if (m.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm text-white shadow-lg shadow-indigo-500/20">
          {m.content}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-indigo-300">
        <Bot className="size-4" />
      </div>
      <div className="min-w-0 max-w-[85%]">
        <div className="glass rounded-2xl rounded-tl-md px-4 py-2.5 text-sm leading-relaxed text-gray-200 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5">
          <ReactMarkdown>{m.content}</ReactMarkdown>
        </div>
        {m.trace?.map((t, i) => (
          <ToolChip key={i} t={t} />
        ))}
      </div>
    </motion.div>
  );
}