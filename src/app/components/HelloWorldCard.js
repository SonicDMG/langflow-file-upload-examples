import React, { useState } from "react";
import EndpointSection from "./EndpointSection";
import ResponseSection from "./ResponseSection";
import CodeSection from "./CodeSection";

export default function HelloWorldCard() {
  const [host, setHost] = useState("http://127.0.0.1:7860");
  const [flowId, setFlowId] = useState("");
  const [textInput, setTextInput] = useState("");
  const [langflowApiKey, setLangflowApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null);
    if (!host || !flowId || !textInput) {
      setError("Please provide Host, Flow ID, and a message.");
      return;
    }
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append('host', host);
    formData.append('flowId', flowId);
    formData.append('textInput', textInput);
    if (langflowApiKey) formData.append('langflowApiKey', langflowApiKey);
    if (sessionId) formData.append('sessionId', sessionId);
    try {
      const res = await fetch('/api/hello-world', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
      if (!res.ok) {
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  const safeHost = host || "http://127.0.0.1:7860";
  const langflowRunEndpoint = flowId ? `${safeHost.replace(/\/$/, "")}/api/v1/run/${flowId}` : `${safeHost.replace(/\/$/, "")}/api/v1/run/<flowId>`;
  const payloadPreview = JSON.stringify({ input_value: textInput || '<text>' }, null, 2);

  const sessionIdForExample = sessionId || "user_1";
  const nodeCode = `// Node 18+ example using global fetch\nconst payload = {\n    input_value: \"${textInput || '<text>'}\",\n    output_type: \"chat\",\n    input_type: \"chat\"${sessionId ? `,\n    // Optional: Use session tracking if needed\n    session_id: \"${sessionId}\"` : ''}\n};\n\nconst options = {\n    method: 'POST',\n    headers: {\n        'Content-Type': 'application/json'${langflowApiKey ? ",\n        'x-api-key': '" + langflowApiKey + "'" : ""}\n    },\n    body: JSON.stringify(payload)\n};\n\nfetch('${langflowRunEndpoint}', options)\n    .then(response => response.json())\n    .then(data => {\n        // Print only the message\n        const msg = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text;\n        if (msg) {\n            console.log(msg);\n        } else {\n            console.error('No message found in response:', data);\n        }\n    })\n    .catch(err => console.error(err));\n`;
  const pythonCode = `# Python example using requests\nimport requests\nimport json\n\nurl = \"${langflowRunEndpoint}\"\npayload = {\n    \"input_value\": \"${textInput || '<text>'}\",\n    \"output_type\": \"chat\",\n    \"input_type\": \"chat\"${sessionId ? `,\n    # Optional: Use session tracking if needed\n    \"session_id\": \"${sessionId}\"` : ''}\n}\nheaders = {\n    'Content-Type': 'application/json'${langflowApiKey ? ",\n    'x-api-key': '" + langflowApiKey + "'" : ""}\n}\nres = requests.post(url, headers=headers, data=json.dumps(payload))\ndata = res.json()\n# Print only the message\ntry:\n    msg = data['outputs'][0]['outputs'][0]['results']['message']['data']['text']\n    print(msg)\nexcept (KeyError, IndexError, TypeError):\n    print('No message found in response:', data)\n`;
  const curlCode = `curl -s -X POST \\\n  '${langflowRunEndpoint}' \\\n  -H 'Content-Type: application/json'${langflowApiKey ? ` \\\n  -H 'x-api-key: ${langflowApiKey}'` : ''} \\\n  -d '{\n    "input_value": "${textInput || '<text>'}",\n    "output_type": "chat",\n    "input_type": "chat"${sessionId ? `,\n    "session_id": "${sessionId}"` : ''}\n  }' | jq -r '.outputs[0].outputs[0].results.message.data.text'\n`;

  return (
    <div className="bg-[#19213a] rounded-xl shadow-lg p-4 md:p-8 border border-[#2a3b6e] w-full mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-[#b3cfff] mb-2">Hello World Chat (Text Only)</h2>
            <label htmlFor="host" className="font-semibold text-[#b3cfff]">Host</label>
            <input
              id="host"
              name="host"
              type="text"
              className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
              placeholder="http://127.0.0.1:7860"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
            <label htmlFor="flowId" className="font-semibold text-[#b3cfff]">Flow ID</label>
            <input
              id="flowId"
              name="flowId"
              type="text"
              className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
              placeholder="Enter Flow ID"
              value={flowId}
              onChange={(e) => setFlowId(e.target.value)}
            />
            <label htmlFor="textInput" className="font-semibold text-[#b3cfff]">Text Input</label>
            <input
              id="textInput"
              type="text"
              className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
              placeholder="Enter your message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <label htmlFor="sessionId" className="font-semibold text-[#b3cfff]">Session ID (optional)</label>
            <input
              id="sessionId"
              name="sessionId"
              type="text"
              className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
              placeholder="Enter a session ID for tracking (optional)"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
            <label htmlFor="langflowApiKey" className="font-semibold text-[#b3cfff]">Langflow API Key (optional)</label>
            <input
              id="langflowApiKey"
              name="langflowApiKey"
              type={showApiKey ? "text" : "password"}
              className="rounded-lg px-4 py-3 bg-[#232e4a] border border-[#2a3b6e] text-[#b3cfff] placeholder-[#7ea2e3]"
              placeholder="Paste your Langflow API Key (optional)"
              value={langflowApiKey}
              onChange={(e) => setLangflowApiKey(e.target.value)}
            />
            <button
              type="button"
              className="text-xs text-blue-300 hover:text-blue-400 mt-1 self-end"
              onClick={() => setShowApiKey(v => !v)}
            >
              {showApiKey ? "Hide" : "Show"} API Key
            </button>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            <button
              type="submit"
              className="mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-[#19213a]"
              disabled={loading}
            >
              {loading ? (<span className="spinner" />) : "Send"}
            </button>
          </form>
        </div>
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <EndpointSection
            endpoints={[
              { label: "Langflow Run API Endpoint:", value: langflowRunEndpoint }
            ]}
            payload={payloadPreview}
            title={null}
          />
          <ResponseSection response={response} title="Response" colorClass="text-[#b3cfff]" />
          <CodeSection
            codeExamples={[
              { label: 'Python', code: pythonCode, language: 'python' },
              { label: 'Javascript', code: nodeCode, language: 'javascript' },
              { label: 'cURL', code: curlCode, language: 'bash' }
            ]}
            title="Example Code"
            colorClass="text-[#7ea2e3]"
          />
        </div>
      </div>
    </div>
  );
} 