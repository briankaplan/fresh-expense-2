import { ImportService } from '../services/import.service';

export class UploadArea {
  private element: HTMLElement;
  private fileInput: HTMLInputElement;

  constructor(elementId: string, fileInputId: string) {
    this.element = document.getElementById(elementId)!;
    this.fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.element.addEventListener('dragover', this.handleDragOver.bind(this));
    this.element.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.element.addEventListener('drop', this.handleDrop.bind(this));
    this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
  }

  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    this.element.classList.add('drag-over');
  }

  private handleDragLeave(): void {
    this.element.classList.remove('drag-over');
  }

  private async handleDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    this.element.classList.remove('drag-over');
    
    const file = e.dataTransfer?.files[0];
    if (file && file.type === 'text/csv') {
      await this.processFile(file);
    } else {
      alert('Please upload a CSV file');
    }
  }

  private async handleFileSelect(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      await this.processFile(file);
    }
  }

  private async processFile(file: File): Promise<void> {
    try {
      await ImportService.processCSVFile(file);
      // Emit event for UI update
      window.dispatchEvent(new CustomEvent('passwordsImported'));
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
    }
  }
} 