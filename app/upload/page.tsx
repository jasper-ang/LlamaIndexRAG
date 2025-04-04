"use client";

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
  // Stores the selected file
  const [selectedFile, setSelectedFile] = useState(null);

  /**
   * Handles file selection
   * @param e - The file input change event
   */
  const handleFileSelection = (e: any) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  /**
   * Handles form submission and API communication
   */
  const handleSubmit = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadError(null);

    // Prepare form data for API submission
    const formData = new FormData();
    formData.append("file", selectedFile);

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
    <div className="min-h-screen p-8 bg-gradient-to-bl from-pink-900/10 via-indigo-900/30 to-pink-900/10">
      <div className="max-w-4xl mx-auto my-8 overflow-hidden backdrop-blur-sm bg-zinc-800/10 shadow-2xl px-8 py-10 sm:px-32">
        <h1 className="text-lg sm:text-xl  text-center font-semibold mb-4 text-indigo-200 tracking-wide">
          Upload PDF for Analysis
        </h1>

        {/* File upload section with optional query input */}
        <div className="py-12 px-4 sm:px-20">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-indigo-200 font-medium text-sm tracking-wide uppercase">
                Question
              </label>
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Type your question here"
                className="w-full p-3 rounded-lg bg-white/5 border border-zinc-900/30 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500/10 placeholder:text-white/50 text-indigo-200 backdrop-blur-sm transition caret-indigo-300 text-base leading-relaxed"
              />
            </div>

            <div className="mt-4">
              <label className="flex flex-col items-center px-4 py-8 rounded-lg border-2 border-zinc-900/30 cursor-pointer hover:bg-white/10 transition bg-white/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-10 text-indigo-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="mt-3 text-base text-slate-200 font-medium">
                  Select a PDF file
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelection}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <p className="text-sm text-emerald-300 mt-3 flex items-center justify-center font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 mr-1.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading || !selectedFile}
              className="w-full mt-6 px-5 py-3.5 text-slate-100 font-semibold rounded-lg bg-zinc-950/80 hover:bg-zinc-950/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md border border-indigo-800/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-700/40 text-base tracking-wide"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin mr-2 size-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Analyze PDF"
              )}
            </button>
          </div>
        </div>

        {/* Status indicators */}
        {uploading && (
          <div className="text-blue-200 p-4 text-center mb-6 font-medium leading-relaxed">
            Uploading and parsing PDF... Please wait.
          </div>
        )}
        {uploadError && (
          <div className="text-red-200 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-center mb-6 font-medium leading-relaxed">
            Error: {uploadError}
          </div>
        )}

        {/* Query results section */}
        {queryResult && (
          <div className="mt-8 p-6 rounded-xl ">
            <h3 className="text-lg sm:text-xl  text-center font-semibold mb-6 text-indigo-200 tracking-wide">
              Answer to Question
            </h3>
            <pre className="bg-gray-900/60 p-5 rounded-lg whitespace-pre-wrap break-words mt-3 text-indigo-200 backdrop-blur-sm border border-emerald-500/20 shadow-inner overflow-auto font-mono text-sm leading-relaxed">
              {queryResult}
            </pre>
          </div>
        )}

        {/* Parsed text display section */}
        {parsedText && (
          <div className="mt-8 p-6 ">
            <h3 className="text-lg sm:text-xl text-center font-semibold mb-3 text-indigo-200 tracking-wide">
              Parsed Text
            </h3>
            <pre className=" p-5 rounded-lg overflow-auto max-h-96 mt-3 text-indigo-200 backdrop-blur-lg shadow-inner font-mono text-sm leading-relaxed">
              {parsedText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
