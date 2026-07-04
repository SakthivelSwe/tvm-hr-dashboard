# TVM HR — Document Dashboard

A modern, HR-only Angular 18 dashboard for managing and downloading company documents.

## Features

### 1. Static Folder Templates (Priority)
Browse company folders → document types → templates → fill required fields → live preview → download as **PDF** or **DOCX**.

One seeded company with all four document types:
- **TVM Infotech** (Offer, Relieving, Service, Payslip)

Every template is field-driven — Employee name, Designation, Salary, Joining date, Relieving date, Terms & conditions, Payslip components, Company info, etc.

### 2. Online Editor
- Rich-text editing powered by **ngx-quill** / Quill 2
- Load any static template into the editor for free-form inline editing
- Toggle between **Edit** and **Preview** modes
- Download the edited document as PDF or DOCX

### 3. Upload & Edit External Files
- Drag & drop or file picker
- `.docx` → converted to editable HTML using **mammoth.js**
- `.pdf`  → text extracted using **pdf.js** (loaded from CDN)
- `.txt` / `.html` supported
- Opens automatically in the Online Editor

## Tech Stack
- **Angular 18** (standalone components, lazy-loaded routes, Signals)
- **Angular Material** UI
- **ngx-quill** + Quill 2 rich text editor
- **mammoth.js** — Word import
- **pdf.js** (CDN) — PDF text extraction
- **html2pdf.js** (html2canvas + jsPDF) — PDF export
- **docx** + **file-saver** — DOCX export

## Run

```powershell
cd hr-dashboard
npm install
npm start
```
Then open http://localhost:4200

## Build

```powershell
npm run build
```
Output is emitted to `dist/hr-dashboard`.

## Project Layout

```
src/app/
├── app.component.*         Shell with sidenav + toolbar
├── app.routes.ts           Lazy-loaded route table
├── models/
│   └── template.models.ts  DocTemplate / TemplateField / CompanyFolder types
├── services/
│   ├── template.service.ts Static folder + template data & rendering
│   └── download.service.ts PDF / DOCX generation
└── pages/
    ├── dashboard/          Landing dashboard with stats & quick actions
    ├── folders/            Company folder grid
    ├── document-types/     Doc types inside a company
    ├── templates/          Templates inside a doc type
    ├── template-fill/      Fill fields + live preview + download  (Option 1 flow)
    ├── editor/             Quill-based rich editor              (Option 2A flow)
    └── upload/             Drag-drop upload for Word / PDF      (Option 2B flow)
```

## Extending

To add a new company, edit `src/app/services/template.service.ts` and append another `CompanyFolder`. To add a new template, add an entry to `buildTemplatesFor()` with an HTML string using `{{placeholder}}` tokens and a matching `TemplateField[]` array.

