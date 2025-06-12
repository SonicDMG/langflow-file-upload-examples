// Langflow configuration constants
//const LANGFLOW_FLOW_ID = '8d49a757-15bf-4b12-acb1-89a125ed2c5e'
//const CHAT_INPUT_NAME = 'ChatInput-SZLue';
//const LANGFLOW_URL = 'http://127.0.0.1:7860';
//const LANGFLOW_FILE_UPLOAD_URL = `${LANGFLOW_URL}/api/v1/files/upload/${LANGFLOW_FLOW_ID}`;
//const LANGFLOW_FLOW_RUN_URL = `${LANGFLOW_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`;

import axios from 'axios';
import FormData from 'form-data';
import { 
  parseMultipartForm, 
  getUploadedFile, 
  createFileReadStream, 
  sendLangflowApiResponse, 
  ALLOWED_MIME_TYPES
} from '../utils';

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

  const FILE_UPLOAD_URL = `${host.replace(/\/$/, "")}/api/v1/files/upload/${flowId}`;
  const FLOW_RUN_URL = `${host.replace(/\/$/, "")}/api/v1/run/${flowId}`;

  // Restrict to allowed file types (images and text)
  // Optional, but good practice to avoid uploading invalid file types
  if (file && !ALLOWED_MIME_TYPES.includes(fileType)) {
    return new Response(JSON.stringify(
      { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }), { status: 400 }
    );
  }

  // If there is a file, upload it to Langflow file API, preserving original filename
  // Check https://docs.langflow.org/api/upload-file-1 for the API and code example
  let uploadedFilePath = undefined;
  let fileUploadResponse = undefined;

  if (tempPath) {
    try {
      // Create a FormData object to send the file to the Langflow file API
      const data = new FormData();

      // Create a read stream from the file and preserve the original filename
      const { stream, options } = createFileReadStream(tempPath, fileName);
      data.append('file', stream, options);

      // Configure the request to the Langflow V1 file API
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: FILE_UPLOAD_URL, // example:'https://docs.langflow.org/api/v1/files/upload/:flow_id'
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          ...data.getHeaders(),
          ...(langflowApiKey ? { 'x-api-key': langflowApiKey } : {})
        },
        data: data
      };

      // Send the file to the Langflow V1 file API
      const uploadResponse = await axios.request(config);
      fileUploadResponse = uploadResponse.data;
      console.log('fileUploadResponse', fileUploadResponse);
      uploadedFilePath = fileUploadResponse?.file_path; // V1 API uses file_path
    } catch (err) {
      return new Response(JSON.stringify(
        { error: 
          'Failed to upload file to Langflow',
          details: err.message,
          langflowFileUploadResponse: err.response?.data
        }
      ), { status: 500 });
    }
  }

  // Construct the payload for the Langflow agentic AI workflow
  // using an AI agent to process and understand what's in the image
  const langflowPayload = {
    output_type: 'chat',
    input_type: 'chat',
    tweaks: {
      [fileComponentName]: {
        files: uploadedFilePath,
        input_value: textInput
      }
    }
  };

  // Configure the request to the Langflow for the Langflow agentic AI workflow
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(langflowApiKey ? { 'x-api-key': langflowApiKey } : {})
    },
    body: JSON.stringify(langflowPayload)
  };

  // Send the request to the Langflow for the Langflow agentic AI workflow
  try {
    const response = await fetch(`${FLOW_RUN_URL}?stream=false`, options);
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify(
        { error: 'Failed to fetch from Langflow',
          langflowFileUploadResponse: fileUploadResponse,
          langflowFlowResponse: data
        }
      ), { status: response.status });
    }
    // Parse the response message from the Langflow agentic AI workflow
    return sendLangflowApiResponse({ fileUploadResponse, langflowData: data, status: 200 });

  } catch (err) {
    return new Response(JSON.stringify(
      { error: 'Internal server error when calling Langflow',
        details: err.message,
        langflowFileUploadResponse: fileUploadResponse
      }
    ), { status: 500 });
  }
} 