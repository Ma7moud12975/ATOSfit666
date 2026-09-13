import fs from 'fs';

let key = process.env.VITE_CHATBOT_API_KEY;
let model = process.env.VITE_CHATBOT_MODEL_NAME;

if (!key && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const keyMatch = envContent.match(/VITE_CHATBOT_API_KEY=(.+)/);
  const modelMatch = envContent.match(/VITE_CHATBOT_MODEL_NAME=(.+)/);
  if (keyMatch) key = keyMatch[1].trim();
  if (modelMatch) model = modelMatch[1].trim();
}

model = model || 'gemini-3.6-flash';

async function test() {
  try {
    if (!key) {
      throw new Error('Set VITE_CHATBOT_API_KEY before running this test.');
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hi" }] }]
      })
    });
    const data = await res.json();
    fs.writeFileSync('response.json', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
