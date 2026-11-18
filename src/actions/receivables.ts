"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rupeesToPaise } from "@/lib/money";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter who owes the money").max(100),
  amount: z.coerce
    .number({ error: "Enter a valid amount" })
    .positive("Amount must be more than 0")
    .max(10_000_000, "Amount is too large"),
  note: z.string().trim().max(300).optional(),
  dueDate: z.string().optional(),
});

export type FormState = { error?: string; ok?: boolean };

export async function createReceivable(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAuth();
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, amount, note, dueDate } = parsed.data;

  await db.receivable.create({
    data: {
      name,
      amountPaise: rupeesToPaise(amount),
      note,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function setReceived(id: string, received: boolean) {
  await requireAuth();
  z.string().cuid().parse(id);

  await db.receivable.update({
    where: { id },
    data: {
      isReceived: received,
      receivedAt: received ? new Date() : null,
    },
  });

  revalidatePath("/");
}

export async function deleteReceivable(id: string) {
  await requireAuth();
  z.string().cuid().parse(id);
  await db.receivable.delete({ where: { id } });
  revalidatePath("/");
}
