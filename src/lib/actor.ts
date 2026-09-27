import type { Sql } from "@/lib/db";

export async function getActorName(sql: Sql, userId: string): Promise<string> {
  try {
    const rows = await sql.query<{ name: string; email: string }>(
      `select name, email from "user" where id = $1`,
      [userId],
    );
    const row = rows[0];
    if (row?.name && row.name.trim()) return row.name.trim();
    if (row?.email) return row.email;
  } catch {
    /* auth table may be missing in odd preview states */
  }
  if (userId === "dev-user") return "Staff";
  return userId;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function iso(d: Date | string | null | undefined): string {
  if (!d) return new Date().toISOString();
  if (typeof d === "string") {
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime()) ? d : parsed.toISOString();
  }
  return d.toISOString();
}
