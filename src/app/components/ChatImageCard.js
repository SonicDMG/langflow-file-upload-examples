import React, { useRef, useState } from "react";

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
  const [imageTextInput, setImageTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [imageResponse, setImageResponse] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const imageFileInputRef = useRef();

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

  return (
    <div className="bg-[#182848] rounded-xl shadow-lg p-6 border border-blue-900">
      <form className="flex flex-col gap-4" onSubmit={handleImageSubmit}>
        <label htmlFor="imageTextInput" className="font-semibold text-blue-200">Chat Input Using Files (Text + Image)</label>
        <input
          id="imageTextInput"
          type="text"
          className="rounded-lg px-4 py-3 bg-[#22304a] border border-blue-800 text-white placeholder-blue-300"
          placeholder="what's in this image?"
          value={imageTextInput}
          onChange={(e) => setImageTextInput(e.target.value)}
        />
        <input
          id="imageFile"
          type="file"
          className="rounded-lg px-4 py-3 bg-[#22304a] border border-blue-800 cursor-pointer text-white"
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
          className="mt-2 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#182848]"
          disabled={imageLoading}
        >
          {imageLoading ? (<span className="spinner" />) : "Submit Image"}
        </button>
      </form>
      {imageResponse && (
        <div className="mt-6 bg-[#22304a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-green-400">Upload Response</h2>
          <pre className="whitespace-pre-wrap break-all text-sm bg-[#182848] p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto mb-4">
            {JSON.stringify(imageResponse.langflowFileUploadResponse, null, 2)}
          </pre>
          <h3 className="text-md font-semibold mb-1 text-green-300">Langflow Response</h3>
          <div className="whitespace-pre-wrap break-all text-sm bg-[#182848] p-4 rounded-lg overflow-x-auto max-h-96 overflow-auto">
            {imageResponse.langflowFlowResponse?.message}
          </div>
        </div>
      )}
    </div>
  );
} 