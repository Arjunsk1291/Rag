const { pipeline } = require('@xenova/transformers');

let embedder;
let limit;

async function getLimit() {
  if (!limit) {
    const pLimit = (await import('p-limit')).default;
    limit = pLimit(5);
  }
  return limit;
}

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

async function embed(text) {
  const extractor = await getEmbedder();
  const limiter = await getLimit();
  const output = await limiter(() => extractor(text, { pooling: 'mean', normalize: true }));
  return Array.from(output.data);
}

async function embedMany(texts) {
  return Promise.all(texts.map(text => embed(text)));
}

module.exports = { embed, embedMany };
