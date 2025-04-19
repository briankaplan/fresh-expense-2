import { Tesseract } from 'tesseract.js';

export class OCRService {
  private readonly worker: Tesseract.Worker;

  constructor() {
    this.worker = Tesseract.createWorker();
  }

  async processImage(buffer: ArrayBuffer): Promise<{ text: string; confidence: number }> {
    try {
      await this.worker.load();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');

      const result = await this.worker.recognize(buffer);

      await this.worker.terminate();

      return {
        text: result.data.text,
        confidence: result.data.confidence,
      };
    } catch (error) {
      throw new Error('OCR processing failed');
    }
  }
}
