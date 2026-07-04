import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-folders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="tvm-container">
      <div class="breadcrumbs">
        <a routerLink="/dashboard">Dashboard</a><span class="sep">›</span><span>Company Folders</span>
      </div>
      <div class="page-header">
        <div>
          <h1>Company Folders</h1>
          <div class="subtitle">Pick a company to see its document templates</div>
        </div>
      </div>

      <div class="grid">
        <a *ngFor="let f of folders" [routerLink]="['/folders', f.slug]" class="card clickable folder-card">
          <div class="folder-strip" [style.background]="f.color"></div>
          <div class="folder-body">
            <div class="folder-title">
              <mat-icon [style.color]="f.color">folder_special</mat-icon>
              <span>{{ f.name }}</span>
            </div>
            <div class="folder-full">{{ f.fullName }}</div>
            <div class="folder-address">
              <mat-icon>place</mat-icon>
              <span>{{ f.address }}</span>
            </div>
            <div class="folder-tags">
              <span class="badge" *ngFor="let d of f.docTypes">{{ d.label }} · {{ svc.getTemplates(f.slug, d.slug).length }}</span>
            </div>
          </div>
          <div class="folder-cta">
            <span>Open</span><mat-icon>arrow_forward</mat-icon>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .folder-card { color: inherit; text-decoration: none; display: flex; flex-direction: column; }
    .folder-strip { height: 8px; }
    .folder-body { padding: 20px; flex: 1; }
    .folder-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 19px; font-weight: 700; color: var(--tvm-navy);
    }
    .folder-full { color: var(--tvm-muted); font-size: 13px; margin: 4px 0 12px; }
    .folder-address {
      display: flex; gap: 6px; align-items: flex-start;
      font-size: 12px; color: var(--tvm-muted); margin-bottom: 14px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-top: 2px; }
    }
    .folder-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .folder-cta {
      background: #f8fafc; border-top: 1px solid var(--tvm-border);
      padding: 12px 20px; display: flex; align-items: center; justify-content: space-between;
      color: var(--tvm-navy); font-weight: 600; font-size: 14px;
      mat-icon { transition: transform .18s; }
    }
    .folder-card:hover .folder-cta mat-icon { transform: translateX(4px); }
  `]
})
export class FoldersComponent {
  svc = inject(TemplateService);
  folders = this.svc.getFolders();
}

