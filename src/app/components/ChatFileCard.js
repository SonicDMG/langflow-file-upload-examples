import React, { useRef, useState } from "react";
import EndpointSection from "./EndpointSection";
import ResponseSection from "./ResponseSection";
import CodeSection from "./CodeSection";

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
  const [input_value, setInputValue] = useState("");
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
    if (!input_value || !file) {
      setError("Please provide both input value and a file.");
      return;
    }
    setError("");
    setChatFileLoading(true);
    const formData = new FormData();
    formData.append('host', host);
    formData.append('flowId', flowId);
    formData.append('fileComponentName', fileComponentName);
    formData.append('input_value', input_value);
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
    input_value: input_value || '<text>',
    output_type: 'chat',
    input_type: 'chat',
    tweaks: fileComponentName ? {
      [fileComponentName]: {
        path: uploadedFilePath
      }
    } : undefined
  }, null, 2);

  const fileName = file ? file.name : 'yourfile.txt';

  const nodeCode = `// Node 18+ example using global fetch, FormData, and Blob
import fs from 'fs/promises';

// 1. Prepare the form data with the file to upload
const fileBuffer = await fs.readFile('${fileName}');
const data = new FormData();
data.append('file', new Blob([fileBuffer]), '${fileName}');
const headers = ${langflowApiKey ? `{ 'x-api-key': '${langflowApiKey}' }` : 'undefined'};

// 2. Upload the file to Langflow
const uploadRes = await fetch('${fileUploadEndpoint}', {
  method: 'POST',
  headers,
  body: data
});
const uploadData = await uploadRes.json();
const uploadedPath = uploadData.path;

// 3. Call the Langflow run endpoint with the uploaded file path
const payload = {
  input_value: "${input_value || 'What is in this file?'}",
  output_type: "chat",
  input_type: "chat",
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
const langflowData = await runRes.json();
// Output only the message
console.log(langflowData.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text);
`;

  const pythonCode = `# Python example using requests
import requests
import json

# 1. Set the upload URL
url = "${fileUploadEndpoint}"

# 2. Prepare the file and payload
payload = {}
files = [
  ('file', ('${fileName}', open('${fileName}', 'rb'), 'application/octet-stream'))
]
headers = {
  'Accept': 'application/json'${langflowApiKey ? ",\n  'x-api-key': '" + langflowApiKey + "'" : ""}
}

# 3. Upload the file to Langflow
response = requests.request("POST", url, headers=headers, data=payload, files=files)
print(response.text)

# 4. Get the uploaded file path from the response
uploaded_data = response.json()
uploaded_path = uploaded_data.get('path')

# 5. Call the Langflow run endpoint with the uploaded file path
run_url = "${langflowRunEndpoint}"
run_payload = {
    "input_value": "${input_value || 'What is in this file?'}",
    "output_type": "chat",
    "input_type": "chat",
    "tweaks": {
        "${fileComponentName || 'File-Component-Name'}": {
            "path": uploaded_path
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
# Bash script for uploading a file and executing the flow in Langflow
# This script uploads the file, extracts the uploaded path, executes the flow, and prints only the message result

# Clear any existing value of uploaded_path
unset uploaded_path

# Upload the file and capture the path
uploaded_path=$(curl -s -X POST \\
  "${fileUploadEndpoint}" \\
  -H "Accept: application/json" \\
  -F "file=@${fileName}"${langflowApiKey ? ` \\
  -H "x-api-key: ${langflowApiKey}"` : ''} \\
  | jq -r '.path')

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
    "input_value": "${input_value ? input_value.replace(/'/g, "\\'") : 'What is in this file?'}",
    "output_type": "chat",
    "input_type": "chat",
    "tweaks": {
      "${fileComponentName || 'File-Component-Name'}": {
        "path": "'"$uploaded_path"'"
      }
    }
  }' \\
  | jq -r '.outputs[0].outputs[0].results.message.data.text'
`;

  return (
    <div className="bg-[#19213a] rounded-xl shadow-lg p-4 md:p-8 border border-[#2a3b6e] w-full mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
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
            <label htmlFor="input_value" className="font-semibold text-[#b3cfff]">Input Value</label>
            <input
              id="input_value"
              type="text"
              className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
              placeholder="Enter your message..."
              value={input_value}
              onChange={(e) => setInputValue(e.target.value)}
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
          <ResponseSection response={uploadResponse} title="Upload Response" colorClass="text-[#b3cfff]" />
          <CodeSection
            codeExamples={[
              { label: 'Python', code: pythonCode, language: 'python' },
              { label: 'Javascript', code: nodeCode, language: 'javascript' },
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