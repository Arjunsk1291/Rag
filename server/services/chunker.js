/**
 * Chunks text into segments of approximately `chunkSize` tokens with `overlap` tokens.
 * A rough approximation of 1 token = 1 word is used here.
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  if (!text) return [];

  // Split by whitespace to get rough tokens
  const tokens = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < tokens.length; i += (chunkSize - overlap)) {
    const chunk = tokens.slice(i, i + chunkSize).join(' ');
    if (chunk) {
      chunks.push(chunk);
    }

    // Break if we've reached the end
    if (i + chunkSize >= tokens.length) break;
  }

  return chunks;
}

module.exports = { chunkText };
