import Link from "next/link";
import { logout } from "@/actions/auth";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { AddReceivableForm } from "@/components/AddReceivableForm";
import { ReceivableRow } from "@/components/ReceivableRow";

export const dynamic = "force-dynamic";

const VIEWS = ["pending", "received", "all"] as const;
type View = (typeof VIEWS)[number];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireAuth();
  const { view: rawView } = await searchParams;
  const view: View = VIEWS.includes(rawView as View) ? (rawView as View) : "pending";

  const where =
    view === "pending" ? { isReceived: false } : view === "received" ? { isReceived: true } : {};

  const [items, pendingSum, receivedSum] = await Promise.all([
    db.receivable.findMany({
      where,
      orderBy:
        view === "received"
          ? [{ receivedAt: "desc" }]
          : [{ isReceived: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    }),
    db.receivable.aggregate({
      where: { isReceived: false },
      _sum: { amountPaise: true },
      _count: true,
    }),
    db.receivable.aggregate({
      where: { isReceived: true },
      _sum: { amountPaise: true },
      _count: true,
    }),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Money to receive</h1>
          <p className="mt-1 text-sm text-zinc-500">Add who owes you, tick it off when it's paid.</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Log out
          </button>
        </form>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-600">
            {formatINR(pendingSum._sum.amountPaise ?? 0)}
          </p>
          <p className="text-xs text-zinc-500">{pendingSum._count} entries</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Received</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-600">
            {formatINR(receivedSum._sum.amountPaise ?? 0)}
          </p>
          <p className="text-xs text-zinc-500">{receivedSum._count} entries</p>
        </div>
      </section>

      <section className="mt-6">
        <AddReceivableForm />
      </section>

      <nav className="mt-8 flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm dark:bg-zinc-900">
        {VIEWS.map((v) => (
          <Link
            key={v}
            href={v === "pending" ? "/" : `/?view=${v}`}
            className={`flex-1 rounded-md px-3 py-1.5 text-center capitalize transition ${
              view === v
                ? "bg-white font-medium shadow-sm dark:bg-zinc-800"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {v}
          </Link>
        ))}
      </nav>

      <ul className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {items.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-zinc-500">
            {view === "received" ? "Nothing received yet." : "No pending entries. 🎉"}
          </li>
        ) : (
          items.map((r) => <ReceivableRow key={r.id} {...r} />)
        )}
      </ul>
    </main>
  );
}
