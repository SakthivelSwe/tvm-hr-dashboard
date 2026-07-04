import { Component, ElementRef, HostListener, ViewChild, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TemplateService } from '../../services/template.service';
import { DownloadService } from '../../services/download.service';
import { TemplateField } from '../../models/template.models';

@Component({
  selector: 'app-template-fill',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './template-fill.component.html',
  styleUrl: './template-fill.component.scss'
})
export class TemplateFillComponent {
  private svc = inject(TemplateService);
  private dl = inject(DownloadService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private snack = inject(MatSnackBar);

  @ViewChild('preview', { static: false }) previewEl?: ElementRef<HTMLDivElement>;

  templateId = this.route.snapshot.paramMap.get('templateId') ?? '';
  company    = this.route.snapshot.paramMap.get('company') ?? '';
  docType    = this.route.snapshot.paramMap.get('docType') ?? '';

  template = this.svc.getTemplate(this.templateId);
  folder   = this.svc.getFolder(this.company);
  dtInfo   = this.svc.getDocType(this.company, this.docType);

  values = signal<Record<string,string>>(this.template ? this.svc.buildDefaults(this.template) : {});
  dlOpen = false;
  downloading = false;

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (!el.closest('.dl-wrap')) this.dlOpen = false;
  }

  // group fields for nice UI
  groups = computed(() => {
    if (!this.template) return [] as { name: string; fields: TemplateField[] }[];
    const map = new Map<string, TemplateField[]>();
    for (const f of this.template.fields) {
      const g = f.group ?? 'General';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(f);
    }
    return Array.from(map.entries()).map(([name, fields]) => ({ name, fields }));
  });

  rendered = computed<SafeHtml>(() =>
    this.template
      ? this.sanitizer.bypassSecurityTrustHtml(this.svc.render(this.template, this.values()))
      : ''
  );

  update(key: string, value: string) {
    this.values.update(v => ({ ...v, [key]: value }));
  }

  reset() {
    if (!this.template) return;
    this.values.set(this.svc.buildDefaults(this.template));
    this.snack.open('Values reset to defaults', 'OK', { duration: 2000 });
  }

  openInEditor() {
    if (!this.template) return;
    // stash filled html into sessionStorage so editor can pick it up
    const rendered = this.svc.render(this.template, this.values());
    sessionStorage.setItem('tvm_editor_html', rendered);
    sessionStorage.setItem('tvm_editor_title', `${this.template.name} - ${this.values()['employeeName'] || ''}`);
    this.router.navigate(['/editor']);
  }

  async downloadPdf() {
    if (!this.previewEl || !this.template) return;
    this.dlOpen = false;
    this.downloading = true;
    const fname = `${this.template.name}_${(this.values()['employeeName']||'document').replace(/\s+/g,'_')}`;
    try {
      // Pass the actual visible #preview element — cloning off-screen causes blank PDF
      await this.dl.downloadPdf(this.previewEl.nativeElement, fname);
      this.snack.open('✅ PDF downloaded successfully', 'OK', { duration: 2500 });
    } catch (e) {
      console.error('PDF error:', e);
      this.snack.open('❌ PDF export failed — check console', 'Dismiss', { duration: 3000 });
    } finally { this.downloading = false; }
  }

  async downloadDocx() {
    if (!this.template) return;
    this.dlOpen = false;
    this.downloading = true;
    const html = this.svc.render(this.template, this.values());
    const fname = `${this.template.name}_${(this.values()['employeeName']||'document').replace(/\s+/g,'_')}`;
    try {
      await this.dl.downloadDocx(html, fname);
      this.snack.open('✅ Word document downloaded', 'OK', { duration: 2500 });
    } catch (e) {
      this.snack.open('❌ Word export failed', 'Dismiss', { duration: 3000 });
    } finally { this.downloading = false; }
  }
}

