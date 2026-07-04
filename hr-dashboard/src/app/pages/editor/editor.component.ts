import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { TemplateService } from '../../services/template.service';
import { DownloadService } from '../../services/download.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, QuillModule,
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(TemplateService);
  private dl = inject(DownloadService);
  private sanitizer = inject(DomSanitizer);
  private snack = inject(MatSnackBar);

  @ViewChild('preview', { static: false }) previewEl?: ElementRef<HTMLDivElement>;

  title = signal('Untitled Document');
  content = signal<string>('');
  showPreview = signal(false);
  dlOpen = false;
  tplOpen = false;

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (!el.closest('.dl-wrap')) { this.dlOpen = false; this.tplOpen = false; }
  }


  editorModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'link'],
      [{ script: 'sub' }, { script: 'super' }],
      ['clean']
    ]
  };

  constructor() {
    // Route: /editor/:company/:docType/:templateId
    const templateId = this.route.snapshot.paramMap.get('templateId');
    if (templateId) {
      const t = this.svc.getTemplate(templateId);
      if (t) {
        const rendered = this.svc.render(t, this.svc.buildDefaults(t));
        this.content.set(rendered);
        this.title.set(t.name);
        return;
      }
    }
    // Otherwise pick up any stashed content from another page
    const staged      = sessionStorage.getItem('tvm_editor_html');
    const stagedTitle = sessionStorage.getItem('tvm_editor_title');
    const fromUpload  = sessionStorage.getItem('tvm_editor_from_upload') === 'true';
    sessionStorage.removeItem('tvm_editor_from_upload');

    if (staged) {
      this.content.set(staged);
      sessionStorage.removeItem('tvm_editor_html');
      // Auto-switch to Preview mode for uploaded files so complex HTML renders correctly
      if (fromUpload) {
        setTimeout(() => this.showPreview.set(true), 100);
      }
    }
    if (stagedTitle) {
      this.title.set(stagedTitle);
      sessionStorage.removeItem('tvm_editor_title');
    }
    if (!staged && !templateId) {
      this.content.set(`<h1 style="text-align:center;color:#1a3a7e;">New Document</h1>
        <p>Start typing here. Use the toolbar above to format text, add lists, headings and more.</p>`);
    }
  }

  safePreview(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.content());
  }

  togglePreview() { this.showPreview.update(v => !v); }

  loadSample(id: string) {
    const t = this.svc.getTemplate(id);
    if (!t) return;
    this.content.set(this.svc.render(t, this.svc.buildDefaults(t)));
    this.title.set(t.name);
    this.snack.open(`Loaded: ${t.name}`, 'OK', { duration: 2000 });
  }

  templates() {
    return this.svc.getFolders().flatMap(f =>
      f.docTypes.flatMap(d => this.svc.getTemplates(f.slug, d.slug).map(t => ({ ...t, folder: f.name, dt: d.label })))
    );
  }

  clear() {
    this.content.set('<p></p>');
    this.snack.open('Editor cleared', 'OK', { duration: 1500 });
  }

  async downloadPdf() {
    // Put editor content into a properly styled div that is briefly in the DOM
    const host = document.createElement('div');
    host.className = 'doc-preview';           // global CSS applies via class
    host.style.cssText = 'width:794px; position:absolute; left:0; top:0; z-index:-9999; pointer-events:none;';
    host.innerHTML = this.content();
    document.body.appendChild(host);
    try {
      await this.dl.downloadPdf(host, this.title());
      this.snack.open('✅ PDF downloaded', 'OK', { duration: 2000 });
    } catch (e) {
      console.error('PDF error:', e);
      this.snack.open('❌ PDF export failed', 'Dismiss', { duration: 3000 });
    } finally {
      document.body.removeChild(host);
    }
  }

  async downloadDocx() {
    try {
      await this.dl.downloadDocx(this.content(), this.title());
      this.snack.open('✅ Word document downloaded', 'OK', { duration: 2000 });
    } catch (e) {
      this.snack.open('❌ Word export failed', 'Dismiss', { duration: 3000 });
    }
  }
}

