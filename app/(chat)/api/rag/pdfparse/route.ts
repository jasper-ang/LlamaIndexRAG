export const config = { runtime: 'nodejs' };

import { promises as fs } from "fs";
import { join } from "path";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
// Import PDFReader directly from its file path
import { PDFReader } from '@llamaindex/readers/pdf'

const TEMP_DIR = "./tmp";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(
        JSON.stringify({ message: "No file uploaded" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Ensure temporary directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true });
    
    // Write the uploaded file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = join(TEMP_DIR, file.name);
    await fs.writeFile(filePath, buffer);
    
    // Use SimpleDirectoryReader with PDFReader (imported directly)
    const reader = new SimpleDirectoryReader();
    const docs = await reader.loadData({
      directoryPath: TEMP_DIR,
      fileExtToReader: {
        pdf: new PDFReader(),
      },
    });
    
    // Get parsed text from the first document (if any)
    const parsedText = docs.map(doc => doc.text).join("\n\n");

    return new Response(
      JSON.stringify({ parsedText }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || "Error parsing PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
