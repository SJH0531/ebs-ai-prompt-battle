import { ensureSchema, db } from './_lib/db.js';
import { readJson, json, fail } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  try {
    await ensureSchema();
    const { code, hostToken } = await readJson(req);
    const roomCode = String(code || '').toUpperCase();
    const sql = db();
    const room = await sql`SELECT 1 FROM pb_rooms WHERE code=${roomCode} AND host_token=${hostToken}`;
    if (!room.length) return json(res, 403, { error: 'host_only' });
    await sql`UPDATE pb_rounds SET status='revealed', revealed_at=NOW() WHERE room_code=${roomCode} AND status='playing'`;
    await sql`UPDATE pb_rooms SET status='results' WHERE code=${roomCode}`;
    json(res, 200, { ok: true });
  } catch (e) { fail(res, e); }
}
