import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-document-types',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="tvm-container" *ngIf="folder; else nf">
      <div class="breadcrumbs">
        <a routerLink="/dashboard">Dashboard</a><span class="sep">›</span>
        <a routerLink="/folders">Folders</a><span class="sep">›</span>
        <span>{{ folder.name }}</span>
      </div>

      <div class="folder-hero" [style.background]="'linear-gradient(135deg,' + folder.color + ' 0%, #12285a 100%)'">
        <div>
          <div class="pill"><mat-icon>folder_special</mat-icon> {{ folder.name }}</div>
          <h1>{{ folder.fullName }}</h1>
          <p>{{ folder.address }}</p>
          <div class="meta">
            <span><mat-icon>call</mat-icon>{{ folder.phone }}</span>
            <span><mat-icon>language</mat-icon>{{ folder.website }}</span>
          </div>
        </div>
        <img *ngIf="folder.logo" [src]="folder.logo" [alt]="folder.name" class="folder-logo"/>
      </div>

      <div class="page-header" style="margin-top:28px">
        <div>
          <h1 style="font-size:20px">Document Types</h1>
          <div class="subtitle">Choose the kind of document you want to work with</div>
        </div>
      </div>

      <div class="grid">
        <a *ngFor="let d of folder.docTypes"
           [routerLink]="['/folders', folder.slug, d.slug]"
           class="card clickable dt-card">
          <div class="dt-icon" [style.background]="d.color + '18'" [style.color]="d.color">
            <mat-icon>{{ d.icon }}</mat-icon>
          </div>
          <div class="dt-body">
            <div class="dt-title">{{ d.label }}</div>
            <div class="dt-desc">{{ d.description }}</div>
            <div class="dt-count">
              <mat-icon>description</mat-icon>
              {{ svc.getTemplates(folder.slug, d.slug).length }} templates
            </div>
          </div>
          <mat-icon class="arrow">chevron_right</mat-icon>
        </a>
      </div>
    </div>

    <ng-template #nf>
      <div class="tvm-container empty-state">
        <mat-icon>error_outline</mat-icon>
        <h2>Folder not found</h2>
        <a mat-raised-button color="primary" routerLink="/folders">Back to folders</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .folder-hero {
      color: #fff; border-radius: 18px; padding: 30px 32px;
      display: flex; align-items: center; justify-content: space-between; gap: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,.12);
    }
    .folder-hero .pill {
      display: inline-flex; gap: 6px; align-items: center;
      background: rgba(255,255,255,.15); padding: 6px 14px; border-radius: 999px;
      font-size: 12px; text-transform: uppercase; letter-spacing: .5px; font-weight: 600;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #f5b301; }
    }
    .folder-hero h1 { margin: 10px 0 6px; font-size: 26px; font-weight: 800; }
    .folder-hero p  { margin: 0; opacity: .85; font-size: 13px; max-width: 500px; }
    .folder-hero .meta { display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap; font-size: 13px; opacity: .95; }
    .folder-hero .meta span { display: inline-flex; align-items: center; gap: 6px; }
    .folder-hero .meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .folder-logo { height: 70px; background: #fff; padding: 8px 14px; border-radius: 10px; }

    .dt-card {
      display: flex; align-items: center; gap: 16px; padding: 20px;
      color: inherit; text-decoration: none;
    }
    .dt-icon {
      width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }
    .dt-body { flex: 1; }
    .dt-title { font-size: 16px; font-weight: 700; color: var(--tvm-navy); }
    .dt-desc { font-size: 13px; color: var(--tvm-muted); margin-top: 2px; }
    .dt-count {
      display: inline-flex; align-items: center; gap: 4px;
      margin-top: 8px; font-size: 12px; color: var(--tvm-navy); font-weight: 600;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .arrow { color: var(--tvm-muted); }
    .dt-card:hover .arrow { color: var(--tvm-navy); transform: translateX(3px); }
  `]
})
export class DocumentTypesComponent {
  svc = inject(TemplateService);
  private route = inject(ActivatedRoute);
  folder = this.svc.getFolder(this.route.snapshot.paramMap.get('company') ?? '');
}

