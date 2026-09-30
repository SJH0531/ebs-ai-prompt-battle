export const ROUND_SECONDS = 150;

const TARGETS = [
  'A cinematic square illustration of a small blue whale floating above a quiet futuristic city at night, one large pale yellow full moon in the upper right, deep navy sky, minimal geometric buildings, clean vector poster style, no text',
  'A whimsical square image of a red vintage television sitting alone in a bright green meadow, tiny white clouds, one yellow balloon tied to the antenna, soft 3D clay style, centered composition, no text',
  'A surreal square poster of a transparent glass classroom floating in outer space, three desks inside, Earth visible through the window on the left, warm orange desk lamps, dark star field, cinematic lighting, no text',
  'A minimal square illustration of a white robot teacher writing a single blue circle on a blackboard, four yellow student chairs seen from behind, beige classroom walls, flat editorial illustration, no text',
  'A playful square image of a giant purple pencil used as a bridge between two tiny city rooftops, sunrise sky, three people crossing the pencil, clean isometric illustration, no text'
];

export function pickTarget(roundNo = 1) {
  return TARGETS[(roundNo - 1) % TARGETS.length];
}

export function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export function id(prefix='id') { return `${prefix}_${crypto.randomUUID()}`; }
export function token() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', ''); }
