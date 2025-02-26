"use client";

import { useState, useEffect } from "react";

export default function TestRAGPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/rag");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading test results...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>RAG Test Results</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
