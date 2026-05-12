import React, { useState } from 'react';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function FileUpload({ onUploadComplete, onClose }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStatus('uploading');
    try {
      const response = await axios.post('http://localhost:3001/api/documents/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      setStatus('success');
      onUploadComplete(response.data);
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Document</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input').click()}
            >
              <Upload size={40} className="text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Click to select PDF, DOCX, TXT or DXF
              </p>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.dxf"
                onChange={handleFileChange}
              />
            </div>
            {file && (
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{file.name}</span>
                <span className="text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
            <button
              disabled={!file}
              onClick={handleUpload}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
            >
              Start Processing
            </button>
          </div>
        )}

        {status === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 size={40} className="animate-spin text-blue-600" />
            <p className="text-lg font-medium dark:text-white">Processing Document...</p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-slate-500">{progress}%</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-lg font-medium dark:text-white">Success! Ready for RAG.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <X size={48} className="text-red-500" />
            <p className="text-lg font-medium dark:text-white">Processing Failed</p>
            <p className="text-sm text-slate-500">Make sure your file is valid and try again.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-blue-600 font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
