"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReceivable, type FormState } from "@/actions/receivables";

export function AddReceivableForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(
    createReceivable,
    {}
  );

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1.4fr_1fr_1fr] dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input
        name="name"
        placeholder="Who owes you?"
        required
        className="input"
        autoComplete="off"
      />
      <input
        name="amount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0.01"
        placeholder="Amount (₹)"
        required
        className="input"
      />
      <input name="dueDate" type="date" className="input" aria-label="Due date" />
      <input
        name="note"
        placeholder="Note (optional)"
        className="input sm:col-span-2"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Adding…" : "Add entry"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:col-span-3">{state.error}</p>
      )}
    </form>
  );
}
