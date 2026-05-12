import React from 'react';
import { FileText, Trash2, PlusCircle, Settings } from 'lucide-react';

export default function Sidebar({ documents, activeDocId, onSelectDoc, onUploadClick, theme, toggleTheme }) {
  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">DocuMind</h1>
        <button
          onClick={toggleTheme}
          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={onUploadClick}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle size={18} />
          <span>Upload Doc</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Documents</h2>
        <div className="space-y-1">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                activeDocId === doc.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <FileText size={16} />
              <span className="truncate text-sm">{doc.filename}</span>
            </button>
          ))}
          {documents.length === 0 && (
            <p className="px-3 text-xs text-slate-400 italic">No documents uploaded yet.</p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}
