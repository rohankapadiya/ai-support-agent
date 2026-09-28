"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Mail,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Search,
  Ticket,
  Truck,
  X,
  XCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  order_count?: number;
};
type Order = {
  id: number;
  product: string;
  price: number;
  qty: number;
  total: number;
  status: string;
  address: string;
  tracking: string | null;
  eta: string;
};
type TicketRow = {
  id: number;
  subject: string;
  description: string;
  status: string;
  created_at: string;
};

const BADGE: Record<string, string> = {
  processing: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  shipped: "border-sky-400/30 bg-sky-500/15 text-sky-300",
  delivered: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  cancelled: "border-rose-400/30 bg-rose-500/15 text-rose-300",
  open: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  in_progress: "border-sky-400/30 bg-sky-500/15 text-sky-300",
  resolved: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const label = (s: string) => s.replace("_", " ");

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] capitalize ${BADGE[status] ?? ""}`}
    >
      {label(status)}
    </span>
  );
}

function Act({
  icon: Icon,
  text,
  onClick,
  disabled,
  why,
}: {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  why?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? why : undefined}
      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-gray-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:bg-white/5 disabled:hover:text-gray-300"
    >
      <Icon className="size-3" /> {text}
    </button>
  );
}

export default function SidePanel({
  customer,
  refreshKey,
  onAsk,
  onReset,
  onClose,
}: {
  customer?: Customer;
  refreshKey: number;
  onAsk: (text: string, mode: "send" | "fill") => void;
  onReset: () => void;
  onClose?: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [tab, setTab] = useState<"orders" | "tickets">("orders");
  const [flash, setFlash] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const prev = useRef<{ cid: number; seen: Record<string, string> } | null>(
    null,
  );
  const cid = customer?.id;

  useEffect(() => {
    if (!cid) return;
    let stale = false;
    if (prev.current?.cid !== cid) {
      setReady(false);
      setOrders([]);
      setTickets([]);
    }
    Promise.all([
      fetch(`${API}/customers/${cid}/orders`).then((r) => r.json()),
      fetch(`${API}/customers/${cid}/tickets`).then((r) => r.json()),
    ])
      .then(([o, t]: [Order[], TicketRow[]]) => {
        if (stale) return;
        const seen: Record<string, string> = {};
        o.forEach((x) => (seen["o" + x.id] = x.status));
        t.forEach((x) => (seen["t" + x.id] = x.status));
        const before = prev.current;
        if (before && before.cid === cid) {
          const changed = Object.keys(seen).filter(
            (k) => before.seen[k] !== seen[k],
          );
          if (changed.length) {
            setFlash(changed);
            setTimeout(() => setFlash([]), 2500);
          }
        }
        prev.current = { cid, seen };
        setOrders(o);
        setTickets(t);
        setReady(true);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [cid, refreshKey]);

  const ring = (k: string) =>
    flash.includes(k) ? "ring-2 ring-indigo-400/70" : "ring-0 ring-transparent";

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-white">
              {customer?.name ?? "Loading…"}
            </p>
            <p className="text-[11px] text-gray-500">
              Customer #{customer?.id}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="mt-2 space-y-1 text-xs text-gray-400">
          <p className="flex items-center gap-2">
            <Mail className="size-3.5" /> {customer?.email}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-3.5" /> {customer?.phone}
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/10 p-2">
        {(
          [
            ["orders", "Orders", Package, orders.length],
            ["tickets", "Tickets", Ticket, tickets.length],
          ] as const
        ).map(([key, text, Icon, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition ${
              tab === key ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab === key && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-white/10"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="size-3.5" /> {text}
              <span className="rounded-full bg-white/10 px-1.5 text-[10px]">
                {count}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-3">
        {!ready && (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>
        )}

        {ready && tab === "orders" && (
          <>
            <p className="text-[11px] text-gray-500">
              Use the buttons on an order to try the assistant.
            </p>
            {orders.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                No orders yet.
              </p>
            )}
            {orders.map((o) => {
              const editable = o.status === "processing";
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-shadow duration-500 ${ring("o" + o.id)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-md font-medium text-white">
                        Order #{o.id}
                      </p>

                      <p className="text-[11px]  text-white">
                        {o.product}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Qty · {o.qty} × {inr(o.price)} ={" "}
                        <span className="text-gray-300">{inr(o.total)}</span>
                      </p>
                    </div>
                    <Badge status={o.status} />
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <p className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" /> {o.address}
                    </p>
                    {o.status !== "processing" && o.status !== "cancelled" && (
                      <p className="flex items-center gap-2">
                        <Truck className="size-3.5 shrink-0" /> {o.tracking}
                      </p>
                    )}
                    {o.status !== "cancelled" && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {o.status === "delivered"
                          ? "Delivered"
                          : "Expected"}{" "}
                        {o.eta}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Act
                      icon={Search}
                      text="Track"
                      onClick={() =>
                        onAsk(`Where is my order ${o.id}?`, "send")
                      }
                    />
                    <Act
                      icon={XCircle}
                      text="Cancel"
                      disabled={!editable}
                      why={`Not possible, this order is ${o.status}`}
                      onClick={() =>
                        onAsk(`I want to cancel order ${o.id}`, "send")
                      }
                    />
                    <Act
                      icon={MapPin}
                      text="Change address"
                      disabled={!editable}
                      why={`Not possible, this order is ${o.status}`}
                      onClick={() =>
                        onAsk(
                          `Change the delivery address of order ${o.id} to `,
                          "fill",
                        )
                      }
                    />
                  </div>
                </motion.div>
              );
            })}
          </>
        )}

        {ready && tab === "tickets" && (
          <>
            {tickets.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                No tickets yet. Try "Report a problem" in the chat and one will
                appear here.
              </p>
            )}
            {tickets.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-shadow duration-500 ${ring("t" + t.id)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{t.subject}</p>
                  <Badge status={t.status} />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  {t.description}
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  Ticket #{t.id} · {t.created_at.slice(0, 10)}
                </p>
              </motion.div>
            ))}
          </>
        )}
      </div>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
        >
          <RotateCcw className="size-3" /> Reset demo data
        </button>
      </div>
    </div>
  );
}
