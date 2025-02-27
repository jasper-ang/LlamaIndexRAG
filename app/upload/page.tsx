"use client";

import { useState } from "react";

export default function TestRAGPage() {
  const [parsedText, setParsedText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    // Use FormData to send the file to our API route
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/rag/pdfparse", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        setParsedText(json.parsedText);
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
    <div>
      <h1>RAG Test Results</h1>

      <h2>Upload PDF for Parsing</h2>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      {uploading && <p>Uploading and parsing PDF...</p>}
      {uploadError && <p style={{ color: "red" }}>Error: {uploadError}</p>}
      {parsedText && (
        <div>
          <h3>Parsed Text:</h3>
          <pre>{parsedText}</pre>
        </div>
      )}
    </div>
  );
}
