export const ROUND_SECONDS = 150;

const SUBJECTS = [
  'a tiny blue whale wearing round glasses',
  'a red retro television with two antennas',
  'a friendly white robot teacher',
  'a giant purple pencil',
  'a transparent glass school bus',
  'a yellow submarine shaped like a school desk',
  'a floating library made of clouds',
  'a small astronaut penguin',
  'a silver robot dog carrying a book',
  'a giant orange alarm clock'
];

const SETTINGS = [
  'above a quiet futuristic city at night',
  'in a bright green meadow under a huge moon',
  'inside a classroom floating in outer space',
  'on a rooftop at sunrise',
  'underwater beside a coral reef',
  'in a neon-lit broadcasting studio',
  'inside a miniature city made of books',
  'on a snowy mountain summit',
  'in a surreal desert with geometric rocks',
  'inside a cozy train carriage'
];

const DETAILS = [
  'with exactly three small stars arranged in a triangle',
  'with one yellow balloon tied to it',
  'with a glowing blue book hovering nearby',
  'with three tiny people waving from below',
  'with a single red umbrella on the left',
  'with two floating paper airplanes',
  'with a small green plant in the lower right',
  'with a crescent moon in the upper left',
  'with four identical chairs lined up behind it',
  'with one tiny satellite in the background'
];

const STYLES = [
  'clean flat vector poster style',
  'soft 3D clay render style',
  'cinematic miniature diorama style',
  'playful isometric illustration style',
  'retro-futuristic editorial illustration',
  'minimal geometric poster style',
  'polished Pixar-like 3D animation still',
  'paper-cut collage style'
];

const PALETTES = [
  'deep navy, pale yellow and powder blue palette',
  'coral red, cream and teal palette',
  'lavender, midnight blue and warm orange palette',
  'mint green, white and cobalt blue palette',
  'black, neon pink and electric cyan palette',
  'beige, forest green and mustard yellow palette'
];

const COMPOSITIONS = [
  'centered composition with lots of negative space',
  'subject placed slightly left of center with a large object in the upper right',
  'low-angle view with a strong foreground and simple background',
  'symmetrical front-facing composition',
  'wide cinematic composition with the subject occupying the lower third',
  'top-down composition with clearly separated objects'
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomTarget(exclude = []) {
  const banned = new Set(exclude || []);
  for (let i = 0; i < 30; i++) {
    const prompt = [
      'A square image of',
      pick(SUBJECTS),
      pick(SETTINGS) + ',',
      pick(DETAILS) + ',',
      pick(COMPOSITIONS) + ',',
      pick(PALETTES) + ',',
      pick(STYLES) + ',',
      'clear object boundaries, no text, no logo'
    ].join(' ');
    if (!banned.has(prompt)) return prompt;
  }
  return `A square surreal image of ${pick(SUBJECTS)} ${pick(SETTINGS)}, ${pick(STYLES)}, no text, unique variation ${crypto.randomUUID().slice(0,8)}`;
}

export function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export function id(prefix='id') { return `${prefix}_${crypto.randomUUID()}`; }
export function token() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', ''); }
