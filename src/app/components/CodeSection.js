import React from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeSection({ code, language = "javascript", title = "Example Code", colorClass = "text-[#7ea2e3]" }) {
  if (!code) return null;
  return (
    <div className="mt-6 bg-[#232e4a] rounded-lg p-4">
      <h3 className={`text-base font-semibold mb-2 ${colorClass}`}>{title}</h3>
      <SyntaxHighlighter language={language} style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em' }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
} 