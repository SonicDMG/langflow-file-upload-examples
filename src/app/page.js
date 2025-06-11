'use client';
import React, { useRef, useState } from "react";

// Global constants for accepted file types
const TEXT_ACCEPTED_FILE_TYPES = ".txt,.pdf,.doc,.docx,.rtf,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/plain,text/csv";
const IMAGE_ACCEPTED_FILE_TYPES = ".jpg,.jpeg,.png,.gif,.bmp,.webp,image/jpeg,image/png,image/gif,image/bmp,image/webp";
const TEXT_ALLOWED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/csv'
];
const IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/jpg'
];
const GLOBAL_ACCEPTED_FILE_TYPES = `${TEXT_ACCEPTED_FILE_TYPES},${IMAGE_ACCEPTED_FILE_TYPES}`;
const GLOBAL_ALLOWED_TYPES = [...TEXT_ALLOWED_TYPES, ...IMAGE_ALLOWED_TYPES];

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploadResponse, setUploadResponse] = useState(null);
  const fileInputRef = useRef();
  const [fileOnly, setFileOnly] = useState(null);
  const [fileOnlyError, setFileOnlyError] = useState("");
  const [fileOnlyResponse, setFileOnlyResponse] = useState(null);
  const fileOnlyInputRef = useRef();
  const [imageTextInput, setImageTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [imageResponse, setImageResponse] = useState(null);
  const imageFileInputRef = useRef();
  const [simpleFile, setSimpleFile] = useState(null);
  const [simpleFileError, setSimpleFileError] = useState("");
  const [simpleFileResponse, setSimpleFileResponse] = useState(null);
  const simpleFileInputRef = useRef();
  const [fileOnlyLoading, setFileOnlyLoading] = useState(false);
  const [simpleFileLoading, setSimpleFileLoading] = useState(false);
  const [chatFileLoading, setChatFileLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setImageResponse(null);
    if (!imageTextInput || !imageFile) {
      setImageError("Please provide both text input and an image file.");
      return;
    }
    setImageError("");
    setImageLoading(true);
    const formData = new FormData();
    formData.append('textInput', imageTextInput);
    formData.append('file', imageFile);
    try {
      const res = await fetch('/api/chat-and-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setImageResponse(data);
      if (!res.ok) {
        setImageError(data.error || "An error occurred.");
      }
    } catch (err) {
      setImageError("Failed to send request.");
    } finally {
      setImageLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      {/* File-only upload row */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 mb-8">
        <form className="w-full md:w-1/2 bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border-2 border-blue-800" onSubmit={handleFileOnlySubmit}>
          <label htmlFor="fileOnly" className="font-semibold">File Component (Process File Only, No LLM/Agent)</label>
          <a href="https://docs.langflow.org/api/upload-user-file" className="text-xs text-blue-400 underline mb-2" target="_blank" rel="noopener noreferrer">Langflow File API: v2 (docs)</a>
          <input
            id="fileOnly"
            type="file"
            className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 cursor-pointer"
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
            className="mt-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            disabled={fileOnlyLoading}
          >
            {fileOnlyLoading ? (<span className="spinner" />) : "Upload File Only"}
          </button>
        </form>
        <div className="w-full md:w-5/6 flex items-start">
          {fileOnlyResponse && (
            <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-400">Langflow File-Only Upload Response</h2>
              <pre className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
                {JSON.stringify(fileOnlyResponse, null, 2)}
              </pre>
              {fileOnlyResponse?.langflowFlowResponse?.message && (
                <>
                  <h3 className="text-md font-semibold mb-1 text-blue-300 mt-4">Langflow Response</h3>
                  <div className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
                    {fileOnlyResponse.langflowFlowResponse.message}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Chat & File upload row */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 mb-8">
        <form className="w-full md:w-1/2 bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label htmlFor="textInput" className="font-semibold">Chat Input & File Component (Text + File)</label>
          <a href="https://docs.langflow.org/api/upload-user-file" className="text-xs text-blue-400 underline mb-2" target="_blank" rel="noopener noreferrer">Langflow File API: v2 (docs)</a>
          <input
            id="textInput"
            type="text"
            className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            placeholder="Enter text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <label htmlFor="file" className="font-semibold">Upload File</label>
          <input
            id="file"
            type="file"
            className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 cursor-pointer"
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
            className="mt-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            disabled={chatFileLoading}
          >
            {chatFileLoading ? (<span className="spinner" />) : "Submit"}
          </button>
        </form>
        <div className="w-full md:w-5/6 flex items-start">
          {uploadResponse && (
            <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-400">Langflow Chat & File Upload Response</h2>
              <h3 className="text-md font-semibold mb-1 text-blue-300">File Upload Response</h3>
              <pre className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto mb-4">
                {JSON.stringify(uploadResponse.langflowFileUploadResponse, null, 2)}
              </pre>
              <h3 className="text-md font-semibold mb-1 text-blue-300">Langflow Response</h3>
              <div className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
                {uploadResponse.langflowFlowResponse?.message}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Chat & Image upload row */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 mb-8">
        <form className="w-full md:w-1/2 bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border-2 border-green-800" onSubmit={handleImageSubmit}>
          <label htmlFor="imageTextInput" className="font-semibold">Chat Input Using Files (Text + Image)</label>
          <div className="mb-2">
            <a href="https://docs.langflow.org/api/upload-file-1" className="text-xs text-blue-400 underline block" target="_blank" rel="noopener noreferrer">Langflow File API: v1 (docs)</a>
            <a href="https://docs.langflow.org/api-reference-api-examples#upload-image-files-v1" className="text-xs text-blue-400 underline block mt-1" target="_blank" rel="noopener noreferrer">Image Upload Example (docs)</a>
          </div>
          <input
            id="imageTextInput"
            type="text"
            className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
            placeholder="Enter text for image flow"
            value={imageTextInput}
            onChange={(e) => setImageTextInput(e.target.value)}
          />
          <label htmlFor="imageFile" className="font-semibold">Upload Image File</label>
          <input
            id="imageFile"
            type="file"
            className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 cursor-pointer"
            ref={imageFileInputRef}
            accept={IMAGE_ACCEPTED_FILE_TYPES}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file && !IMAGE_ALLOWED_TYPES.includes(file.type)) {
                setImageError('Invalid file type. Only image files (jpg, jpeg, png, gif, bmp, webp) are allowed.');
                setImageFile(null);
                e.target.value = '';
              } else {
                setImageFile(file);
                setImageError("");
              }
            }}
          />
          {imageError && <p className="text-red-400 text-sm mt-1">{imageError}</p>}
          <button
            type="submit"
            className="mt-4 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            disabled={imageLoading}
          >
            {imageLoading ? (<span className="spinner" />) : "Submit Image"}
          </button>
        </form>
        <div className="w-full md:w-5/6 flex items-start">
          {imageResponse && (
            <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold mb-2 text-green-400">Langflow Chat & Image Upload Response</h2>
              <h3 className="text-md font-semibold mb-1 text-green-300">File Upload Response</h3>
              <pre className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto mb-4">
                {JSON.stringify(imageResponse.langflowFileUploadResponse, null, 2)}
              </pre>
              <h3 className="text-md font-semibold mb-1 text-green-300">Langflow Response</h3>
              <div className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
                {imageResponse.langflowFlowResponse?.message}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Simple Route File Upload row (moved to bottom) */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 mb-8">
        <form className="w-full md:w-1/2 bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border-2 border-yellow-800" onSubmit={handleSimpleFileSubmit}>
          <label htmlFor="simpleFile" className="font-semibold">Upload File (Route-Simple)</label>
          <a href="https://docs.langflow.org/api/upload-user-file" className="text-xs text-blue-400 underline mb-2" target="_blank" rel="noopener noreferrer">Langflow File API: v2 (docs)</a>
          <input
            id="simpleFile"
            type="file"
            className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 cursor-pointer"
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
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            disabled={simpleFileLoading}
          >
            {simpleFileLoading ? (<span className="spinner" />) : "Upload Route-Simple File"}
          </button>
        </form>
        <div className="w-full md:w-5/6 flex items-start">
          {simpleFileResponse && (
            <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold mb-2 text-yellow-400">Langflow Route-Simple Upload Response</h2>
              <pre className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
                {JSON.stringify(simpleFileResponse, null, 2)}
              </pre>
              {simpleFileResponse?.langflowFlowResponse?.message && (
                <>
                  <h3 className="text-md font-semibold mb-1 text-yellow-300 mt-4">Langflow Response</h3>
                  <div className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
                    {simpleFileResponse.langflowFlowResponse.message}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
