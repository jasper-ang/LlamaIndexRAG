import { openai } from "@ai-sdk/openai";
import { llamaindex } from "@llamaindex/vercel";
import { streamText } from "ai";
import { Document, VectorStoreIndex } from "llamaindex";
 
// Create an index from your documents
const document = new Document({ text: yourText, id_: "unique-id" });
const index = await VectorStoreIndex.fromDocuments([document]);
 
// Create a query tool
const queryTool = llamaindex({
  model: openai("gpt-4"),
  index,
  description: "Search through the documents", // optional
});
 
// Use the tool with Vercel's AI SDK
streamText({
  model: openai("gpt-4"),
  prompt: "Your question here",
  tools: { queryTool },
  onFinish({ response }) {
    console.log("Response:", response.messages); // log the response
  },
}).toDataStream();