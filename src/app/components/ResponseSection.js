import React from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ResponseSection({ response, title = "Response", colorClass = "text-[#b3cfff]" }) {
  if (!response) return null;
  return (
    <div className="mt-6 bg-[#232e4a] rounded-lg p-4">
      <h2 className={`text-lg font-semibold mb-2 ${colorClass}`}>{title}</h2>
      <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em', maxHeight: '24em', overflow: 'auto', width: '100%' }}>
        {JSON.stringify(response, null, 2)}
      </SyntaxHighlighter>
    </div>
  );
} 