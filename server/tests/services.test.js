const { chunkText } = require('../services/chunker');
const { embed, embedMany } = require('../services/embedder');
const vectorStore = require('../services/vectorStore');

async function runTests() {
  console.log('Running Backend Service Tests...');

  // 1. Chunker Test
  console.log('\n--- 1. Chunker Test ---');
  const text = 'The quick brown fox jumps over the lazy dog. '.repeat(20);
  const chunks = chunkText(text, 10, 2);
  console.log(`Text length: ${text.length}, Chunks created: ${chunks.length}`);
  if (chunks.length > 1) console.log('✅ Chunker passed');
  else console.error('❌ Chunker failed');

  // 2. Embedder Test
  console.log('\n--- 2. Embedder Test ---');
  try {
    const embedding = await embed('Hello world');
    console.log(`Embedding size: ${embedding.length}`);
    if (embedding.length === 384) console.log('✅ Embedder passed (size 384 for all-MiniLM-L6-v2)');
    else console.error(`❌ Embedder failed (unexpected size ${embedding.length})`);
  } catch (e) {
    console.error('❌ Embedder failed:', e.message);
  }

  // 3. Vector Store Test
  console.log('\n--- 3. Vector Store Test ---');
  const docId = 'test-doc';
  const testChunks = ['Apples are red', 'Bananas are yellow', 'The sky is blue'];
  const testEmbeddings = await embedMany(testChunks);

  vectorStore.add(docId, testChunks, testEmbeddings, { filename: 'test.txt' });

  const queryEmbedding = await embed('What color are bananas?');
  const results = vectorStore.search(queryEmbedding, 1);

  console.log(`Top match: "${results[0].text}" with score ${results[0].score.toFixed(4)}`);
  if (results[0].text.includes('Bananas')) console.log('✅ Vector Store Search passed');
  else console.error('❌ Vector Store Search failed');

  process.exit(0);
}

runTests();
