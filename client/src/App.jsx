import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import CADViewer from './components/CADViewer';
import MindMap from './components/MindMap';
import FileUpload from './components/FileUpload';
import { MessageSquare, Network, Box } from 'lucide-react';
import axios from 'axios';

function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const activeDoc = documents.find(d => d.id === activeDocId);

  useEffect(() => {
    fetchDocuments();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleUploadComplete = (newDoc) => {
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.docId || newDoc.id);
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={setActiveDocId}
        onUploadClick={() => setIsUploadModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <MessageSquare size={18} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('mindmap')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
                activeTab === 'mindmap'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Network size={18} />
              Mind Map
            </button>
            {activeDoc?.filename?.endsWith('.dxf') && (
              <button
                onClick={() => setActiveTab('cad')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
                  activeTab === 'cad'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Box size={18} />
                CAD Viewer
              </button>
            )}
          </div>

          {activeDoc && (
            <div className="text-right hidden sm:block">
              <h2 className="text-sm font-bold truncate max-w-xs">{activeDoc.filename}</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{activeDoc.type}</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && <ChatInterface activeDocId={activeDocId} />}
          {activeTab === 'mindmap' && <MindMap activeDocId={activeDocId} />}
          {activeTab === 'cad' && activeDoc?.dxf && <CADViewer dxfData={activeDoc.dxf} />}
          {!activeDocId && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full">
                <Box size={48} className="opacity-20" />
              </div>
              <p className="font-medium text-lg">Select or upload a document to get started</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                Upload your first file
              </button>
            </div>
          )}
        </div>
      </main>

      {isUploadModalOpen && (
        <FileUpload
          onUploadComplete={handleUploadComplete}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
