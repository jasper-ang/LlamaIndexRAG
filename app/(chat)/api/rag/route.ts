export const config = { runtime: 'nodejs' };

import { NextResponse } from "next/server";
import { tool } from "ai";
import { Document, VectorStoreIndex } from "llamaindex";
import { z } from "zod";
import { promises as fs } from "fs";
import { join } from "path";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { PDFReader } from '@llamaindex/readers/pdf';
import { QdrantVectorStore } from "@llamaindex/qdrant";

const TEMP_DIR = "./tmp";

// Define the query tool
// export const queryTool = tool({
//   description:
//     "Search through document knowledge base and retrieve relevant information",
//   parameters: z.object({
//     query: z.string().describe("The question or query about the document content"),
//   }),
//   execute: async ({ query }) => {
//     const queryEngine = sampleIndex.asQueryEngine();
//     const response = await queryEngine.query({ query });
//     return {
//       answer: response.message.content,
//       sources: response.sourceNodes
//         ? response.sourceNodes.map((node) => {
//             const doc = node.node as unknown as Document;
//             const content = (doc as any).text || "";
//             return {
//               id: doc.id_,
//               content:
//                 content.substring(0, 150) + (content.length > 150 ? "..." : ""),
//               relevanceScore: node.score || 0,
//             };
//           })
//         : [],
//       metadata: {
//         totalSources: response.sourceNodes?.length || 0,
//         queryTimestamp: new Date().toISOString(),
//       },
//     };
//   },
// });



// PDF Processing Functions
async function processPDF(file: File, query: string | null): Promise<any> {
  // Ensure temporary directory exists
  await fs.mkdir(TEMP_DIR, { recursive: true });
  
  // Write the uploaded file to disk
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = join(TEMP_DIR, file.name);
  await fs.writeFile(filePath, buffer);
  
  // Use SimpleDirectoryReader with PDFReader
  const reader = new SimpleDirectoryReader();
  const docs = await reader.loadData({
    directoryPath: TEMP_DIR,
    fileExtToReader: {
      pdf: new PDFReader(),
    },
  });
  
  // Get parsed text from all documents for response
  const parsedText = docs.map(doc => doc.text).join("\n\n");
  
  // Create page-chunked documents for indexing
  const chunkedDocuments = docs.flatMap((doc) => {
    // Split by page markers if available in text
    const pages = doc.text.split(/\f|\n---Page \d+---\n/);
    
    return pages.filter(page => page.trim().length > 0).map((pageText, idx) => {
      return new Document({ 
        text: pageText, 
        id_: `${doc.id_}_page${idx + 1}`,
        metadata: { 
          ...doc.metadata,
          page_number: idx + 1,
          source: filePath,
          filename: file.name
        }
      });
    });
  });
  
  // Connect to Qdrant vector store
  const vectorStore = new QdrantVectorStore({
    url: "http://localhost:6333",
  });
  
  // Create vector index from chunked documents
  const index = await VectorStoreIndex.fromDocuments(chunkedDocuments, {
    vectorStore,
  });
  
  // If query parameter is provided, perform a search
  let queryResult = null;
  if (query) {
    const queryEngine = index.asQueryEngine();
    queryResult = await queryEngine.query({
      query,
    });
  }
  
  return {
    parsedText,
    indexId: chunkedDocuments.map(doc => doc.id_).join(","),
    queryResult: queryResult?.toString()
  };
}

// API GET handler - Test the RAG functionality with sample document
// export async function GET() {
//   try {
//     const results = await runRAGTest();
//     return NextResponse.json({ success: true, results });
//   } catch (error: any) {
//     console.error("Error in GET:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// API POST handler - Process PDF uploads and optional querying
export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const query = formData.get("query") as string | null;
    
    if (!file) {
      return new Response(
        JSON.stringify({ message: "No file uploaded" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const result = await processPDF(file, query);
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error processing PDF";
    return new Response(
      JSON.stringify({ message: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
