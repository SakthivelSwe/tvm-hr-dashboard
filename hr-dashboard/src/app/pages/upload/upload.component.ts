import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSnackBarModule, MatProgressBarModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  dragOver  = signal(false);
  busy      = signal(false);
  status    = signal('');
  fileName  = signal<string | null>(null);
  fileIcon  = signal('insert_drive_file');

  onDragOver(e: DragEvent)  { e.preventDefault(); this.dragOver.set(true); }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.dragOver.set(false); }
  onDrop(e: DragEvent) {
    e.preventDefault(); this.dragOver.set(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) this.handleFile(f);
  }
  onPick(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) this.handleFile(f);
    input.value = '';
  }

  async handleFile(file: File) {
    this.fileName.set(file.name);
    this.busy.set(true);
    this.status.set('Reading file…');

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      let html = '';

      if (ext === 'docx') {
        this.fileIcon.set('description');
        this.status.set('Converting Word document…');
        html = await this.docxToHtml(file);

      } else if (ext === 'doc') {
        throw new Error('Legacy .doc format is not supported. Please open in Word and save as .docx first.');

      } else if (ext === 'pdf') {
        this.fileIcon.set('picture_as_pdf');
        this.status.set('Loading PDF engine…');
        html = await this.pdfToHtml(file);

      } else if (ext === 'txt') {
        this.fileIcon.set('article');
        this.status.set('Reading text file…');
        const text = await file.text();
        html = `<pre style="font-family:inherit;white-space:pre-wrap;font-size:14px;">${this.escape(text)}</pre>`;

      } else if (ext === 'html' || ext === 'htm') {
        this.fileIcon.set('code');
        this.status.set('Reading HTML file…');
        html = await file.text();

      } else {
        throw new Error(`Unsupported file type ".${ext}". Please upload .docx, .pdf, .txt or .html.`);
      }

      this.status.set('Opening editor…');
      sessionStorage.setItem('tvm_editor_html',  html);
      sessionStorage.setItem('tvm_editor_title', file.name.replace(/\.[^/.]+$/, ''));
      // Tell the editor to auto-switch to preview when content has tables
      sessionStorage.setItem('tvm_editor_from_upload', 'true');

      this.snack.open(`✅ "${file.name}" imported — opening editor`, 'OK', { duration: 3000 });
      setTimeout(() => this.router.navigate(['/editor']), 400);

    } catch (err: any) {
      this.status.set('');
      this.snack.open(`❌ ${err?.message ?? 'Failed to import file'}`, 'Dismiss', { duration: 6000 });
    } finally {
      this.busy.set(false);
    }
  }

  // ── DOCX → HTML (mammoth) ────────────────────────────────────────────────
  private async docxToHtml(file: File): Promise<string> {
    // Dynamically import mammoth to avoid Angular compile-time issues
    const mammoth = await import('mammoth/mammoth.browser' as any);
    const buffer  = await file.arrayBuffer();
    const result  = await (mammoth as any).convertToHtml({ arrayBuffer: buffer });
    const html = result?.value ?? '';
    if (!html.trim()) throw new Error('Word document appears to be empty.');
    return html;
  }

  // ── PDF → HTML (pdf.js via CDN) ──────────────────────────────────────────
  private async pdfToHtml(file: File): Promise<string> {
    const pdfjs  = await this.loadPdfJs();
    const buffer = await file.arrayBuffer();

    this.status.set('Parsing PDF…');
    const doc = await pdfjs.getDocument({ data: buffer }).promise;
    const pageParts: string[] = [];
    let totalChars = 0;

    for (let p = 1; p <= doc.numPages; p++) {
      this.status.set(`Extracting page ${p} of ${doc.numPages}…`);
      const page = await doc.getPage(p);
      const tc   = await page.getTextContent();
      const items: any[] = tc.items ?? [];

      if (items.length === 0) continue;

      // Group items by rounded Y position to reconstruct lines
      const lineMap = new Map<number, string[]>();
      for (const item of items) {
        if (!item.str?.trim()) continue;
        // transform[5] = Y coordinate (higher = upper part of page in PDF space)
        const y = Math.round(item.transform[5]);
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y)!.push(item.str);
      }

      // Sort lines top→bottom (descending Y in PDF space = ascending visual order)
      const lines = [...lineMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, words]) => words.join('').trim())
        .filter(l => l.length > 0);

      totalChars += lines.join('').length;

      if (lines.length > 0) {
        const separator = `<p style="color:#9ca3af;font-size:11px;margin:12px 0 4px;border-top:1px dashed #e5e7eb;padding-top:6px;">Page ${p}</p>`;
        const content   = lines.map(l => `<p>${this.escape(l)}</p>`).join('');
        pageParts.push(separator + content);
      }
    }

    // Detect image-based PDFs (no extractable text)
    if (totalChars < 20) {
      throw new Error(
        'This PDF contains only images — no text could be extracted.\n' +
        'This happens when a PDF is created from screenshots, scans, or our own PDF download.\n' +
        'Tip: Upload the original Word (.docx) file instead, or use a text-based PDF.'
      );
    }

    return `<div style="font-family:'Times New Roman',serif;font-size:14px;line-height:1.6;">${pageParts.join('')}</div>`;
  }

  // ── Load pdf.js once from CDN ────────────────────────────────────────────
  private pdfJsPromise?: Promise<any>;
  private loadPdfJs(): Promise<any> {
    if (this.pdfJsPromise) return this.pdfJsPromise;
    this.pdfJsPromise = new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(lib);
      };
      script.onerror = () => reject(new Error('Could not load PDF.js from CDN. Check your internet connection.'));
      document.head.appendChild(script);
    });
    return this.pdfJsPromise;
  }

  private escape(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
