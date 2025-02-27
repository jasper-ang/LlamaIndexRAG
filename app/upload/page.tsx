"use client";
import { useState } from "react";

export default function TestRAGPage() {
  const [parsedText, setParsedText] = useState("");
  const [queryResult, setQueryResult] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    // Create a FormData object
    const formData = new FormData();
    formData.append("file", file);
    // Optionally include query if provided
    if (queryInput.trim()) {
      formData.append("query", queryInput);
    }

    try {
      const res = await fetch("/api/rag/pdfparse", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        setParsedText(json.parsedText);
        setQueryResult(json.queryResult || "");
      } else {
        setUploadError(json.message || "Error parsing PDF");
      }
    } catch (error) {
      setUploadError(error.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">RAG Test Results</h1>
      <h2 className="text-xl mb-2">Upload PDF for Parsing</h2>
      <div className="mb-4">
        <label className="block mb-1">Query (optional): </label>
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Type your query here"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="mt-1"
        />
      </div>
      {uploading && (
        <p className="text-blue-600">Uploading and parsing PDF...</p>
      )}
      {uploadError && <p className="text-red-600">Error: {uploadError}</p>}
      {queryResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Query Result:</h3>
          <pre className="bg-slate-800 p-3 rounded whitespace-pre-wrap break-words mt-2">
            {queryResult}
          </pre>
        </div>
      )}
      {parsedText && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Parsed Text:</h3>
          <pre className="bg-slate-800 p-3 rounded overflow-auto max-h-96 mt-2">
            {parsedText}
          </pre>
        </div>
      )}
    </div>
  );
}
