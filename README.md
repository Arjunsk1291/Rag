# DocuMind – AI-Powered RAG Document Assistant

DocuMind is a production-ready, full-stack application designed for deep document analysis. It uses Retrieval-Augmented Generation (RAG) to allow users to chat with their documents, visualize document structures via mind maps, and analyze CAD (DXF) files with AI vision.

## 🚀 Features

- **Multi-format Support:** Upload PDF, DOCX, TXT, and DXF files.
- **RAG Chat Interface:** Context-aware conversations with your documents using streaming responses and source citations.
- **AI Vision for CAD:** Specialized DXF viewer with zoom/pan and AI-powered visual analysis.
- **Mind Map Generation:** Automatically generate Mermaid mind maps summarizing key concepts.
- **Local Embeddings:** Privacy-focused local embedding generation using `@xenova/transformers`.
- **In-memory Vector Store:** Fast, lightweight vector search without external database dependencies.
- **Responsive Design:** Dark/Light theme support with a mobile-friendly layout.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Mermaid.js
- **Backend:** Node.js, Express, Multer
- **AI Integration:** OpenRouter API
- **Embeddings:** all-MiniLM-L6-v2 (via Transformers.js)
- **Parsing:** pdf-parse, mammoth, dxf-parser

## 📋 Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **OpenRouter API Key:** Required for LLM features ([Get one here](https://openrouter.ai/keys))

## ⚙️ Configuration

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd rag
   ```

2. **Backend Setup:**
   Create a `.env` file in the root directory (or inside the `server` directory) with your OpenRouter API key:
   ```bash
   echo "OPENROUTER_API_KEY=your_sk_or_v1_key" > .env
   echo "PORT=3001" >> .env
   ```

## 🏃‍♂️ How to Run (Ubuntu/Linux)

Follow these steps to get the application running on your Ubuntu terminal:

### 1. Install Dependencies

Install backend dependencies:
```bash
cd server
npm install
```

Install frontend dependencies:
```bash
cd ../client
npm install
```

### 2. Start the Application

You need to run both the backend server and the frontend development server.

**Option A: Running in separate terminal windows (Recommended)**

- **Terminal 1 (Backend):**
  ```bash
  cd server
  node index.js
  ```

- **Terminal 2 (Frontend):**
  ```bash
  cd client
  npm run dev
  ```

**Option B: Running in the background**

```bash
# From the root directory
cd server && node index.js > server.log 2>&1 &
cd ../client && npm run dev > client.log 2>&1 &
```

Once started, the application will be available at `http://localhost:5173`.

## 📂 Project Structure

```
documind/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/ # UI Components (Sidebar, Chat, CADViewer, etc.)
│   │   └── App.jsx     # Main layout & logic
│   ├── tailwind.config.cjs
│   └── postcss.config.cjs
├── server/          # Express backend
│   ├── routes/      # API Endpoints (Upload, Chat, Analyze)
│   ├── services/    # Core Logic (Chunker, Embedder, VectorStore)
│   ├── tests/       # Backend service tests
│   └── index.js     # Entry point
└── .env             # Environment variables
```

## 🧪 Running Tests

To verify the backend services (chunking, embedding, vector search):
```bash
cd server
node tests/services.test.js
```

## 📝 License

ISC License. See `LICENSE` for details.
