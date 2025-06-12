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

export default function RouteSimpleCard() {
  const [host, setHost] = useState("http://127.0.0.1:7860");
  const [flowId, setFlowId] = useState("");
  const [fileComponentName, setFileComponentName] = useState("");
  const [simpleFile, setSimpleFile] = useState(null);
  const [simpleFileError, setSimpleFileError] = useState("");
  const [simpleFileResponse, setSimpleFileResponse] = useState(null);
  const [simpleFileLoading, setSimpleFileLoading] = useState(false);
  const simpleFileInputRef = useRef();
  const [langflowApiKey, setLangflowApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSimpleFileSubmit = async (e) => {
    e.preventDefault();
    setSimpleFileResponse(null);
    if (!host || !flowId || !fileComponentName) {
      setSimpleFileError("Please provide Host, Flow ID, and File Component Name.");
      return;
    }
    if (!simpleFile) {
      setSimpleFileError("Please select a file to upload.");
      return;
    }
    setSimpleFileError("");
    setSimpleFileLoading(true);
    const formData = new FormData();
    formData.append('host', host);
    formData.append('flowId', flowId);
    formData.append('fileComponentName', fileComponentName);
    formData.append('file', simpleFile);
    if (langflowApiKey) formData.append('langflowApiKey', langflowApiKey);
    try {
      const res = await fetch('/api/route-simple', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setSimpleFileResponse(data.langflowFileUploadResponse || null);
      if (!res.ok) {
        setSimpleFileError(data.error || "An error occurred.");
      }
    } catch (err) {
      setSimpleFileError("Failed to send request.");
    } finally {
      setSimpleFileLoading(false);
    }
  };

  // Construct endpoints using host
  const safeHost = host || "http://127.0.0.1:7860";
  const fileUploadEndpoint = flowId ? `${safeHost.replace(/\/$/, "")}/api/v2/files/` : `${safeHost.replace(/\/$/, "")}/api/v2/files/`;
  const langflowRunEndpoint = flowId ? `${safeHost.replace(/\/$/, "")}/api/v1/run/${flowId}` : `${safeHost.replace(/\/$/, "")}/api/v1/run/<flowId>`;
  // Use actual uploaded file path if available, otherwise placeholder
  const uploadedFilePath = simpleFileResponse?.path || simpleFileResponse?.langflowFileUploadResponse?.path || "/path/to/uploaded/file";

  const payloadPreview = JSON.stringify({
    tweaks: {
      [fileComponentName || 'File-Component-Name']: {
        path: uploadedFilePath
      }
    }
  }, null, 2);

  // Full code snippet for file upload and Langflow call
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
  }
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
      <form className="flex flex-col gap-4" onSubmit={handleSimpleFileSubmit}>
        <h2 className="text-xl font-semibold text-[#b3cfff] mb-2">Simple File Upload (Minimal Example)</h2>
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
        <label htmlFor="simpleFile" className="font-semibold text-[#b3cfff]">File</label>
        <input
          id="simpleFile"
          type="file"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] cursor-pointer text-[#b3cfff]"
          ref={simpleFileInputRef}
          accept={TEXT_ACCEPTED_FILE_TYPES}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && !TEXT_ALLOWED_TYPES.includes(file.type)) {
              setSimpleFileError('Invalid file type. Only text, PDF, Word, RTF, and CSV files are allowed.');
              setSimpleFile(null);
              e.target.value = '';
            } else {
              setSimpleFile(file);
              setSimpleFileError("");
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
        {simpleFileError && <p className="text-yellow-400 text-sm mt-1">{simpleFileError}</p>}
        <button
          type="submit"
          className="mt-2 bg-yellow-600 hover:bg-yellow-700 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-[#19213a]"
          disabled={simpleFileLoading}
        >
          {simpleFileLoading ? (<span className="spinner" />) : "Upload Route-Simple File"}
        </button>
      </form>
      <div className="mt-6 bg-[#232e4a] rounded-lg p-4 text-[#b3cfff] text-sm">
        <div className="mb-2">
          <span className="font-semibold text-[#eab308]">File Upload API Endpoint:</span>
          <pre className="bg-[#19213a] rounded p-2 mt-1 overflow-x-auto">{fileUploadEndpoint}</pre>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-[#eab308]">Langflow Run API Endpoint:</span>
          <pre className="bg-[#19213a] rounded p-2 mt-1 overflow-x-auto">{langflowRunEndpoint}</pre>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-[#eab308]">Langflow Run Payload:</span>
          <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em' }}>
            {payloadPreview}
          </SyntaxHighlighter>
        </div>
        <div>
          <span className="font-semibold text-[#eab308]">Full Example Code:</span>
          <SyntaxHighlighter language="javascript" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em' }}>
            {codeSnippet}
          </SyntaxHighlighter>
        </div>
      </div>
      {simpleFileResponse && (
        <div className="mt-6 bg-[#232e4a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-[#eab308]">Upload Response</h2>
          <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em', maxHeight: '24em', overflow: 'auto' }}>
            {JSON.stringify(simpleFileResponse, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
} 