'use client';
import React from "react";
import FileUploadCard from "./components/FileUploadCard";
import ChatFileCard from "./components/ChatFileCard";
import ChatImageCard from "./components/ChatImageCard";
import RouteSimpleCard from "./components/RouteSimpleCard";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex flex-col items-center py-10 px-2">
      <h1 className="text-4xl font-bold text-white mb-2 text-center">File Upload Interface</h1>
      <p className="text-lg text-blue-100 mb-2 text-center">Modern file upload components with real-time responses</p>
      <div className="mb-8 flex flex-col items-center">
        <span className="text-blue-300 text-sm">Version: <a href="https://docs.langflow.org/api/upload-user-file" className="underline hover:text-blue-400" target="_blank" rel="noopener noreferrer">Langflow File API v2</a> | <a href="https://docs.langflow.org/api/upload-file-1" className="underline hover:text-blue-400" target="_blank" rel="noopener noreferrer">File API v1</a></span>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        <FileUploadCard />
        <ChatFileCard />
        <ChatImageCard />
        <RouteSimpleCard />
      </div>
    </div>
  );
}
