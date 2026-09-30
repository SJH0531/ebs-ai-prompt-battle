import { ensureSchema, db } from './_lib/db.js';
import { json, fail } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method_not_allowed' });
  try {
    await ensureSchema();
    const url = new URL(req.url, 'http://local');
    const code = String(url.searchParams.get('code') || '').toUpperCase();
    const playerId = String(url.searchParams.get('playerId') || '');
    const includeImages = url.searchParams.get('images') === '1';
    const sql = db();
    const rooms = await sql`SELECT code,status,created_at FROM pb_rooms WHERE code=${code}`;
    if (!rooms.length) return json(res, 404, { error: 'room_not_found' });
    const players = await sql`SELECT id,nickname,is_host FROM pb_players WHERE room_code=${code} ORDER BY created_at`;
    const rounds = await sql`SELECT * FROM pb_rounds WHERE room_code=${code} ORDER BY round_no DESC LIMIT 1`;
    let round = null, submissions = [];
    if (rounds.length) {
      const r = rounds[0];
      let revealed = r.status === 'revealed' || new Date(r.deadline_at).getTime() <= Date.now();
      if (revealed && r.status !== 'revealed') {
        await sql`UPDATE pb_rounds SET status='revealed', revealed_at=NOW() WHERE id=${r.id}`;
        await sql`UPDATE pb_rooms SET status='results' WHERE code=${code}`;
      }
      const rows = await sql`SELECT s.player_id,p.nickname,s.prompt,s.score,s.feedback,s.generated_image,s.created_at FROM pb_submissions s JOIN pb_players p ON p.id=s.player_id WHERE s.round_id=${r.id} ORDER BY s.score DESC, s.created_at ASC`;
      submissions = revealed
        ? rows.map(x => ({ ...x, generated_image: includeImages ? x.generated_image : null }))
        : rows.map(x => ({
            player_id:x.player_id,
            nickname:x.nickname,
            submitted:true,
            score: x.player_id===playerId ? x.score : null,
            feedback: x.player_id===playerId ? x.feedback : null,
            generated_image: includeImages && x.player_id===playerId ? x.generated_image : null
          }));
      round = {
        id: r.id,
        roundNo: r.round_no,
        status: revealed ? 'revealed' : 'playing',
        targetImage: includeImages ? r.target_image : null,
        targetPrompt: revealed ? r.target_prompt : null,
        startedAt: r.started_at,
        deadlineAt: r.deadline_at
      };
    }
    json(res, 200, { room: rooms[0], players, round, submissions, serverNow: new Date().toISOString() });
  } catch (e) { fail(res, e); }
}
