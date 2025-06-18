import { 
    parseMultipartForm,
    sendLangflowApiResponse
} from '../utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const formData = await parseMultipartForm(request);
  const hostRaw = formData.fields?.host || 'http://127.0.0.1:7860';
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;
  const flowIdRaw = formData.fields?.flowId;
  const flowId = Array.isArray(flowIdRaw) ? flowIdRaw[0] : flowIdRaw;
  let input_value = formData.fields.input_value;
  if (Array.isArray(input_value)) input_value = input_value[0];
  const langflowApiKeyRaw = formData.fields?.langflowApiKey;
  const langflowApiKey = Array.isArray(langflowApiKeyRaw) ? langflowApiKeyRaw[0] : langflowApiKeyRaw;
  const sessionIdRaw = formData.fields?.sessionId;
  const sessionId = Array.isArray(sessionIdRaw) ? sessionIdRaw[0] : sessionIdRaw;

  if (!host || !flowId || !input_value) {
    return new Response(JSON.stringify({ error: 'Missing host, flowId, or input_value' }), { status: 400 });
  }

  const FLOW_RUN_URL = `${host.replace(/\/$/, "")}/api/v1/run/${flowId}`;
  const langflowPayload = { input_value };
  if (sessionId) langflowPayload.session_id = sessionId;

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
      return new Response(JSON.stringify({ error: 'Failed to fetch from Langflow', langflowFlowResponse: data }), { status: response.status });
    }
    return sendLangflowApiResponse({ langflowData: data, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error when calling Langflow', details: err.message }), { status: 500 });
  }
} 