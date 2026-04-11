"use server";

import { createClient } from "@/lib/supabase/server";
import type { Expense, CreateExpenseInput } from "@/lib/types";

export async function getExpensesByTrip(tripId: string): Promise<Expense[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("expenses")
    .select()
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Expense[];
}

export async function addExpense(
  input: CreateExpenseInput,
): Promise<Expense> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("expenses")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
