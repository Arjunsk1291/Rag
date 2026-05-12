/**
 * Simple in-memory vector store with cosine similarity search.
 */
class VectorStore {
  constructor() {
    this.documents = []; // { id, docId, text, embedding, metadata }
  }

  add(docId, chunks, embeddings, metadata = {}) {
    chunks.forEach((text, index) => {
      this.documents.push({
        id: `${docId}-${index}`,
        docId,
        text,
        embedding: embeddings[index],
        metadata
      });
    });
  }

  clearByDocId(docId) {
    this.documents = this.documents.filter(doc => doc.docId !== docId);
  }

  search(queryEmbedding, topK = 5) {
    const scores = this.documents.map(doc => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

const store = new VectorStore();
module.exports = store;
