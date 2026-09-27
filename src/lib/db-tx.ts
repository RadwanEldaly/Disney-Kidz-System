import { dbSource, getSql, type Sql } from "@/lib/db";

type Run = <T>(text: string, params: unknown[]) => Promise<T[]>;

function wrap(run: Run): Sql {
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    run<T>(text, params);
  return sql;
}

/**
 * Run work in a single database transaction.
 * PGLite is single-connection so BEGIN on getSql() is safe.
 * Neon uses a dedicated client so pool multiplexing cannot split the tx.
 */
export async function withTransaction<T>(fn: (sql: Sql) => Promise<T>): Promise<T> {
  if (dbSource === "pglite") {
    const sql = await getSql();
    await sql.query("begin");
    try {
      const result = await fn(sql);
      await sql.query("commit");
      return result;
    } catch (err) {
      try {
        await sql.query("rollback");
      } catch {
        /* ignore */
      }
      throw err;
    }
  }

  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not set");
  const { Client, types } = await import("pg");
  types.setTypeParser(20, Number);
  types.setTypeParser(1082, (v: string) => v);
  types.setTypeParser(1186, (v: string) => v);
  const client = new Client({ connectionString: url });
  await client.connect();
  const sql = wrap(async <T>(text: string, params: unknown[]) => {
    const res = await client.query(text, params);
    return res.rows as T[];
  });
  try {
    await client.query("begin");
    const result = await fn(sql);
    await client.query("commit");
    return result;
  } catch (err) {
    try {
      await client.query("rollback");
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    await client.end();
  }
}
