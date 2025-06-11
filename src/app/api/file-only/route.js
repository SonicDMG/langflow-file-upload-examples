// Langflow configuration constants
const LANGFLOW_URL = 'http://127.0.0.1:7860';
const LANGFLOW_FILE_UPLOAD_URL = `${LANGFLOW_URL}/api/v2/files/`;
const LANGFLOW_FLOW_RUN_URL = `${LANGFLOW_URL}/api/v1/run/28eaf8b0-822a-4855-addd-f6dc73d051ba`;
const FILE_COMPONENT_NAME = 'File-VMznN';

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
      uploadedFilePath = uploadResponse.data?.path;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to upload file to Langflow', details: err.message, langflowFileUploadResponse: err.response?.data }), { status: 500 });
    }
  }

  // Construct the payload for Langflow (no text input)
  const langflowPayload = {
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
      return new Response(JSON.stringify({ error: 'Failed to fetch from Langflow', langflowResponse: data }), { status: response.status });
    }
    // Use utility to send response
    return sendLangflowApiResponse({ fileUploadResponse, langflowData: data, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error when calling Langflow', details: err.message }), { status: 500 });
  }
} 