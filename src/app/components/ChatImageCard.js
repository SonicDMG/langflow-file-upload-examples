import React, { useRef, useState } from "react";
import EndpointSection from "./EndpointSection";
import ResponseSection from "./ResponseSection";
import CodeSection from "./CodeSection";

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
  const [langflowApiKey, setLangflowApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

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
    if (langflowApiKey) formData.append('langflowApiKey', langflowApiKey);
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
  const uploadedFilePath = imageResponse?.file_path || imageResponse?.langflowFileUploadResponse?.file_path || imageResponse?.path || imageResponse?.langflowFileUploadResponse?.path || "/path/to/uploaded/image";

  const payloadPreview = JSON.stringify({
    tweaks: {
      [fileComponentName || 'File-Component-Name']: {
        path: uploadedFilePath
      }
    },
    textInput: imageTextInput || '<text>'
  }, null, 2);

  const fileName = imageFile ? imageFile.name : 'yourimage.png';

  const browserCode = `// 1. Get the image file from the file picker
const fileInput = document.getElementById("imageFile");
const file = fileInput.files[0];
// User selected: ${fileName}

// 2. Upload the image to Langflow
const fileForm = new FormData();
fileForm.append('file', file);
const uploadRes = await fetch('${fileUploadEndpoint}', {
  method: 'POST',
  body: fileForm,${langflowApiKey ? "\n  headers: { 'x-api-key': '" + langflowApiKey + "' }," : ""}
});
const uploadData = await uploadRes.json();
const uploadedPath = uploadData.file_path || uploadData.path;

// 3. Call the Langflow run endpoint
const payload = {
  tweaks: {
    '${fileComponentName || 'File-Component-Name'}': {
      path: uploadedPath
    }
  },
  textInput: "${imageTextInput || '<text>'}"
};
const runRes = await fetch('${langflowRunEndpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json'${langflowApiKey ? ", 'x-api-key': '" + langflowApiKey + "'" : ""} },
  body: JSON.stringify(payload)
});
const runData = await runRes.json();
console.log(runData);
`;

  const nodeCode = `// Node.js 18+ example using global fetch, FormData, and Blob
import fs from 'fs/promises';

// 1. Prepare the form data with the image to upload
const fileBuffer = await fs.readFile('${fileName}');
const data = new FormData();
data.append('file', new Blob([fileBuffer]), '${fileName}');
${langflowApiKey ? `data.append('langflowApiKey', '${langflowApiKey}');` : ''}

// 2. Upload the image to Langflow
const uploadRes = await fetch('${fileUploadEndpoint}', {
  method: 'POST',
  body: data
});
const uploadData = await uploadRes.json();
const uploadedPath = uploadData.file_path;

// 3. Call the Langflow run endpoint with the uploaded file path
const payload = {
  input_value: "${imageTextInput || 'What is in this image?'}",
  output_type: "chat",
  input_type: "chat",
  tweaks: {
    '${fileComponentName || 'File-Component-Name'}': {
      files: [uploadedPath]
    }
  }
};
const runRes = await fetch('${langflowRunEndpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json'${langflowApiKey ? ", 'x-api-key': '" + langflowApiKey + "'" : ""} },
  body: JSON.stringify(payload)
});
const langflowData = await runRes.json();
// Output only the message
console.log(langflowData.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text);
`;

  const pythonCode = `# Python example using requests
import requests
import json

# 1. Set the upload URL
url = "${fileUploadEndpoint}"

# 2. Prepare the image file and payload
payload = {}
files = [
  ('file', ('${fileName}', open('${fileName}', 'rb'), 'application/octet-stream'))
]
headers = {
  'Accept': 'application/json'${langflowApiKey ? ",\n  'x-api-key': '" + langflowApiKey + "'" : ""}
}

# 3. Upload the image to Langflow
response = requests.request("POST", url, headers=headers, data=payload, files=files)
print(response.text)

# 4. Get the uploaded file path from the response
uploaded_data = response.json()
uploaded_path = uploaded_data.get('file_path')

# 5. Call the Langflow run endpoint with the uploaded file path
run_url = "${langflowRunEndpoint}"
run_payload = {
    "input_value": "${imageTextInput || 'What is in this image?'}",
    "output_type": "chat",
    "input_type": "chat",
    "tweaks": {
        "${fileComponentName || 'File-Component-Name'}": {
            "files": [uploaded_path]
        }
    }
}
run_headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'${langflowApiKey ? ",\n    'x-api-key': '" + langflowApiKey + "'" : ""}
}
run_response = requests.post(run_url, headers=run_headers, data=json.dumps(run_payload))
langflow_data = run_response.json()
# Output only the message
message = None
try:
    message = langflow_data['outputs'][0]['outputs'][0]['results']['message']['data']['text']
except (KeyError, IndexError, TypeError):
    pass
print(message)
`;

  const curlCode = `#!/bin/bash
# Bash script for uploading an image and executing the flow in Langflow
# This script uploads the image, extracts the uploaded path, executes the flow, and prints only the message result

# Clear any existing value of uploaded_path
unset uploaded_path

# Upload the image and capture the path
uploaded_path=$(curl -s -X POST \\
  "${fileUploadEndpoint}" \\
  -H "Accept: application/json" \\
  -F "file=@${fileName}"${langflowApiKey ? ` \\
  -H "x-api-key: ${langflowApiKey}"` : ''} \\
  | jq -r '.file_path')

# Verify that we got a valid path
if [ -z "$uploaded_path" ] || [ "$uploaded_path" = "null" ]; then
  echo "Error: Failed to get a valid uploaded file path"
  exit 1
fi

# Execute the flow with the uploaded path
curl -s --request POST \\
  --url "${langflowRunEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json"${langflowApiKey ? ` \\
  -H "x-api-key: ${langflowApiKey}"` : ''} \\
  -d '{
    "input_value": "${imageTextInput ? imageTextInput.replace(/'/g, "\\'") : 'What is in this image?'}",
    "output_type": "chat",
    "input_type": "chat",
    "tweaks": {
      "${fileComponentName || 'File-Component-Name'}": {
        "files": ["'"$uploaded_path"'"]
      }
    }
  }' \\
  | jq -r '.outputs[0].outputs[0].results.message.data.text'
`;

  return (
    <div className="bg-[#19213a] rounded-xl shadow-lg p-4 md:p-8 border border-[#2a3b6e] w-full mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
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
            {imageError && <p className="text-red-400 text-sm mt-1">{imageError}</p>}
            <button
              type="submit"
              className="mt-2 bg-[#22c55e] hover:bg-[#16a34a] transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 focus:ring-offset-[#19213a]"
              disabled={imageLoading}
            >
              {imageLoading ? (<span className="spinner" />) : "Submit Image"}
            </button>
          </form>
        </div>
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <EndpointSection
            endpoints={[
              { label: "File Upload API Endpoint:", value: fileUploadEndpoint },
              { label: "Langflow Run API Endpoint:", value: langflowRunEndpoint }
            ]}
            payload={payloadPreview}
            title={null}
          />
          <ResponseSection response={imageResponse} title="Upload Response" colorClass="text-[#4ade80]" />
          <CodeSection
            codeExamples={[
              { label: 'Node.js', code: nodeCode, language: 'javascript' },
              { label: 'Python', code: pythonCode, language: 'python' },
              { label: 'cURL', code: curlCode, language: 'bash' }
            ]}
            title="Example Code"
            colorClass="text-[#7ea2e3]"
          />
        </div>
      </div>
    </div>
  );
} 