import React, { useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TEXT_ACCEPTED_FILE_TYPES = ".txt,.pdf,.doc,.docx,.rtf,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/plain,text/csv";
const TEXT_ALLOWED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/csv'
];

export default function ChatFileCard() {
  const [host, setHost] = useState("http://127.0.0.1:7860");
  const [flowId, setFlowId] = useState("");
  const [fileComponentName, setFileComponentName] = useState("");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploadResponse, setUploadResponse] = useState(null);
  const [chatFileLoading, setChatFileLoading] = useState(false);
  const [langflowApiKey, setLangflowApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadResponse(null);
    if (!host || !flowId || !fileComponentName) {
      setError("Please provide Host, Flow ID, and File Component Name.");
      return;
    }
    if (!textInput || !file) {
      setError("Please provide both text input and a file.");
      return;
    }
    setError("");
    setChatFileLoading(true);
    const formData = new FormData();
    formData.append('host', host);
    formData.append('flowId', flowId);
    formData.append('fileComponentName', fileComponentName);
    formData.append('textInput', textInput);
    formData.append('file', file);
    if (langflowApiKey) formData.append('langflowApiKey', langflowApiKey);
    try {
      const res = await fetch('/api/chat-and-file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadResponse(data);
      if (!res.ok) {
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("Failed to send request.");
    } finally {
      setChatFileLoading(false);
    }
  };

  // Construct endpoints using host
  const safeHost = host || "http://127.0.0.1:7860";
  const fileUploadEndpoint = `${safeHost.replace(/\/$/, "")}/api/v2/files/`;
  const langflowRunEndpoint = flowId ? `${safeHost.replace(/\/$/, "")}/api/v1/run/${flowId}` : `${safeHost.replace(/\/$/, "")}/api/v1/run/<flowId>`;
  // Use actual uploaded file path if available, otherwise placeholder
  const uploadedFilePath = uploadResponse?.langflowFileUploadResponse?.path || "/path/to/uploaded/file";

  const payloadPreview = JSON.stringify({
    tweaks: {
      [fileComponentName || 'File-Component-Name']: {
        path: uploadedFilePath
      }
    },
    textInput: textInput || '<text>'
  }, null, 2);

  const codeSnippet = `// 1. Upload the file to Langflow
const file = /* your File object */;
const fileForm = new FormData();
fileForm.append('file', file);
const uploadRes = await fetch('${fileUploadEndpoint}', {
  method: 'POST',
  body: fileForm${langflowApiKey ? ",\n  headers: { 'x-api-key': '" + langflowApiKey + "' }" : ""}
});
const uploadData = await uploadRes.json();
const uploadedPath = uploadData.path;

// 2. Call the Langflow run endpoint
const payload = {
  tweaks: {
    '${fileComponentName || 'File-Component-Name'}': {
      path: uploadedPath
    }
  },
  input_value: textInput
};
const runRes = await fetch('${langflowRunEndpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json'${langflowApiKey ? ", 'x-api-key': '" + langflowApiKey + "'" : ""} },
  body: JSON.stringify(payload)
});
const runData = await runRes.json();
console.log(runData);
`;

  return (
    <div className="bg-[#19213a] rounded-xl shadow-lg p-8 border border-[#2a3b6e]">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold text-[#b3cfff] mb-2">Chat Input & File Component (Text + File)</h2>
        <label htmlFor="host" className="font-semibold text-[#b3cfff]">Host</label>
        <input
          id="host"
          name="host"
          type="text"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
          placeholder="http://127.0.0.1:7860"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        <label htmlFor="flowId" className="font-semibold text-[#b3cfff]">Flow ID</label>
        <input
          id="flowId"
          name="flowId"
          type="text"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
          placeholder="Enter Flow ID"
          value={flowId}
          onChange={(e) => setFlowId(e.target.value)}
        />
        <label htmlFor="fileComponentName" className="font-semibold text-[#b3cfff]">File Component Name</label>
        <input
          id="fileComponentName"
          name="fileComponentName"
          type="text"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
          placeholder="Enter File Component Name"
          value={fileComponentName}
          onChange={(e) => setFileComponentName(e.target.value)}
        />
        <label htmlFor="textInput" className="font-semibold text-[#b3cfff]">Text Input</label>
        <input
          id="textInput"
          type="text"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
          placeholder="Enter your message..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <label htmlFor="file" className="font-semibold text-[#b3cfff]">File</label>
        <input
          id="file"
          type="file"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] cursor-pointer text-[#b3cfff]"
          ref={fileInputRef}
          accept={TEXT_ACCEPTED_FILE_TYPES}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && !TEXT_ALLOWED_TYPES.includes(file.type)) {
              setError('Invalid file type. Only text, PDF, Word, RTF, and CSV files are allowed.');
              setFile(null);
              e.target.value = '';
            } else {
              setFile(file);
              setError("");
            }
          }}
        />
        <label htmlFor="langflowApiKey" className="font-semibold text-[#b3cfff]">Langflow API Key (optional)</label>
        <input
          id="langflowApiKey"
          name="langflowApiKey"
          type={showApiKey ? "text" : "password"}
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
          placeholder="Paste your Langflow API Key (optional)"
          value={langflowApiKey}
          onChange={(e) => setLangflowApiKey(e.target.value)}
        />
        <button
          type="button"
          className="text-xs text-blue-300 hover:text-blue-400 mt-1 self-end"
          onClick={() => setShowApiKey(v => !v)}
        >
          {showApiKey ? "Hide" : "Show"} API Key
        </button>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          className="mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-[#19213a]"
          disabled={chatFileLoading}
        >
          {chatFileLoading ? (<span className="spinner" />) : "Submit"}
        </button>
      </form>
      <div className="mt-6 bg-[#232e4a] rounded-lg p-4 text-[#b3cfff] text-sm">
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
      {uploadResponse && (
        <div className="mt-6 bg-[#232e4a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-[#b3cfff]">Upload Response</h2>
          <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em', maxHeight: '24em', overflow: 'auto' }}>
            {JSON.stringify(uploadResponse, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
} 