'use client';
import React, { useState } from "react";
import Image from "next/image";
import FileUploadCard from "./components/FileUploadCard";
import ChatFileCard from "./components/ChatFileCard";
import ChatImageCard from "./components/ChatImageCard";
import HelloWorldCard from "./components/HelloWorldCard";

const TAB_INFO = [
  {
    key: "helloWorld",
    label: "Hello World",
    card: <HelloWorldCard />,
    explanation: {
      heading: "Hello World Chat",
      text: "A simple chat input that sends a message to Langflow. No file upload required. Great for basic text-only flows.",
      apiVersion: "Uses Langflow Run API v1 (Text Only)"
    }
  },
  {
    key: "fileOnly",
    label: "File Only",
    card: <FileUploadCard />,
    explanation: {
      heading: "File Only Upload",
      text: "This component focuses purely on file selection and upload functionality. It provides a clean interface for choosing files with drag-and-drop support and file type validation.",
      apiVersion: "Uses Langflow File API v2"
    }
  },
  {
    key: "chatUpload",
    label: "Chat + File",
    card: <ChatFileCard />,
    explanation: {
      heading: "Chat + File Upload",
      text: "This component allows you to upload a file and provide a text input, simulating a chat-like interaction with file context.",
      apiVersion: "Uses Langflow File API v2"
    }
  },
  {
    key: "imageUpload",
    label: "Chat + Image",
    card: <ChatImageCard />,
    explanation: {
      heading: "Image + Text Upload",
      text: "Upload an image file along with a text prompt. Useful for flows that process both image and text data together.",
      apiVersion: "Uses Langflow File API v1"
    }
  }
];

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("fileOnly");
  const currentTab = TAB_INFO.find(tab => tab.key === selectedTab);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#141a2a] via-[#1a223a] to-[#232e4a] flex flex-col items-center py-10 px-2">
      <header className="w-full max-w-6xl flex items-center justify-start gap-6 mb-8 px-4">
        {/* QR Code on the left */}
        <Image src="/qr-placeholder.png" alt="QR Code" width={128} height={128} className="rounded-lg flex-shrink-0" />

        {/* Text Content */}
        <div>
            <h1 className="text-5xl font-bold text-white text-left">Langflow File Upload Utility</h1>
            <p className="text-xl text-blue-100 text-left mt-2">Examples of how to upload files to Langflow</p>
            <div className="mt-4">
                <span className="text-blue-300 text-sm">Version: <a href="https://docs.langflow.org/api/upload-user-file" className="underline hover:text-blue-400" target="_blank" rel="noopener noreferrer">Langflow File API v2</a> | <a href="https://docs.langflow.org/api/upload-file-1" className="underline hover:text-blue-400" target="_blank" rel="noopener noreferrer">File API v1</a></span>
            </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="flex w-full max-w-6xl mb-8 rounded-lg overflow-hidden bg-[#1a223a] border border-[#2a3b6e]">
        {TAB_INFO.map(tab => (
          <button
            key={tab.key}
            className={`flex-1 py-3 text-lg font-semibold transition-colors ${selectedTab === tab.key ? 'bg-[#2563eb] text-white' : 'bg-transparent text-[#7ea2e3] hover:bg-[#22304a]'} focus:outline-none`}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Explanation Card */}
      <div className="w-full max-w-6xl mx-auto bg-[#1a223a] border border-[#2a3b6e] rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-[#4ea1f7] mb-2">{currentTab.explanation.heading}</h3>
        <span className="text-xs text-blue-400 font-semibold block mb-2">{currentTab.explanation.apiVersion}</span>
        <p className="text-blue-100 text-base">{currentTab.explanation.text}</p>
      </div>
      {/* Upload Card */}
      <div className="flex flex-col gap-12 w-full">
        <div className="w-full max-w-[1600px] mx-auto">{currentTab.card}</div>
      </div>
    </div>
  );
}
