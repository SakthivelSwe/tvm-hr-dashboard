import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="tvm-container" *ngIf="folder && docType; else nf">
      <div class="breadcrumbs">
        <a routerLink="/dashboard">Dashboard</a><span class="sep">›</span>
        <a routerLink="/folders">Folders</a><span class="sep">›</span>
        <a [routerLink]="['/folders', folder.slug]">{{ folder.name }}</a><span class="sep">›</span>
        <span>{{ docType.label }}</span>
      </div>

      <div class="page-header">
        <div>
          <h1>
            <mat-icon [style.color]="docType.color" style="vertical-align:middle;margin-right:8px;">{{ docType.icon }}</mat-icon>
            {{ folder.name }} · {{ docType.label }}
          </h1>
          <div class="subtitle">{{ docType.description }}</div>
        </div>
      </div>

      <div class="grid" *ngIf="templates.length; else empty">
        <div *ngFor="let t of templates" class="card tpl-card">
          <div class="tpl-preview" [style.background]="docType.color + '10'">
            <mat-icon [style.color]="docType.color">{{ docType.icon }}</mat-icon>
          </div>
          <div class="tpl-body">
            <div class="tpl-title">{{ t.name }}</div>
            <div class="tpl-desc">{{ t.description }}</div>
            <div class="tpl-meta">
              <span class="badge">{{ t.fields.length }} fields</span>
              <span class="badge" style="background:#ecfdf5;color:#047857">Static</span>
            </div>
          </div>
          <div class="tpl-actions">
            <a mat-raised-button color="primary"
               [routerLink]="['/folders', folder.slug, docType.slug, t.id]">
              <mat-icon>edit_note</mat-icon> Fill &amp; Preview
            </a>
            <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
            <mat-menu #menu="matMenu">
              <a mat-menu-item [routerLink]="['/editor', folder.slug, docType.slug, t.id]">
                <mat-icon>edit</mat-icon><span>Open in Online Editor</span>
              </a>
            </mat-menu>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>No templates yet in this folder.</p>
        </div>
      </ng-template>
    </div>

    <ng-template #nf>
      <div class="tvm-container empty-state">
        <mat-icon>error_outline</mat-icon><h2>Not found</h2>
      </div>
    </ng-template>
  `,
  styles: [`
    .tpl-card { display: flex; flex-direction: column; }
    .tpl-preview {
      height: 130px; display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: .8; }
    }
    .tpl-body { padding: 16px 18px 8px; flex: 1; }
    .tpl-title { font-size: 15px; font-weight: 700; color: var(--tvm-navy); }
    .tpl-desc { font-size: 12px; color: var(--tvm-muted); margin-top: 3px; min-height: 30px; }
    .tpl-meta { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
    .tpl-actions {
      display: flex; align-items: center; gap: 6px; padding: 10px 14px;
      border-top: 1px solid var(--tvm-border); background: #fafbff;
      a[mat-raised-button] { flex: 1; }
    }
  `]
})
export class TemplatesComponent {
  private svc = inject(TemplateService);
  private route = inject(ActivatedRoute);
  private company = this.route.snapshot.paramMap.get('company') ?? '';
  private dt = this.route.snapshot.paramMap.get('docType') ?? '';

  folder = this.svc.getFolder(this.company);
  docType = this.svc.getDocType(this.company, this.dt);
  templates = this.svc.getTemplates(this.company, this.dt);
}

