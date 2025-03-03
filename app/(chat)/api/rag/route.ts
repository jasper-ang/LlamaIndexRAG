// app/api/test-rag/route.ts
import { NextResponse } from "next/server";
import { tool } from "ai";
import { Document, VectorStoreIndex } from "llamaindex";
import { z } from "zod";

// Create an index from your documents
const document = new Document({
  text: "The author is Kenji, and Kenji studied computer science at Manchester",
  id_: "unique-id"
});
const index = await VectorStoreIndex.fromDocuments([document]);

// Define the query tool
export const queryTool = tool({
  description:
    "Search through document knowledge base and retrieve relevant information",
  parameters: z.object({
    query: z.string().describe("The question or query about the document content"),
  }),
  execute: async ({ query }) => {
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query({ query });
    return {
      answer: response.message.content,
      sources: response.sourceNodes
        ? response.sourceNodes.map((node) => {
            // Cast the node to Document to access its content.
            const doc = node.node as unknown as Document;
            const content = (doc as any).text || "";
            return {
              id: doc.id_,
              content:
                content.substring(0, 150) + (content.length > 150 ? "..." : ""),
              relevanceScore: node.score || 0,
            };
          })
        : [],
      metadata: {
        totalSources: response.sourceNodes?.length || 0,
        queryTimestamp: new Date().toISOString(),
      },
    };
  },
});

// A function to test only the RAG (query tool) logic
async function runRAGTest() {
  const testQuery = "What did the author do in college?";
  const queryResponse = await queryTool.execute({ query: testQuery }, {
      toolCallId: "",
      messages: []
  });
  return { queryResponse };
}

// API GET handler that calls our test function
export async function GET() {
  try {
    const results = await runRAGTest();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Error in GET:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
