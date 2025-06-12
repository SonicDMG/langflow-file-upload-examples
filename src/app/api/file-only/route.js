// Langflow configuration constants
//const LANGFLOW_URL = 'http://127.0.0.1:7860';
//const LANGFLOW_FILE_UPLOAD_URL = `${LANGFLOW_URL}/api/v2/files/`;
//const LANGFLOW_FLOW_RUN_URL = `${LANGFLOW_URL}/api/v1/run/28eaf8b0-822a-4855-addd-f6dc73d051ba`;
//const FILE_COMPONENT_NAME = 'File-VMznN';

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
  // Get the file from the form data
  const formData = await parseMultipartForm(request);
  const { file, tempPath, fileName, fileType } = getUploadedFile(formData);
  const flowId = formData.fields?.flowId;
  const fileComponentName = formData.fields?.fileComponentName;
  const langflowApiKeyRaw = formData.fields?.langflowApiKey;
  const langflowApiKey = Array.isArray(langflowApiKeyRaw) ? langflowApiKeyRaw[0] : langflowApiKeyRaw;
  const hostRaw = formData.fields?.host;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;

  if (!flowId || !fileComponentName || !host) {
    return new Response(JSON.stringify({ error: 'Missing flowId, fileComponentName, or host' }), { status: 400 });
  }

  // Restrict to allowed file types (images and text)
  // Optional, but good practice to avoid uploading invalid file types
  if (file && !ALLOWED_MIME_TYPES.includes(fileType)) {
    return new Response(JSON.stringify(
      { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }), { status: 400 }
    );
  }

  // If there is a file, upload it to Langflow file API, preserving original filename
  // Check https://docs.langflow.org/api/upload-user-file for the API and code example
  let uploadedFilePath = undefined;
  let fileUploadResponse = undefined;

  if (tempPath) {
    try {
      // Create a FormData object to send the file to the Langflow file API
      const data = new FormData();
      // Read file as Buffer and append as Blob/Buffer
      const fileBuffer = await fs.readFile(tempPath);
      // Helper to ensure we always append a string, not an array
      const getField = (val) => Array.isArray(val) ? val[0] : val;
      data.append('file', new Blob([fileBuffer]), fileName);
      data.append('flowId', getField(flowId));
      data.append('fileComponentName', getField(fileComponentName));
      data.append('host', host);
      // Use fetch for file upload (headers auto-set by FormData)
      const headers = langflowApiKey ? { 'x-api-key': langflowApiKey } : undefined;
      const uploadRes = await fetch(`${host.replace(/\/$/, '')}/api/v2/files/`, {
        method: 'POST',
        headers,
        body: data
      });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.error || 'File upload failed');
      }
      const uploadResponse = await uploadRes.json();
      fileUploadResponse = uploadResponse;
      uploadedFilePath = uploadResponse?.path;
    } catch (err) {
      return new Response(JSON.stringify(
        { 
          error: 'Failed to upload file to Langflow',
          details: err.message,
          langflowFileUploadResponse: err.response?.data
        }
      ), { status: 500 });
    }
  }

  // Construct the payload for Langflow (no text input)
  const langflowPayload = {
    tweaks: {
      [fileComponentName]: { path: uploadedFilePath }
    }
  };

  // Build the dynamic flow run URL using the host from the form data
  const langflowFlowRunUrl = `${host.replace(/\/$/, '')}/api/v1/run/${flowId}`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(langflowApiKey ? { 'x-api-key': langflowApiKey } : {})
    },
    body: JSON.stringify(langflowPayload)
  };

  try {
    const response = await fetch(langflowFlowRunUrl, options);
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify(
        { error: 'Failed to fetch from Langflow', langflowResponse: data }
      ), { status: response.status });
    }
    return sendLangflowApiResponse({ fileUploadResponse, langflowData: data, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify(
      { error: 'Internal server error when calling Langflow', details: err.message }
    ), { status: 500 });
  }
} 