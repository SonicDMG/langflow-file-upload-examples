// Langflow configuration constants
const LANGFLOW_URL = 'http://127.0.0.1:7860';
const LANGFLOW_FILE_UPLOAD_URL = `${LANGFLOW_URL}/api/v2/files/`;
const LANGFLOW_FLOW_RUN_URL = `${LANGFLOW_URL}/api/v1/run/c60360c2-70a0-4c8d-8dd1-5900979263c6`;
const FILE_COMPONENT_NAME = 'File-P6xlj';

import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { parseMultipartForm, getUploadedFile, createFileReadStream, sendLangflowApiResponse, ALLOWED_MIME_TYPES } from '../utils';

// Disable Next.js's default body parser so we can handle multipart/form-data 
// (file uploads) with a custom parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const formData = await parseMultipartForm(request);
  const { file, tempPath, fileName, fileType } = getUploadedFile(formData);
  let textInput = formData.fields.textInput;
  if (Array.isArray(textInput)) textInput = textInput[0];

  // Restrict to allowed file types (images and text)
  if (file && !ALLOWED_MIME_TYPES.includes(fileType)) {
    return new Response(JSON.stringify({ error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }), { status: 400 });
  }

  // Upload file to Langflow file API, preserving original filename
  let uploadedFilePath = undefined;
  let fileUploadResponse = undefined;
  if (tempPath) {
    try {
      const data = new FormData();
      const { stream, options } = createFileReadStream(tempPath, fileName);
      data.append('file', stream, options);
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: LANGFLOW_FILE_UPLOAD_URL,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          ...data.getHeaders()
        },
        data: data
      };
      const uploadResponse = await axios.request(config);
      fileUploadResponse = uploadResponse.data;
      uploadedFilePath = uploadResponse.data?.path || uploadResponse.data?.file_path || uploadResponse.data?.id;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to upload file to Langflow', details: err.message, langflowFileUploadResponse: err.response?.data }), { status: 500 });
    }
  }

  // Construct the payload for Langflow
  const langflowPayload = {
    input_value: textInput,
    tweaks: {
      [FILE_COMPONENT_NAME]: { path: uploadedFilePath }
    }
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(langflowPayload)
  };

  try {
    const response = await fetch(LANGFLOW_FLOW_RUN_URL, options);
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch from Langflow', langflowFileUploadResponse: fileUploadResponse, langflowFlowResponse: data }), { status: response.status });
    }
    // Use utility to send response
    return sendLangflowApiResponse({ fileUploadResponse, langflowData: data, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error when calling Langflow', details: err.message, langflowFileUploadResponse: fileUploadResponse }), { status: 500 });
  }
} 