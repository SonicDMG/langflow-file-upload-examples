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
  // Parse multipart/form-data coming from the frontend webui page.js and 
  // grab the file input from the form data
  let formData = await parseMultipartForm(request);
  let { tempPath, fileName, fileType } = getUploadedFile(formData);

  // Restrict to allowed file types
  if (formData && formData.files && formData.files.file) {
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return new Response(JSON.stringify(
        { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }
      ), { status: 400 });
    }
  }

  // We'll need the file upload response and the uploaded file path
  let fileUploadResponse;
  let uploadedFilePath;

  // If there is a file, upload it to Langflow file V2 API, preserving original filename
  // Check https://docs.langflow.org/api/upload-user-file for the API and code example
  if (tempPath) {
    // Create a FormData object to send the file to the Langflow file API
    let data = new FormData();

    // Create a read stream from the file and preserve the original filename
    let { stream, options } = createFileReadStream(tempPath, fileName);
    data.append('file', stream, options);

    // Configure the request to the Langflow V2 file API
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://127.0.0.1:7860/api/v2/files/',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        ...data.getHeaders()
      },
      data: data
    };
    let uploadResponse = await axios.request(config);
    fileUploadResponse = uploadResponse.data;
    console.log('fileUploadResponse', fileUploadResponse);
    uploadedFilePath = fileUploadResponse?.path; // V2 API uses path
  }

  let langflowPayload = {
    tweaks: {
      'File-VMznN': { path: uploadedFilePath }
    }
  };

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(langflowPayload)
  };

  let response = await fetch('http://127.0.0.1:7860/api/v1/run/28eaf8b0-822a-4855-addd-f6dc73d051ba', options);
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