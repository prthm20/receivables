"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Money to receive</h1>
      <p className="mt-1 text-sm text-zinc-500">Enter your password to continue.</p>

      <form
        action={action}
        className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoFocus
          autoComplete="current-password"
          className="input"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </main>
  );
}
