const express = require('express');
const router = express.Router();
const { embed } = require('../services/embedder');
const vectorStore = require('../services/vectorStore');
const { chatStream } = require('../services/openrouter');

router.post('/', async (req, res) => {
  const { messages, activeDocId } = req.body;
  if (!messages || !messages.length) return res.status(400).json({ error: 'No messages' });

  try {
    const lastMessage = messages[messages.length - 1].content;
    const queryEmbedding = await embed(lastMessage);

    // Perform search
    let searchResults = vectorStore.search(queryEmbedding, 20); // Get more candidates to ensure we have enough after filtering

    // Filter by active document if provided
    if (activeDocId) {
      searchResults = searchResults.filter(r => r.docId === activeDocId);
    }

    // Take top 5 after potential filtering
    searchResults = searchResults.slice(0, 5);

    const context = searchResults.map(r => `[Source: ${r.metadata.filename}] ${r.text}`).join('\n\n');

    const augmentedMessages = [
      {
        role: 'system',
        content: `You are DocuMind, an AI assistant. Use the following context to answer the user's question. If you don't know the answer, say you don't know. Always cite your sources using [Filename].\n\nContext:\n${context}`
      },
      ...messages
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send sources first
    res.write(`data: ${JSON.stringify({ sources: searchResults.map(r => ({ filename: r.metadata.filename, text: r.text.slice(0, 100) + '...' })) })}\n\n`);

    const stream = await chatStream(augmentedMessages);

    stream.on('data', (chunk) => {
      const payload = chunk.toString();
      const lines = payload.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          res.write(`${line}\n\n`);
        }
      }
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

module.exports = router;
