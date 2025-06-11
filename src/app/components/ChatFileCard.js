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

export default function ChatFileCard() {
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploadResponse, setUploadResponse] = useState(null);
  const [chatFileLoading, setChatFileLoading] = useState(false);
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadResponse(null);
    if (!textInput || !file) {
      setError("Please provide both text input and a file.");
      return;
    }
    setError("");
    setChatFileLoading(true);
    const formData = new FormData();
    formData.append('textInput', textInput);
    formData.append('file', file);
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

  return (
    <div className="bg-[#182848] rounded-xl shadow-lg p-6 border border-blue-900">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label htmlFor="textInput" className="font-semibold text-blue-200">Chat Input & File Component (Text + File)</label>
        <input
          id="textInput"
          type="text"
          className="rounded-lg px-4 py-3 bg-[#22304a] border border-blue-800 text-white placeholder-blue-300"
          placeholder="Enter your message..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <input
          id="file"
          type="file"
          className="rounded-lg px-4 py-3 bg-[#22304a] border border-blue-800 cursor-pointer text-white"
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
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          className="mt-2 bg-blue-700 hover:bg-blue-800 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#182848]"
          disabled={chatFileLoading}
        >
          {chatFileLoading ? (<span className="spinner" />) : "Submit"}
        </button>
      </form>
      {uploadResponse && (
        <div className="mt-6 bg-[#22304a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-400">Upload Response</h2>
          <pre className="whitespace-pre-wrap break-all text-sm bg-[#182848] p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto mb-4">
            {JSON.stringify(uploadResponse.langflowFileUploadResponse, null, 2)}
          </pre>
          <h3 className="text-md font-semibold mb-1 text-blue-300">Langflow Response</h3>
          <div className="whitespace-pre-wrap break-all text-sm bg-[#182848] p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
            {uploadResponse.langflowFlowResponse?.message}
          </div>
        </div>
      )}
    </div>
  );
} 