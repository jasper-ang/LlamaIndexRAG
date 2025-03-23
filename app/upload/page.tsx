`use client`;
import { useState } from "react";

/**
 * TestRAGPage - A component that handles PDF uploads and processes them using
 * Retrieval-Augmented Generation (RAG).
 * Users can upload PDFs and optionally provide a query to get relevant information.
 */
export default function TestRAGPage() {
  // Stores the extracted text content from the uploaded PDF
  const [parsedText, setParsedText] = useState("");
  // Stores the response from the RAG model for the user's query
  const [queryResult, setQueryResult] = useState("");
  // Manages the user's input query text
  const [queryInput, setQueryInput] = useState("");
  // Tracks the loading state during file upload and processing
  const [uploading, setUploading] = useState(false);
  // Stores any error that occurs during the upload or processing
  const [uploadError, setUploadError] = useState(null);

  /**
   * Handles file upload, form submission, and API communication
   * @param e - The file input change event
   */
  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    // Prepare form data for API submission
    const formData = new FormData();
    formData.append("file", file);

    // Include the optional query if provided
    if (queryInput.trim()) {
      formData.append("query", queryInput);
    }

    try {
      // Send the file and query to the RAG API endpoint
      const res = await fetch("/api/rag", {
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

      {/* File upload section with optional query input */}
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

      {/* Status indicators */}
      {uploading && (
        <p className="text-blue-600">Uploading and parsing PDF...</p>
      )}
      {uploadError && <p className="text-red-600">Error: {uploadError}</p>}

      {/* Query results section */}
      {queryResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Query Result:</h3>
          <pre className="bg-slate-800 p-3 rounded whitespace-pre-wrap break-words mt-2">
            {queryResult}
          </pre>
        </div>
      )}

      {/* Parsed text display section */}
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
