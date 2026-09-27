import { l as getSql, n as dbSource } from "./helpers-DMjkvUH-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/db-tx-Cp_hdyNn.js
function wrap(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
/**
* Run work in a single database transaction.
* PGLite is single-connection so BEGIN on getSql() is safe.
* Neon uses a dedicated client so pool multiplexing cannot split the tx.
*/
async function withTransaction(fn) {
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
			} catch {}
			throw err;
		}
	}
	const url = process.env.DATABASE_URL?.trim();
	if (!url) throw new Error("DATABASE_URL is not set");
	const { Client, types } = await import("../_libs/pg.mjs").then((n) => n.n);
	types.setTypeParser(20, Number);
	types.setTypeParser(1082, (v) => v);
	types.setTypeParser(1186, (v) => v);
	const client = new Client({ connectionString: url });
	await client.connect();
	const sql = wrap(async (text, params) => {
		return (await client.query(text, params)).rows;
	});
	try {
		await client.query("begin");
		const result = await fn(sql);
		await client.query("commit");
		return result;
	} catch (err) {
		try {
			await client.query("rollback");
		} catch {}
		throw err;
	} finally {
		await client.end();
	}
}
//#endregion
export { withTransaction as t };
