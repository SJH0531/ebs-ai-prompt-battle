import { ensureSchema, db } from './_lib/db.js';
import { readJson, json, fail } from './_lib/http.js';
import { roomCode, id, token } from './_lib/game.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  try {
    await ensureSchema();
    const { nickname } = await readJson(req);
    const name = String(nickname || '').trim().slice(0, 18);
    if (!name) return json(res, 400, { error: 'nickname_required' });
    const sql = db();
    let code;
    for (let i=0;i<8;i++) {
      code = roomCode();
      const exists = await sql`SELECT 1 FROM pb_rooms WHERE code=${code}`;
      if (!exists.length) break;
    }
    const hostToken = token();
    const playerId = id('p');
    const playerToken = token();
    await sql`INSERT INTO pb_rooms(code,host_token,status) VALUES (${code},${hostToken},'lobby')`;
    await sql`INSERT INTO pb_players(id,room_code,nickname,token,is_host) VALUES (${playerId},${code},${name},${playerToken},TRUE)`;
    json(res, 200, { code, playerId, playerToken, hostToken });
  } catch (e) { fail(res, e); }
}
