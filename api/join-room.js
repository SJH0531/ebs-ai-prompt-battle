import { ensureSchema, db } from './_lib/db.js';
import { readJson, json, fail } from './_lib/http.js';
import { id, token } from './_lib/game.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  try {
    await ensureSchema();
    const body = await readJson(req);
    const code = String(body.code || '').trim().toUpperCase();
    const name = String(body.nickname || '').trim().slice(0, 18);
    if (!code || !name) return json(res, 400, { error: 'code_and_nickname_required' });
    const sql = db();
    const room = await sql`SELECT status FROM pb_rooms WHERE code=${code}`;
    if (!room.length) return json(res, 404, { error: 'room_not_found' });
    if (room[0].status !== 'lobby') return json(res, 409, { error: 'game_already_started' });
    const count = await sql`SELECT COUNT(*)::int AS n FROM pb_players WHERE room_code=${code}`;
    if (Number(count[0]?.n || 0) >= 3) return json(res, 409, { error: 'room_full' });
    const playerId = id('p');
    const playerToken = token();
    try {
      await sql`INSERT INTO pb_players(id,room_code,nickname,token,is_host) VALUES (${playerId},${code},${name},${playerToken},FALSE)`;
    } catch (e) {
      if (String(e).toLowerCase().includes('unique')) return json(res, 409, { error: 'nickname_taken' });
      throw e;
    }
    json(res, 200, { code, playerId, playerToken });
  } catch (e) { fail(res, e); }
}
