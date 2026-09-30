import { ensureSchema, db } from './_lib/db.js';
import { readJson, json, fail } from './_lib/http.js';
import { id } from './_lib/game.js';
import { generateImage, scoreImages } from './_lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  try {
    await ensureSchema();
    const { code, playerId, playerToken, prompt } = await readJson(req);
    const roomCode = String(code || '').toUpperCase();
    const text = String(prompt || '').trim().slice(0, 1200);
    if (!text) return json(res, 400, { error: 'prompt_required' });
    const sql = db();
    const players = await sql`SELECT id FROM pb_players WHERE id=${playerId} AND room_code=${roomCode} AND token=${playerToken}`;
    if (!players.length) return json(res, 403, { error: 'invalid_player' });
    const rounds = await sql`SELECT * FROM pb_rounds WHERE room_code=${roomCode} AND status='playing' ORDER BY round_no DESC LIMIT 1`;
    if (!rounds.length) return json(res, 409, { error: 'no_active_round' });
    const round = rounds[0];
    if (new Date(round.deadline_at).getTime() < Date.now()) return json(res, 409, { error: 'round_closed' });
    const existing = await sql`SELECT id,score,feedback,generated_image FROM pb_submissions WHERE round_id=${round.id} AND player_id=${playerId}`;
    if (existing.length) return json(res, 409, { error: 'already_submitted', submission: existing[0] });
    const generatedImage = await generateImage(text);
    const grading = await scoreImages(round.target_image, generatedImage);
    const submissionId = id('s');
    await sql`INSERT INTO pb_submissions(id,round_id,player_id,prompt,generated_image,score,feedback) VALUES (${submissionId},${round.id},${playerId},${text},${generatedImage},${grading.score},${grading.feedback})`;

    const [pc] = await sql`SELECT COUNT(*)::int AS n FROM pb_players WHERE room_code=${roomCode}`;
    const [sc] = await sql`SELECT COUNT(*)::int AS n FROM pb_submissions WHERE round_id=${round.id}`;
    let autoRevealed = false;
    if (Number(pc.n) > 0 && Number(sc.n) >= Number(pc.n)) {
      await sql`UPDATE pb_rounds SET status='revealed', revealed_at=NOW() WHERE id=${round.id}`;
      await sql`UPDATE pb_rooms SET status='results' WHERE code=${roomCode}`;
      autoRevealed = true;
    }
    json(res, 200, { score: grading.score, feedback: grading.feedback, generatedImage, autoRevealed });
  } catch (e) { fail(res, e); }
}
