const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1';

const MODELS = {
  CHAT: 'google/gemma-3-27b-it:free',
  FALLBACK_CHAT: 'meta-llama/llama-3.3-70b-instruct:free',
  VISION: 'google/gemma-3-12b-it:free',
  MINDMAP: 'mistralai/mistral-7b-instruct:free'
};

async function chatStream(messages, model = MODELS.CHAT) {
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://documind.app', // Required by OpenRouter
        'X-Title': 'DocuMind'
      },
      data: {
        model,
        messages,
        stream: true
      },
      responseType: 'stream'
    });
    return response.data;
  } catch (error) {
    if (model === MODELS.CHAT && error.response && error.response.status === 429) {
      console.warn('Primary model rate limited, falling back...');
      return chatStream(messages, MODELS.FALLBACK_CHAT);
    }
    throw error;
  }
}

async function analyzeVision(imageBuffer, prompt) {
  const base64Image = imageBuffer.toString('base64');
  const response = await axios.post(`${BASE_URL}/chat/completions`, {
    model: MODELS.VISION,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
        ]
      }
    ]
  }, {
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://documind.app',
      'X-Title': 'DocuMind'
    }
  });
  return response.data.choices[0].message.content;
}

async function generateMindMap(text) {
  const prompt = `Produce a Mermaid mindmap diagram summarizing the following key concepts from the document. Output ONLY the mermaid code block, starting with "mindmap".\n\nText:\n${text}`;
  const response = await axios.post(`${BASE_URL}/chat/completions`, {
    model: MODELS.MINDMAP,
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://documind.app',
      'X-Title': 'DocuMind'
    }
  });
  return response.data.choices[0].message.content;
}

module.exports = { chatStream, analyzeVision, generateMindMap, MODELS };
