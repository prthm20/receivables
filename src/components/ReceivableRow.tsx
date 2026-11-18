"use client";

import { useOptimistic, useTransition } from "react";
import { deleteReceivable, setReceived } from "@/actions/receivables";
import { formatDate, formatINR } from "@/lib/money";

type Props = {
  id: string;
  name: string;
  amountPaise: number;
  note: string | null;
  dueDate: Date | null;
  isReceived: boolean;
  receivedAt: Date | null;
};

export function ReceivableRow(r: Props) {
  const [isPending, startTransition] = useTransition();
  const [received, setOptimisticReceived] = useOptimistic(r.isReceived);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = !received && r.dueDate && r.dueDate < today;

  function toggle() {
    startTransition(async () => {
      setOptimisticReceived(!received);
      await setReceived(r.id, !received);
    });
  }

  function remove() {
    if (!window.confirm(`Delete entry for ${r.name}?`)) return;
    startTransition(() => deleteReceivable(r.id));
  }

  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 transition ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <button
        onClick={toggle}
        aria-label={received ? "Mark as not received" : "Mark as received"}
        className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
          received
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-zinc-300 hover:border-emerald-600 dark:border-zinc-600"
        }`}
      >
        {received && (
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${received ? "text-zinc-400 line-through" : ""}`}>
          {r.name}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {r.note && <span>{r.note} · </span>}
          {received && r.receivedAt ? (
            <span className="text-emerald-600">Received {formatDate(r.receivedAt)}</span>
          ) : r.dueDate ? (
            <span className={overdue ? "font-medium text-red-600" : ""}>
              {overdue ? "Overdue · " : "Due "}
              {formatDate(r.dueDate)}
            </span>
          ) : (
            <span>No due date</span>
          )}
        </p>
      </div>

      <p
        className={`shrink-0 font-semibold tabular-nums ${
          received ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {formatINR(r.amountPaise)}
      </p>

      <button
        onClick={remove}
        aria-label="Delete entry"
        className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5h10M6.5 4.5V3h3v1.5M5 4.5l.5 8.5h5l.5-8.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </li>
  );
}
