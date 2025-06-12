import React from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function EndpointSection({ endpoints = [], payload, title = "API Endpoints" }) {
  return (
    <div className="bg-[#232e4a] rounded-lg p-4 text-[#b3cfff] text-sm">
      {title && <h3 className="text-base font-semibold mb-2 text-[#7ea2e3]">{title}</h3>}
      {endpoints.map(({ label, value }) => (
        <div className="mb-2" key={label}>
          <span className="font-semibold text-[#7ea2e3]">{label}</span>
          <pre className="bg-[#19213a] rounded p-2 mt-1 overflow-x-auto">{value}</pre>
        </div>
      ))}
      {payload && (
        <div>
          <span className="font-semibold text-[#7ea2e3]">Payload:</span>
          <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em' }}>
            {payload}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
} 