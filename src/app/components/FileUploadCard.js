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

  const codeSnippet = `// 1. Upload the file to Langflow\nconst file = /* your File object */;\nconst fileForm = new FormData();\nfileForm.append('file', file);\nconst uploadRes = await fetch('${fileUploadEndpoint}', {\n  method: 'POST',\n  body: fileForm${langflowApiKey ? ",\n  headers: { 'x-api-key': '" + langflowApiKey + "' }" : ""}\n});\nconst uploadData = await uploadRes.json();\nconst uploadedPath = uploadData.path;\n\n// 2. Call the Langflow run endpoint\nconst payload = {\n  tweaks: {\n    '${fileComponentName || 'File-Component-Name'}': {\n      path: uploadedPath\n    }\n  }\n};\nconst runRes = await fetch('${langflowRunEndpoint}', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json'${langflowApiKey ? ", 'x-api-key': '" + langflowApiKey + "'" : ""} },\n  body: JSON.stringify(payload)\n});\nconst runData = await runRes.json();\nconsole.log(runData);\n`;

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
          <CodeSection code={codeSnippet} language="javascript" title="Example Code" colorClass="text-[#7ea2e3]" />
          <ResponseSection response={fileOnlyResponse} title="Upload Response" colorClass="text-[#b3cfff]" />
        </div>
      </div>
    </div>
  );
} 