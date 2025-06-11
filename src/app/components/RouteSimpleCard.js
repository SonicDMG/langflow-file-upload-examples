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

export default function RouteSimpleCard() {
  const [simpleFile, setSimpleFile] = useState(null);
  const [simpleFileError, setSimpleFileError] = useState("");
  const [simpleFileResponse, setSimpleFileResponse] = useState(null);
  const [simpleFileLoading, setSimpleFileLoading] = useState(false);
  const simpleFileInputRef = useRef();

  const handleSimpleFileSubmit = async (e) => {
    e.preventDefault();
    setSimpleFileResponse(null);
    if (!simpleFile) {
      setSimpleFileError("Please select a file to upload.");
      return;
    }
    setSimpleFileError("");
    setSimpleFileLoading(true);
    const formData = new FormData();
    formData.append('file', simpleFile);
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

  return (
    <div className="bg-[#182848] rounded-xl shadow-lg p-6 border border-yellow-700">
      <form className="flex flex-col gap-4" onSubmit={handleSimpleFileSubmit}>
        <label htmlFor="simpleFile" className="font-semibold text-yellow-200">Upload File (Route-Simple)</label>
        <input
          id="simpleFile"
          type="file"
          className="rounded-lg px-4 py-3 bg-[#22304a] border border-yellow-700 cursor-pointer text-white"
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
        {simpleFileError && <p className="text-yellow-400 text-sm mt-1">{simpleFileError}</p>}
        <button
          type="submit"
          className="mt-2 bg-yellow-600 hover:bg-yellow-700 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-[#182848]"
          disabled={simpleFileLoading}
        >
          {simpleFileLoading ? (<span className="spinner" />) : "Upload Route-Simple File"}
        </button>
      </form>
      {simpleFileResponse && (
        <div className="mt-6 bg-[#22304a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-yellow-400">Upload Response</h2>
          <pre className="whitespace-pre-wrap break-all text-sm bg-[#182848] p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
            {JSON.stringify(simpleFileResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 