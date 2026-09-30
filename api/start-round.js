import { ensureSchema, db } from './_lib/db.js';
import { readJson, json, fail } from './_lib/http.js';
import { ROUND_SECONDS, randomTarget, id } from './_lib/game.js';
import { generateImage } from './_lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  try {
    await ensureSchema();
    const { code, hostToken } = await readJson(req);
    const roomCode = String(code || '').toUpperCase();
    const sql = db();
    const rooms = await sql`SELECT * FROM pb_rooms WHERE code=${roomCode} AND host_token=${hostToken}`;
    if (!rooms.length) return json(res, 403, { error: 'host_only' });
    const playerCount = await sql`SELECT COUNT(*)::int AS n FROM pb_players WHERE room_code=${roomCode}`;
    if (Number(playerCount[0]?.n || 0) < 2) return json(res, 409, { error: 'need_more_players' });
    const prev = await sql`SELECT COALESCE(MAX(round_no),0)::int AS n FROM pb_rounds WHERE room_code=${roomCode}`;
    const roundNo = Number(prev[0].n) + 1;
    const recent = await sql`SELECT target_prompt FROM pb_rounds WHERE room_code=${roomCode} ORDER BY round_no DESC LIMIT 12`;
    const targetPrompt = randomTarget(recent.map(x => x.target_prompt));
    const targetImage = await generateImage(targetPrompt);
    const roundId = id('r');
    const deadline = new Date(Date.now() + ROUND_SECONDS * 1000);
    await sql`UPDATE pb_rounds SET status='revealed', revealed_at=NOW() WHERE room_code=${roomCode} AND status='playing'`;
    await sql`INSERT INTO pb_rounds(id,room_code,round_no,target_prompt,target_image,status,deadline_at) VALUES (${roundId},${roomCode},${roundNo},${targetPrompt},${targetImage},'playing',${deadline.toISOString()})`;
    await sql`UPDATE pb_rooms SET status='playing' WHERE code=${roomCode}`;
    json(res, 200, { ok: true, roundNo });
  } catch (e) { fail(res, e); }
}
