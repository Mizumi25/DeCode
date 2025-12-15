import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

const DocumentViewer = ({ src, alt, type }) => {
  const getFileIcon = () => {
    if (type === 'pdf') return <FileText className="w-16 h-16 text-red-500" />;
    return <FileText className="w-16 h-16 text-blue-500" />;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-12">
      <div className="p-8 bg-gray-50 rounded-2xl">
        {getFileIcon()}
      </div>
      
      <div className="text-center">
        <h4 className="font-semibold text-lg mb-2">{alt}</h4>
        <p className="text-sm text-gray-600 mb-4">
          {type.toUpperCase()} Document
        </p>
      </div>
      
      <div className="flex gap-3">
        <a
          href={src}
          download
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
        
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open
        </a>
      </div>
    </div>
  );
};

export default DocumentViewer;
