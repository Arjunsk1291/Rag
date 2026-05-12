import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Network, Loader2, Copy, Check } from 'lucide-react';
import axios from 'axios';

mermaid.initialize({
  startOnLoad: true,
  theme: 'forest',
  securityLevel: 'loose',
});

export default function MindMap({ activeDocId }) {
  const [mindmap, setMindmap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const mermaidRef = useRef(null);

  const generateMap = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:3001/api/documents/${activeDocId}/mindmap`);
      let code = response.data.mindmap;
      // Extract code from potential markdown block
      const match = code.match(/```mermaid\n([\s\S]*?)\n```/) || code.match(/```\n([\s\S]*?)\n```/);
      if (match) code = match[1];

      setMindmap(code.trim());
    } catch (error) {
      console.error('Failed to generate mind map:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mindmap && mermaidRef.current) {
      mermaidRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [mindmap]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mindmap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <Network size={20} className="text-purple-500" />
            Mind Map Generator
          </h3>
          <p className="text-sm text-slate-500">Visualize document structure with AI</p>
        </div>
        <div className="flex gap-2">
          {mindmap && (
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy Source'}
            </button>
          )}
          <button
            onClick={generateMap}
            disabled={isLoading || !activeDocId}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Network size={18} />}
            {mindmap ? 'Regenerate' : 'Generate Mind Map'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-8 flex items-center justify-center overflow-auto shadow-inner min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <Loader2 size={48} className="animate-spin text-purple-500" />
            <p className="animate-pulse">Synthesizing concepts...</p>
          </div>
        ) : mindmap ? (
          <div key={mindmap} ref={mermaidRef} className="mermaid w-full flex justify-center">
            {mindmap}
          </div>
        ) : (
          <div className="text-center text-slate-400 max-w-md">
            <Network size={64} className="mx-auto mb-4 opacity-10" />
            <p>Click "Generate Mind Map" to create a visual summary of the active document.</p>
          </div>
        )}
      </div>
    </div>
  );
}
