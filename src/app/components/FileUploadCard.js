import React, { useRef, useState } from "react";
import FileUploadFormSection from "./FileUploadFormSection";
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

export default function FileUploadCard() {
  const [host, setHost] = useState("http://127.0.0.1:7860");
  const [flowId, setFlowId] = useState("");
  const [fileComponentName, setFileComponentName] = useState("");
  const [fileOnly, setFileOnly] = useState(null);
  const [fileOnlyError, setFileOnlyError] = useState("");
  const [fileOnlyResponse, setFileOnlyResponse] = useState(null);
  const [fileOnlyLoading, setFileOnlyLoading] = useState(false);
  const fileOnlyInputRef = useRef();
  const [langflowApiKey, setLangflowApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleFileOnlySubmit = async (e) => {
    e.preventDefault();
    setFileOnlyResponse(null);
    if (!host || !flowId || !fileComponentName) {
      setFileOnlyError("Please provide Host, Flow ID, and File Component Name.");
      return;
    }
    if (!fileOnly) {
      setFileOnlyError("Please select a file to upload.");
      return;
    }
    setFileOnlyError("");
    setFileOnlyLoading(true);
    const formData = new FormData();
    formData.append('file', fileOnly);
    formData.append('flowId', flowId);
    formData.append('fileComponentName', fileComponentName);
    formData.append('host', host);
    if (langflowApiKey) formData.append('langflowApiKey', langflowApiKey);
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

  // Construct endpoints using host
  const safeHost = host || "http://127.0.0.1:7860";
  const fileUploadEndpoint = `${safeHost.replace(/\/$/, "")}/api/v2/files/`;
  const langflowRunEndpoint = flowId ? `${safeHost.replace(/\/$/, "")}/api/v1/run/${flowId}` : `${safeHost.replace(/\/$/, "")}/api/v1/run/<flowId>`;
  // Use actual uploaded file path if available, otherwise placeholder
  const uploadedFilePath = fileOnlyResponse?.path || fileOnlyResponse?.langflowFileUploadResponse?.path || "/path/to/uploaded/file";

  const payloadPreview = JSON.stringify({
    tweaks: {
      [fileComponentName || 'File-Component-Name']: {
        path: uploadedFilePath
      }
    }
  }, null, 2);

  const fileName = fileOnly ? fileOnly.name : 'yourfile.txt';

  const browserCode = `// 1. Get the file from the file picker
const fileInput = document.getElementById("fileOnly");
const file = fileInput.files[0];
// User selected: ${fileName}

// 2. Upload the file to Langflow
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

  const nodeCode = `// Node.js example using axios, form-data, and fs
// 1. Import required modules
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// 2. Prepare the form data with the file to upload
const data = new FormData();
data.append('file', fs.createReadStream('${fileName}'));

// 3. Upload the file to Langflow
axios.post('${fileUploadEndpoint}', data, {
  headers: {
    ...data.getHeaders(),${langflowApiKey ? "\n    'x-api-key': '" + langflowApiKey + "'," : ""}
  }
})
.then(res => {
  // 4. Get the uploaded file path from the response
  const uploadedPath = res.data.path;
  // 5. Call the Langflow run endpoint with the uploaded file path
  return axios.post('${langflowRunEndpoint}', {
    input_value: "Analyze this file",
    output_type: "chat",
    input_type: "chat",
    tweaks: {
      '${fileComponentName || 'File-Component-Name'}': {
        path: uploadedPath
      }
    }
  }, {
    headers: { 'Content-Type': 'application/json'${langflowApiKey ? ", 'x-api-key': '" + langflowApiKey + "'" : ""} }
  });
})
.then(res => {
  // 6. Output only the message
  const langflowData = res.data;
  console.log(langflowData.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text);
})
.catch(err => {
  // 7. Handle errors
  console.error(err);
});
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
    "input_value": "Analyze this file",
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
    "input_value": "Analyze this file",
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
          <FileUploadFormSection
            host={host} setHost={setHost}
            flowId={flowId} setFlowId={setFlowId}
            fileComponentName={fileComponentName} setFileComponentName={setFileComponentName}
            fileOnly={fileOnly} setFileOnly={setFileOnly}
            fileOnlyInputRef={fileOnlyInputRef}
            langflowApiKey={langflowApiKey} setLangflowApiKey={setLangflowApiKey}
            showApiKey={showApiKey} setShowApiKey={setShowApiKey}
            fileOnlyError={fileOnlyError}
            fileOnlyLoading={fileOnlyLoading}
            handleFileOnlySubmit={handleFileOnlySubmit}
            TEXT_ACCEPTED_FILE_TYPES={TEXT_ACCEPTED_FILE_TYPES}
            TEXT_ALLOWED_TYPES={TEXT_ALLOWED_TYPES}
            setFileOnlyError={setFileOnlyError}
          />
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
          <ResponseSection response={fileOnlyResponse} title="Upload Response" colorClass="text-[#b3cfff]" />
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