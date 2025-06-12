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
const runData = await runRes.json();
console.log(runData);
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
  const uploadedPath = res.data.file_path || res.data.path;
  // 5. Call the Langflow run endpoint with the uploaded file path
  return axios.post('${langflowRunEndpoint}', {
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
  // 6. Print the final response
  console.log(res.data);
})
.catch(err => {
  // 7. Handle errors
  console.error(err);
});
`;

  const pythonCode = `# Python example using requests
import requests

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

# 4. Print the response
print(response.text)
`;

  const curlCode = `# cURL example for uploading a file to Langflow
# 1. Upload the file
curl -X POST \
  "${fileUploadEndpoint}" \
  -H "Accept: application/json" \
  -F "file=@${fileName}"${langflowApiKey ? ` \
  -H "x-api-key: ${langflowApiKey}"` : ''}
`;

  return (
    <div className="bg-[#19213a] rounded-xl shadow-lg p-4 md:p-8 border border-[#2a3b6e] max-w-[1200px] mx-auto">
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
          <CodeSection
            codeExamples={[
              { label: 'Browser', code: browserCode, language: 'javascript' },
              { label: 'Node.js', code: nodeCode, language: 'javascript' },
              { label: 'Python', code: pythonCode, language: 'python' },
              { label: 'cURL', code: curlCode, language: 'bash' }
            ]}
            title="Example Code"
            colorClass="text-[#7ea2e3]"
          />
          <ResponseSection response={fileOnlyResponse} title="Upload Response" colorClass="text-[#b3cfff]" />
        </div>
      </div>
    </div>
  );
} 