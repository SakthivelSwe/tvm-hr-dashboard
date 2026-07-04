import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private svc = inject(TemplateService);
  folders = this.svc.getFolders();

  get totalTemplates(): number {
    return this.folders.reduce((sum, f) =>
      sum + f.docTypes.reduce((s, d) => s + this.svc.getTemplates(f.slug, d.slug).length, 0), 0);
  }

  quickActions = [
    { icon: 'folder_special', title: 'Company Folders', desc: 'Browse TVM document templates', route: '/folders', color: '#1a3a7e' },
    { icon: 'edit_note',      title: 'Online Editor',   desc: 'Open a rich editor for a template', route: '/editor', color: '#0f766e' },
    { icon: 'upload_file',    title: 'Upload & Edit',   desc: 'Import a Word / PDF file to edit', route: '/upload', color: '#f5b301' }
  ];
}

