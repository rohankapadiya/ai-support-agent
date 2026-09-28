"use client";
import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const EXPECTED_WAKE_SECONDS = 50; // typical Render free-tier cold start

export type BackendStatus = "connecting" | "waking" | "live";

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("connecting");
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const statusRef = useRef<BackendStatus>("connecting");

  // Ping /health until the server answers, then re-check every 30s
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = (next: BackendStatus) => {
      statusRef.current = next;
      setStatus(next);
    };

    const ping = async () => {
      const controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`${API}/health`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(abortTimer);
        if (!res.ok) throw new Error("not ok");
        if (cancelled) return;
        update("live");
        timer = setTimeout(ping, 30000);
      } catch {
        clearTimeout(abortTimer);
        if (cancelled) return;
        if (statusRef.current === "live") {
          startRef.current = Date.now(); // it went to sleep, restart the clock
          setElapsed(0);
        }
        update("waking");
        timer = setTimeout(ping, 2000);
      }
    };

    ping();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Tick the timer only while we're waiting
  useEffect(() => {
    if (status === "live") return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [status]);

  return { status, elapsed };
}

export default function ServerStatus({ status, elapsed }: { status: BackendStatus; elapsed: number }) {
  const live = status === "live";
  const progress = Math.min(95, (elapsed / EXPECTED_WAKE_SECONDS) * 100);

  let label = "Server live";
  if (!live) {
    if (elapsed < 3) label = "Connecting to server…";
    else if (elapsed <= 60) label = `Waking up server… ${elapsed}s`;
    else label = `Taking longer than usual… ${elapsed}s`;
  }

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-gray-400">
        <span className="relative flex size-2">
          {!live && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          )}
          <span className={`relative inline-flex size-2 rounded-full ${live ? "bg-emerald-400" : "bg-amber-400"}`} />
        </span>
        {label}
      </p>
      {!live && (
        <div className="mt-1 h-0.5 w-40 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}