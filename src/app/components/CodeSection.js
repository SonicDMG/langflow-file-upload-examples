import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeSection({ code, language = "javascript", title = "Example Code", colorClass = "text-[#7ea2e3]", codeExamples }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Determine which code to show
  let displayCode = code;
  let displayLanguage = language;
  let tabs = null;
  if (Array.isArray(codeExamples) && codeExamples.length > 0) {
    displayCode = codeExamples[activeTab]?.code;
    displayLanguage = codeExamples[activeTab]?.language || language;
    tabs = (
      <div className="flex mb-2 border-b border-[#2a3b6e]">
        {codeExamples.map((ex, idx) => (
          <button
            key={ex.label}
            className={`px-4 py-1 text-xs font-semibold mr-2 focus:outline-none transition-colors rounded-t-md
              ${activeTab === idx
                ? 'bg-blue-600 text-white shadow-md border-x border-t border-b-0 border-blue-600 z-10'
                : 'bg-[#1a223a] text-[#7ea2e3] hover:bg-[#232e4a] border-b border-[#2a3b6e]'}
            `}
            style={{ position: 'relative', top: activeTab === idx ? '2px' : '0' }}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {ex.label}
          </button>
        ))}
      </div>
    );
  }

  if (!displayCode) return null;
  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="mt-6 bg-[#232e4a] rounded-lg p-4 relative">
      <h3 className={`text-base font-semibold mb-2 ${colorClass}`}>{title}</h3>
      {tabs}
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 text-[#7ea2e3] hover:text-blue-400 focus:outline-none"
        title="Copy code"
        aria-label="Copy code"
        type="button"
      >
        {copied ? (
          <span className="text-xs font-semibold">Copied!</span>
        ) : (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2"/><rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2"/></svg>
        )}
      </button>
      <SyntaxHighlighter language={displayLanguage} style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em', width: '100%' }}>
        {displayCode}
      </SyntaxHighlighter>
    </div>
  );
} 