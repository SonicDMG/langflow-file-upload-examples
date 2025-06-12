import axios from 'axios';
import FormData from 'form-data';
import { 
  parseMultipartForm,
  getUploadedFile,
  createFileReadStream,
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
  // Parse multipart/form-data
  let formData = await parseMultipartForm(request);
  let { tempPath, fileName, fileType } = getUploadedFile(formData);

  // Get dynamic fields from form data
  function getFieldValue(field, fallback = undefined) {
    if (Array.isArray(field)) return (field[0] ?? fallback)?.trim?.() ?? fallback;
    return field?.trim?.() ?? fallback;
  }
  const host = getFieldValue(formData.fields.host, 'http://127.0.0.1:7860');
  const flowId = getFieldValue(formData.fields.flowId);
  const fileComponentName = getFieldValue(formData.fields.fileComponentName);
  const langflowApiKey = getFieldValue(formData.fields.langflowApiKey);

  if (!host || !flowId || !fileComponentName) {
    return new Response(JSON.stringify({ error: 'Missing host, flowId, or fileComponentName' }), { status: 400 });
  }

  // Restrict to allowed file types
  if (formData && formData.files && formData.files.file) {
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return new Response(JSON.stringify(
        { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }
      ), { status: 400 });
    }
  }

  let fileUploadResponse;
  let uploadedFilePath;

  // Upload file to Langflow V2 API
  if (tempPath) {
    let data = new FormData();
    let { stream, options } = createFileReadStream(tempPath, fileName);
    data.append('file', stream, options);
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${host.replace(/\/$/, '')}/api/v2/files/`,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        ...data.getHeaders(),
        ...(langflowApiKey ? { 'x-api-key': langflowApiKey } : {})
      },
      data: data
    };
    let uploadResponse = await axios.request(config);
    fileUploadResponse = uploadResponse.data;
    uploadedFilePath = fileUploadResponse?.path;
  }

  // Build payload with dynamic fileComponentName
  let langflowPayload = {
    tweaks: {
      [fileComponentName]: { path: uploadedFilePath }
    }
  };

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(langflowApiKey ? { 'x-api-key': langflowApiKey } : {})
    },
    body: JSON.stringify(langflowPayload)
  };

  // Call Langflow run endpoint with dynamic host and flowId
  let response = await fetch(`${host.replace(/\/$/, '')}/api/v1/run/${flowId}`, options);
  let data = await response.json();
  if (!response.ok) {
    return new Response(JSON.stringify(
      { error: 'Failed to fetch from Langflow', langflowResponse: data }
    ), { status: response.status });
  }
  return new Response(JSON.stringify(
    { success: true, 
      langflowFileUploadResponse: fileUploadResponse, 
      langflowFlowResponse: data 
    }
  ), { status: 200 });
} 