import React, { useRef, useState } from "react";

const TEXT_ACCEPTED_FILE_TYPES = ".txt,.pdf,.doc,.docx,.rtf,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/plain,text/csv";
const TEXT_ALLOWED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/csv'
];

export default function FileUploadCard() {
  const [fileOnly, setFileOnly] = useState(null);
  const [fileOnlyError, setFileOnlyError] = useState("");
  const [fileOnlyResponse, setFileOnlyResponse] = useState(null);
  const [fileOnlyLoading, setFileOnlyLoading] = useState(false);
  const fileOnlyInputRef = useRef();

  const handleFileOnlySubmit = async (e) => {
    e.preventDefault();
    setFileOnlyResponse(null);
    if (!fileOnly) {
      setFileOnlyError("Please select a file to upload.");
      return;
    }
    setFileOnlyError("");
    setFileOnlyLoading(true);
    const formData = new FormData();
    formData.append('file', fileOnly);
    try {
      const res = await fetch('/api/file-only', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setFileOnlyResponse(data.langflowFileUploadResponse || null);
      if (!res.ok) {
        setFileOnlyError(data.error || "An error occurred.");
      }
    } catch (err) {
      setFileOnlyError("Failed to send request.");
    } finally {
      setFileOnlyLoading(false);
    }
  };

  return (
    <div className="bg-[#182848] rounded-xl shadow-lg p-6 border border-blue-900">
      <form className="flex flex-col gap-4" onSubmit={handleFileOnlySubmit}>
        <label htmlFor="fileOnly" className="font-semibold text-blue-200">File Component (Process File Only, No LLM/Agent)</label>
        <input
          id="fileOnly"
          type="file"
          className="rounded-lg px-4 py-3 bg-[#22304a] border border-blue-800 cursor-pointer text-white"
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
        {fileOnlyError && <p className="text-red-400 text-sm mt-1">{fileOnlyError}</p>}
        <button
          type="submit"
          className="mt-2 bg-blue-700 hover:bg-blue-800 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#182848]"
          disabled={fileOnlyLoading}
        >
          {fileOnlyLoading ? (<span className="spinner" />) : "Upload File Only"}
        </button>
      </form>
      {fileOnlyResponse && (
        <div className="mt-6 bg-[#22304a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-400">Upload Response</h2>
          <pre className="whitespace-pre-wrap break-all text-sm bg-[#182848] p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
            {JSON.stringify(fileOnlyResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 