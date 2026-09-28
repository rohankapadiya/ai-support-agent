"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Info, Package, RotateCcw, SendHorizonal, ShoppingBag } from "lucide-react";
import ChatMessage, { type Msg } from "./components/ChatMessage";
import { type Action, Capabilities, CantBox, QuickChips } from "./components/Capabilities";
import SidePanel, { type Customer } from "./components/SidePanel";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cid, setCid] = useState(1);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const me = customers.find((c) => c.id === cid);
  const initials = me ? me.name.split(" ").map((w) => w[0]).join("") : "?";

  function loadCustomers() {
    fetch(`${API}/customers`).then((r) => r.json()).then(setCustomers).catch(() => {});
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: cid,
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setMsgs([...next, { role: "assistant", content: data.reply, trace: data.trace }]);
    } catch {
      setMsgs([
        ...next,
        { role: "assistant", content: "I couldn't reach the server. Please try again in a moment." },
      ]);
    }
    setLoading(false);
    setRefreshKey((k) => k + 1);
    loadCustomers();
  }

  function ask(text: string, mode: "send" | "fill") {
    setPanelOpen(false);
    if (mode === "send") {
      send(text);
    } else {
      setInput(text);
      inputRef.current?.focus();
    }
  }

  function pick(a: Action) {
    ask(a.text, a.mode);
  }

  function newChat() {
    setMsgs([]);
    setInput("");
    setShowLimits(false);
  }

  async function resetData() {
    try {
      await fetch(`${API}/reset`, { method: "POST" });
    } catch {}
    newChat();
    setRefreshKey((k) => k + 1);
    loadCustomers();
  }

  const panel = (onClose?: () => void) => (
    <SidePanel customer={me} refreshKey={refreshKey} onAsk={ask} onReset={resetData} onClose={onClose} />
  );

  return (
    <div className="app-bg h-dvh">
      <div className="mx-auto flex h-full max-w-6xl gap-4 px-4">
        {/* Chat column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-2 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
                <ShoppingBag className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight text-white">Support Assistant</h1>
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPanelOpen(true)}
                className="glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs text-gray-300 transition hover:text-white lg:hidden"
              >
                <Package className="size-4" /> Orders
              </button>
              <button
                onClick={newChat}
                title="New chat"
                className="glass grid size-9 place-items-center rounded-xl text-gray-300 transition hover:text-white"
              >
                <RotateCcw className="size-4" />
              </button>
              <div className="glass flex items-center gap-2 rounded-xl py-1 pl-1 pr-2">
                <span className="grid size-7 place-items-center rounded-lg bg-indigo-500/30 text-xs font-medium text-indigo-200">
                  {initials}
                </span>
                <select
                  value={cid}
                  onChange={(e) => { setCid(+e.target.value); newChat(); }}
                  className="max-w-[9rem] cursor-pointer bg-transparent text-sm text-gray-200 outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#12121c]">
                      {c.name} · {c.order_count ?? 0} orders
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <div className="scroll-thin flex-1 space-y-4 overflow-y-auto pb-4 pr-1">
            {msgs.length === 0 ? (
              <Capabilities name={me?.name.split(" ")[0] ?? ""} onPick={pick} />
            ) : (
              msgs.map((m, i) => <ChatMessage key={i} m={m} />)
            )}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded-xl bg-white/10 text-indigo-300">
                  <Bot className="size-4" />
                </div>
                <div className="glass flex gap-1 rounded-2xl px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-indigo-300"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottom} />
          </div>

          <div className="pb-4">
            <AnimatePresence>
              {showLimits && msgs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 overflow-hidden"
                >
                  <CantBox />
                </motion.div>
              )}
            </AnimatePresence>

            {msgs.length > 0 && (
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setShowLimits(!showLimits)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-500/20"
                >
                  <Info className="size-3.5" /> What I can't do
                </button>
                <div className="min-w-0 flex-1">
                  <QuickChips onPick={pick} />
                </div>
              </div>
            )}

            <div className="glass flex items-center gap-2 rounded-2xl p-2 focus-within:border-indigo-400/50">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type your question, or pick an option above…"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white transition hover:brightness-110 disabled:opacity-40"
              >
                <SendHorizonal className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop side panel */}
        <aside className="hidden h-full w-[22rem] shrink-0 py-4 lg:block">{panel()}</aside>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end bg-black/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPanelOpen(false)}
          >
            <motion.div
              className="h-full w-[92%] max-w-sm p-3"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full rounded-2xl bg-[#0d0d16]">{panel(() => setPanelOpen(false))}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}