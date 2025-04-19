import { Router } from "itty-router";
import { AIExtractionService } from "./services/ai-extraction.service";
import { OCRService } from "./services/ocr.service";

const router = Router();

// OCR endpoint
router.post("/ocr", async (request: Request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const ocrService = new OCRService();
    const result = await ocrService.processImage(buffer);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("OCR processing failed", { status: 500 });
  }
});

// AI extraction endpoint
router.post("/extract", async (request: Request) => {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response("No text provided", { status: 400 });
    }

    const aiService = new AIExtractionService();
    const result = await aiService.extractReceiptData(text);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("AI extraction failed", { status: 500 });
  }
});

// Handle requests
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    return router.handle(request);
  },
};
