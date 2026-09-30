import { neon } from '@neondatabase/serverless';

function sqlClient() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;
  const sql = sqlClient();
  await sql`CREATE TABLE IF NOT EXISTS pb_rooms (
    code TEXT PRIMARY KEY,
    host_token TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'lobby',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS pb_players (
    id TEXT PRIMARY KEY,
    room_code TEXT NOT NULL REFERENCES pb_rooms(code) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    token TEXT NOT NULL,
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_code, nickname)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS pb_rounds (
    id TEXT PRIMARY KEY,
    room_code TEXT NOT NULL REFERENCES pb_rooms(code) ON DELETE CASCADE,
    round_no INTEGER NOT NULL,
    target_prompt TEXT NOT NULL,
    target_image TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'playing',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deadline_at TIMESTAMPTZ NOT NULL,
    revealed_at TIMESTAMPTZ,
    UNIQUE(room_code, round_no)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS pb_submissions (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL REFERENCES pb_rounds(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL REFERENCES pb_players(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    generated_image TEXT NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(round_id, player_id)
  )`;
  schemaReady = true;
}

export function db() { return sqlClient(); }
