import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'folders',
    loadComponent: () => import('./pages/folders/folders.component').then(m => m.FoldersComponent)
  },
  {
    path: 'folders/:company',
    loadComponent: () => import('./pages/document-types/document-types.component').then(m => m.DocumentTypesComponent)
  },
  {
    path: 'folders/:company/:docType',
    loadComponent: () => import('./pages/templates/templates.component').then(m => m.TemplatesComponent)
  },
  {
    path: 'folders/:company/:docType/:templateId',
    loadComponent: () => import('./pages/template-fill/template-fill.component').then(m => m.TemplateFillComponent)
  },
  {
    path: 'editor',
    loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'editor/:company/:docType/:templateId',
    loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./pages/upload/upload.component').then(m => m.UploadComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];

