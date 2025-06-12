import React from "react";

export default function FileUploadFormSection({
  host, setHost,
  flowId, setFlowId,
  fileComponentName, setFileComponentName,
  fileOnly, setFileOnly,
  fileOnlyInputRef,
  langflowApiKey, setLangflowApiKey,
  showApiKey, setShowApiKey,
  fileOnlyError,
  fileOnlyLoading,
  handleFileOnlySubmit,
  TEXT_ACCEPTED_FILE_TYPES,
  TEXT_ALLOWED_TYPES
}) {
  return (
    <form className="flex flex-col gap-4" onSubmit={handleFileOnlySubmit}>
      <h2 className="text-xl font-semibold text-[#b3cfff] mb-2">File Component (Process File Only, No LLM/Agent)</h2>
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
      <label htmlFor="fileOnly" className="font-semibold text-[#b3cfff]">File</label>
      <input
        id="fileOnly"
        type="file"
        className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] cursor-pointer text-[#b3cfff]"
        ref={fileOnlyInputRef}
        accept={TEXT_ACCEPTED_FILE_TYPES}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file && !TEXT_ALLOWED_TYPES.includes(file.type)) {
            setFileOnlyError('Invalid file type. Only text, PDF, Word, RTF, and CSV files are allowed.');
            setFileOnly(null);
            e.target.value = '';
          } else {
            setFileOnly(file);
            setFileOnlyError("");
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
      {fileOnlyError && <p className="text-red-400 text-sm mt-1">{fileOnlyError}</p>}
      <button
        type="submit"
        className="mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-[#19213a]"
        disabled={fileOnlyLoading}
      >
        {fileOnlyLoading ? (<span className="spinner" />) : "Upload File Only"}
      </button>
    </form>
  );
} 