// Langflow configuration constants
//const LANGFLOW_URL = 'http://127.0.0.1:7860';
//const LANGFLOW_FILE_UPLOAD_URL = `${LANGFLOW_URL}/api/v2/files/`;
//const LANGFLOW_FLOW_RUN_URL = `${LANGFLOW_URL}/api/v1/run/c60360c2-70a0-4c8d-8dd1-5900979263c6`;
//const FILE_COMPONENT_NAME = 'File-P6xlj';

import { 
  parseMultipartForm, 
  getUploadedFile, 
  sendLangflowApiResponse, 
  ALLOWED_MIME_TYPES 
} from '../utils';
import fs from 'fs/promises';

// Disable Next.js's default body parser so we can handle multipart/form-data 
// (file uploads) with a custom parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  // Get the file and text input from the form data
  const formData = await parseMultipartForm(request);
  const { file, tempPath, fileName, fileType } = getUploadedFile(formData);
  let textInput = formData.fields.textInput;
  if (Array.isArray(textInput)) textInput = textInput[0];
  const hostRaw = formData.fields?.host || 'http://127.0.0.1:7860';
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;
  const flowIdRaw = formData.fields?.flowId;
  const flowId = Array.isArray(flowIdRaw) ? flowIdRaw[0] : flowIdRaw;
  const fileComponentNameRaw = formData.fields?.fileComponentName;
  const fileComponentName = Array.isArray(fileComponentNameRaw) ? fileComponentNameRaw[0] : fileComponentNameRaw;
  const langflowApiKeyRaw = formData.fields?.langflowApiKey;
  const langflowApiKey = Array.isArray(langflowApiKeyRaw) ? langflowApiKeyRaw[0] : langflowApiKeyRaw;

  if (!host || !flowId || !fileComponentName) {
    return new Response(JSON.stringify({ error: 'Missing host, flowId, or fileComponentName' }), { status: 400 });
  }

  const FILE_UPLOAD_URL = `${host.replace(/\/$/, "")}/api/v2/files/`;
  const FLOW_RUN_URL = `${host.replace(/\/$/, "")}/api/v1/run/${flowId}`;

  // Restrict to allowed file types (images and text)
  if (file && !ALLOWED_MIME_TYPES.includes(fileType)) {
    return new Response(JSON.stringify(
      { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }), { status: 400 }
    );
  }

  // If there is a file, upload it to Langflow file API, preserving original filename
  let uploadedFilePath = undefined;
  let fileUploadResponse = undefined;

  if (tempPath) {
    try {
      const data = new FormData();
      const fileBuffer = await fs.readFile(tempPath);
      data.append('file', new Blob([fileBuffer]), fileName);
      // Helper to ensure we always append a string, not an array
      const getField = (val) => Array.isArray(val) ? val[0] : val;
      data.append('flowId', getField(flowId));
      data.append('fileComponentName', getField(fileComponentName));
      data.append('host', host);
      if (langflowApiKey) {
        data.append('langflowApiKey', getField(langflowApiKey));
      }
      // Use fetch for file upload (headers auto-set by FormData)
      const uploadRes = await fetch(FILE_UPLOAD_URL, {
        method: 'POST',
        body: data
      });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.error || 'File upload failed');
      }
      const uploadResponse = await uploadRes.json();
      fileUploadResponse = uploadResponse;
      uploadedFilePath = uploadResponse?.path || uploadResponse?.file_path || uploadResponse?.id;
    } catch (err) {
      return new Response(JSON.stringify(
        { error: 'Failed to upload file to Langflow', details: err.message, langflowFileUploadResponse: err.response?.data }
      ), { status: 500 });
    }
  }

  // Construct the payload for the Langflow agentic AI workflow
  const langflowPayload = {
    input_value: textInput,
    tweaks: {
      [fileComponentName]: { path: uploadedFilePath }
    }
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(langflowApiKey ? { 'x-api-key': langflowApiKey } : {})
    },
    body: JSON.stringify(langflowPayload)
  };

  try {
    const response = await fetch(FLOW_RUN_URL, options);
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify(
        { error: 'Failed to fetch from Langflow', langflowFileUploadResponse: fileUploadResponse, langflowFlowResponse: data }
      ), { status: response.status });
    }
    return sendLangflowApiResponse({ fileUploadResponse, langflowData: data, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify(
      { error: 'Internal server error when calling Langflow', details: err.message, langflowFileUploadResponse: fileUploadResponse }
    ), { status: 500 });
  }
} 