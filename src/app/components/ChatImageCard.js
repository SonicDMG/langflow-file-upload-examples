import React, { useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const IMAGE_ACCEPTED_FILE_TYPES = ".jpg,.jpeg,.png,.gif,.bmp,.webp,image/jpeg,image/png,image/gif,image/bmp,image/webp";
const IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/jpg'
];

export default function ChatImageCard() {
  const [host, setHost] = useState("http://127.0.0.1:7860");
  const [flowId, setFlowId] = useState("");
  const [fileComponentName, setFileComponentName] = useState("");
  const [imageTextInput, setImageTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [imageResponse, setImageResponse] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const imageFileInputRef = useRef();

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setImageResponse(null);
    if (!host || !flowId || !fileComponentName) {
      setImageError("Please provide Host, Flow ID, and File Component Name.");
      return;
    }
    if (!imageTextInput || !imageFile) {
      setImageError("Please provide both text input and an image file.");
      return;
    }
    setImageError("");
    setImageLoading(true);
    const formData = new FormData();
    formData.append('host', host);
    formData.append('flowId', flowId);
    formData.append('fileComponentName', fileComponentName);
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

  // Construct endpoints using host
  const safeHost = host || "http://127.0.0.1:7860";
  const fileUploadEndpoint = flowId ? `${safeHost.replace(/\/$/, "")}/api/v1/files/upload/${flowId}` : `${safeHost.replace(/\/$/, "")}/api/v1/files/upload/<flowId>`;
  const langflowRunEndpoint = flowId ? `${safeHost.replace(/\/$/, "")}/api/v1/run/${flowId}` : `${safeHost.replace(/\/$/, "")}/api/v1/run/<flowId>`;
  // Use actual uploaded file path if available, otherwise placeholder
  const uploadedFilePath = imageResponse?.langflowFileUploadResponse?.path || "/path/to/uploaded/image";

  const payloadPreview = JSON.stringify({
    tweaks: {
      [fileComponentName || 'File-Component-Name']: {
        path: uploadedFilePath
      }
    },
    textInput: imageTextInput || '<text>'
  }, null, 2);

  return (
    <div className="bg-[#19213a] rounded-xl shadow-lg p-8 border border-[#2a3b6e]">
      <form className="flex flex-col gap-4" onSubmit={handleImageSubmit}>
        <h2 className="text-xl font-semibold text-[#b3cfff] mb-2">Chat Input Using Files (Text + Image)</h2>
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
        <label htmlFor="imageTextInput" className="font-semibold text-[#b3cfff]">Text Input</label>
        <input
          id="imageTextInput"
          type="text"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
          placeholder="what's in this image?"
          value={imageTextInput}
          onChange={(e) => setImageTextInput(e.target.value)}
        />
        <label htmlFor="imageFile" className="font-semibold text-[#b3cfff]">Image File</label>
        <input
          id="imageFile"
          type="file"
          className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] cursor-pointer text-[#b3cfff]"
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
          className="mt-2 bg-[#22c55e] hover:bg-[#16a34a] transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 focus:ring-offset-[#19213a]"
          disabled={imageLoading}
        >
          {imageLoading ? (<span className="spinner" />) : "Submit Image"}
        </button>
      </form>
      <div className="mt-6 bg-[#232e4a] rounded-lg p-4 text-[#b3cfff] text-sm">
        <div className="mb-2">
          <span className="font-semibold text-[#4ade80]">File Upload API Endpoint:</span>
          <pre className="bg-[#19213a] rounded p-2 mt-1 overflow-x-auto">{fileUploadEndpoint}</pre>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-[#4ade80]">Langflow Run API Endpoint:</span>
          <pre className="bg-[#19213a] rounded p-2 mt-1 overflow-x-auto">{langflowRunEndpoint}</pre>
        </div>
        <div>
          <span className="font-semibold text-[#4ade80]">Langflow Run Payload:</span>
          <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em' }}>
            {payloadPreview}
          </SyntaxHighlighter>
        </div>
      </div>
      {imageResponse && (
        <div className="mt-6 bg-[#232e4a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-[#4ade80]">Upload Response</h2>
          <SyntaxHighlighter language="json" style={atomDark} customStyle={{ borderRadius: '0.5rem', background: '#19213a', fontSize: '0.95em', padding: '1em', marginTop: '0.5em', maxHeight: '24em', overflow: 'auto' }}>
            {JSON.stringify(imageResponse, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
} 