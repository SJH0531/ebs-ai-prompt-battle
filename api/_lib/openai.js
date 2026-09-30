const OPENAI = 'https://api.openai.com/v1';

function key() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
  return process.env.OPENAI_API_KEY;
}

async function call(path, body) {
  const r = await fetch(`${OPENAI}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`OpenAI ${path} failed (${r.status}): ${txt.slice(0, 800)}`);
  }
  return r.json();
}

export async function generateImage(prompt) {
  const out = await call('/images/generations', {
    model: process.env.IMAGE_MODEL || 'gpt-image-2',
    prompt,
    size: '1024x1024',
    n: 1
  });
  const b64 = out?.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image API returned no image data');
  return `data:image/png;base64,${b64}`;
}

function extractOutputText(resp) {
  for (const item of resp?.output || []) {
    if (item?.type === 'message') {
      for (const c of item.content || []) {
        if (c?.type === 'output_text' && c.text) return c.text;
      }
    }
  }
  return '';
}

export async function scoreImages(targetDataUrl, candidateDataUrl) {
  const schema = {
    type: 'object',
    properties: {
      score: { type: 'integer', minimum: 0, maximum: 100 },
      feedback: { type: 'string' }
    },
    required: ['score', 'feedback'],
    additionalProperties: false
  };

  const resp = await call('/responses', {
    model: process.env.VISION_MODEL || process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    input: [{
      role: 'user',
      content: [
        { type: 'input_text', text: '두 이미지를 비교해 시각적 유사도를 0~100으로 평가하세요. 객체, 개수, 배치/구도, 색, 배경, 조명/스타일을 종합하되 동일한 의미라도 위치와 형태가 다르면 감점하세요. 첫 이미지가 정답, 두 번째가 참가자 결과입니다. feedback은 한국어 한 문장으로 작성하세요.' },
        { type: 'input_image', image_url: targetDataUrl },
        { type: 'input_image', image_url: candidateDataUrl }
      ]
    }],
    text: {
      format: {
        type: 'json_schema',
        name: 'image_similarity',
        strict: true,
        schema
      }
    }
  });
  const raw = extractOutputText(resp);
  const parsed = JSON.parse(raw);
  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    feedback: String(parsed.feedback || '').slice(0, 220)
  };
}
