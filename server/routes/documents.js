const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const DxfParser = require('dxf-parser');
const { chunkText } = require('../services/chunker');
const { embedMany } = require('../services/embedder');
const vectorStore = require('../services/vectorStore');
const { generateMindMap, analyzeVision } = require('../services/openrouter');

const upload = multer({ storage: multer.memoryStorage() });

const docs = {}; // In-memory doc metadata store

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const docId = Date.now().toString();
    let text = '';
    let metadata = { filename: file.originalname, type: file.mimetype };

    if (file.originalname.endsWith('.pdf')) {
      const data = await pdf(file.buffer);
      text = data.text;
    } else if (file.originalname.endsWith('.docx')) {
      const data = await mammoth.extractRawText({ buffer: file.buffer });
      text = data.value;
    } else if (file.originalname.endsWith('.txt')) {
      text = file.buffer.toString('utf-8');
    } else if (file.originalname.endsWith('.dxf')) {
      const parser = new DxfParser();
      const dxf = parser.parseSync(file.buffer.toString('utf-8'));
      text = JSON.stringify(dxf.entities); // Simplified context for DXF
      metadata.dxf = dxf;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const chunks = chunkText(text);
    const embeddings = await embedMany(chunks);
    vectorStore.add(docId, chunks, embeddings, { filename: file.originalname });

    docs[docId] = { id: docId, ...metadata, chunkCount: chunks.length };

    res.json({ docId, ...docs[docId], preview: text.slice(0, 500) });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

router.get('/', (req, res) => {
  res.json(Object.values(docs));
});

router.post('/:docId/mindmap', async (req, res) => {
  try {
    const { docId } = req.params;
    // For mindmap, we use top chunks or summary. Here we take first few chunks for simplicity.
    const relevantChunks = vectorStore.documents
      .filter(d => d.docId === docId)
      .slice(0, 5)
      .map(d => d.text)
      .join('\n');

    const mindmap = await generateMindMap(relevantChunks);
    res.json({ mindmap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate mind map' });
  }
});

router.post('/analyze-cad', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageBuffer = req.file.buffer;
    const analysis = await analyzeVision(imageBuffer, prompt);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze CAD' });
  }
});

module.exports = router;
