import React, { useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Search, Info, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function CADViewer({ dxfData }) {
  const svgRef = useRef(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (dxfData) {
      const entityCounts = {};
      dxfData.entities.forEach(ent => {
        entityCounts[ent.type] = (entityCounts[ent.type] || 0) + 1;
      });
      setMetadata({
        layers: Object.keys(dxfData.layers).length,
        entities: dxfData.entities.length,
        counts: entityCounts,
        bounds: dxfData.header?.$EXTMAX ? {
          max: dxfData.header.$EXTMAX,
          min: dxfData.header.$EXTMIN
        } : null
      });
    }
  }, [dxfData]);

  const handleVisionAnalysis = async () => {
    if (!svgRef.current) return;

    setIsAnalyzing(true);
    try {
      // Ensure SVG has intrinsic dimensions for canvas export
      const svgElement = svgRef.current;
      const originalWidth = svgElement.getAttribute('width');
      const originalHeight = svgElement.getAttribute('height');

      svgElement.setAttribute('width', '800');
      svgElement.setAttribute('height', '600');

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        canvas.width = 1600; // High resolution
        canvas.height = 1200;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append('image', blob, 'cad.png');
          formData.append('prompt', 'Analyze this CAD drawing. Identify key components, layout, and any potential issues or notable features.');

          const response = await axios.post('http://localhost:3001/api/documents/analyze-cad', formData);
          setAnalysis(response.data.analysis);
          setIsAnalyzing(false);
          URL.revokeObjectURL(url);

          // Restore attributes
          if (originalWidth) svgElement.setAttribute('width', originalWidth);
          else svgElement.removeAttribute('width');
          if (originalHeight) svgElement.setAttribute('height', originalHeight);
          else svgElement.removeAttribute('height');
        });
      };
      img.src = url;
    } catch (error) {
      console.error('Vision analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const renderEntities = () => {
    if (!dxfData) return null;
    return dxfData.entities.map((entity, i) => {
      if (entity.type === 'LINE') {
        return (
          <line
            key={i}
            x1={entity.vertices[0].x} y1={-entity.vertices[0].y}
            x2={entity.vertices[1].x} y2={-entity.vertices[1].y}
            stroke="currentColor" strokeWidth="0.5"
          />
        );
      }
      if (entity.type === 'CIRCLE' || entity.type === 'ARC') {
        return (
          <circle
            key={i}
            cx={entity.center.x} cy={-entity.center.y}
            r={entity.radius}
            fill="none" stroke="currentColor" strokeWidth="0.5"
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={handleVisionAnalysis}
            disabled={isAnalyzing}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            AI Vision Analysis
          </button>
        </div>

        <TransformWrapper centerOnInit minScale={0.1} maxScale={20}>
          <TransformComponent wrapperClass="w-full h-full">
            <svg
              ref={svgRef}
              viewBox="-100 -100 500 500"
              className="w-full h-full text-slate-900 dark:text-blue-400"
              style={{ minWidth: '800px', minHeight: '600px' }}
            >
              {renderEntities()}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-y-auto">
          <h4 className="font-bold mb-2 flex items-center gap-2 dark:text-white">
            <Info size={16} /> Metadata
          </h4>
          {metadata && (
            <div className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
              <p>Layers: {metadata.layers}</p>
              <p>Entities: {metadata.entities}</p>
              <div className="mt-2">
                <p className="font-semibold text-xs uppercase">Entity Breakdown:</p>
                {Object.entries(metadata.counts).map(([type, count]) => (
                  <p key={type}>{type}: {count}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-y-auto">
          <h4 className="font-bold mb-2 dark:text-white">AI Vision Insights</h4>
          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-slate-500 animate-pulse">
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing drawing components...</span>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {analysis || 'Click "AI Vision Analysis" to get automated insights into this drawing.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
