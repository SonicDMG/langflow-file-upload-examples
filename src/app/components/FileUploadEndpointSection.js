import React from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function FileUploadEndpointSection({ fileUploadEndpoint, langflowRunEndpoint, payloadPreview }) {
  return (
    <div className="bg-[#232e4a] rounded-lg p-4 text-[#b3cfff] text-sm">
      <div className="mb-2">
        <span className="font-semibold text-[#7ea2e3]">File Upload API Endpoint:</span>
        <pre className="bg-[#19213a] rounded p-2 mt-1 overflow-x-auto">{fileUploadEndpoint}</pre>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-[#7ea2e3]">Langflow Run API Endpoint:</span>
        <pre className="bg-[#19213a] rounded p-2 mt-1 overflow-x-auto">{langflowRunEndpoint}</pre>
      </div>
      <div>
        <span className="font-semibold text-[#7ea2e3]">Langflow Run Payload:</span>
        <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em' }}>
          {payloadPreview}
        </SyntaxHighlighter>
      </div>
    </div>
  );
} 