import { IncomingForm } from 'formidable';
import { Readable } from 'stream';
import fs from 'fs';

// Global allowed MIME types for uploads (text, PDF, Word, RTF, CSV, images)
export const ALLOWED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/jpg'
];

// Helper: Convert web Request to Node.js Readable stream
export async function webRequestToNodeStream(request) {
  const reader = request.body.getReader();
  return new Readable({
    async read() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        this.push(Buffer.from(value));
      }
      this.push(null);
    }
  });
}

// Helper: Create a Node.js-style request shim for formidable
export async function createNodeRequestShim(request) {
  const nodeStream = await webRequestToNodeStream(request);
  // Copy headers from web request
  const headers = {};
  for (const [key, value] of request.headers.entries()) {
    headers[key.toLowerCase()] = value;
  }
  // Attach headers and required methods
  nodeStream.headers = headers;
  nodeStream.method = request.method;
  nodeStream.url = request.url;
  return nodeStream;
}

// Helper: Parse multipart form data
export async function parseMultipartForm(request) {
  const nodeReq = await createNodeRequestShim(request);
  const form = new IncomingForm({ keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export function getUploadedFile(formData, fieldName = 'file') {
  let file = formData.files[fieldName];
  if (Array.isArray(file)) file = file[0];

  // Log the file data to the console for illustration
  console.log('file', file);

  return {
    file,
    tempPath: file && file.filepath,
    fileName: file && file.originalFilename,
    fileType: file && file.mimetype,
  };
}

export function createFileReadStream(tempPath, fileName) {
  if (!tempPath) return { stream: null, options: {} };
  return {
    stream: fs.createReadStream(tempPath),
    options: fileName ? { filename: fileName } : {},
  };
}

// Helper: Send a unified Langflow API response
export function sendLangflowApiResponse({ fileUploadResponse, langflowData, status = 200, res }) {
  let message = '';
  try {
    message = langflowData.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text || 'There is no data at outputs[0].outputs[0].results.message.data.text?';
  } catch {
    message = 'There was an error getting the message from the Langflow response';
  }
  return new Response(
    JSON.stringify({
      success: true,
      langflowFileUploadResponse: fileUploadResponse,
      langflowFlowResponse: { message }
    }),
    { status }
  );
} 