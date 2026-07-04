import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

@Injectable({ providedIn: 'root' })
export class DownloadService {

  // ── PDF (dynamic page height — eliminates trailing whitespace) ────────────
  async downloadPdf(element: HTMLElement, filename: string): Promise<void> {
    // Measure the element's real content dimensions before export
    const contentW = element.offsetWidth  || 794;
    const contentH = element.scrollHeight || 600;
    // A4 width = 210 mm, margins = 8 mm each side → 194 mm usable
    // Scale factor: 194 mm maps to contentW pixels
    const pdfPageH = Math.ceil((contentH / contentW) * 194) + 16; // +16 for top+bottom margin

    await (html2pdf() as any)
      .set({
        margin:      [8, 8, 8, 8],
        filename:    this.ensureExt(filename, 'pdf'),
        image:       { type: 'png' },
        html2canvas: {
          scale:           3,
          useCORS:         true,
          allowTaint:      true,
          logging:         false,
          backgroundColor: '#ffffff',
          scrollX:         0,
          scrollY:         -window.scrollY
        },
        // Custom page height = content height → no blank space at the bottom
        jsPDF: { unit: 'mm', format: [210, pdfPageH], orientation: 'portrait' }
      })
      .from(element)
      .save();
  }

  // ── Word (.doc) — single-page A4, images base64-inlined ────────────────────
  async downloadDocx(html: string, filename: string): Promise<void> {
    const processedHtml = await this.inlineImages(html);

    // @page WordSection1 sets the physical page size + margins so Word uses
    // exactly A4 (595.3 × 841.9 pt) with 45 pt top/bottom and 54 pt left/right.
    // mso-pagination:none on tables/payslip prevents mid-content page breaks.
    const styles = `
      @page WordSection1 {
        size: 595.3pt 841.9pt;
        margin: 45pt 54pt 45pt 54pt;
        mso-header-margin: 21.6pt;
        mso-footer-margin: 21.6pt;
        mso-paper-source: 0;
      }
      div.WordSection1 { page: WordSection1; }
      body  { font-family:'Times New Roman',serif; font-size:11pt; color:#000; margin:0; padding:0; }
      img   { display:block; margin:0 auto 3pt; }
      p     { margin:0 0 4pt 0; }
      table { border-collapse:collapse; width:100%; margin:0; page-break-inside:avoid; mso-pagination:none; }
      td,th { border:1pt solid #000; padding:2pt 5pt; font-size:10.5pt; vertical-align:middle; line-height:1.25; }
      th    { font-weight:bold; text-align:left; }
      .payslip { mso-pagination:none; page-break-inside:avoid; }
      .ps-logo  { text-align:center; margin-bottom:4pt; }
      .ps-title { text-align:center; font-weight:bold; font-size:12pt; margin-bottom:4pt; }
      .ps-title u { text-decoration:underline; }
      .ps-blueline td { background:#1a3a7e !important; color:#1a3a7e !important; height:4pt; padding:0;
                        border-color:#1a3a7e; mso-background-source:auto; mso-pattern:auto; }
      .ps-head th     { background:#1a3a7e !important; color:#fff !important; text-align:center;
                        font-weight:bold; font-size:11pt; mso-background-source:auto; mso-pattern:auto; }
      .lbl  { text-align:left; }
      .amt  { text-align:right; }
      .ps-total th, .ps-net th { font-weight:bold; }
      .ps-signature { text-align:center; font-style:italic; font-size:9.5pt; margin-top:5pt; margin-bottom:0; }
      .ps-footer    { border-top:1pt solid #1a3a7e; padding-top:4pt; font-size:9.5pt;
                      margin-top:7pt; line-height:1.35; page-break-inside:avoid; mso-pagination:none; }
      .ps-company   { color:#1a3a7e; font-weight:bold; font-size:11pt; margin-bottom:1pt; }
      .ps-footer-details { margin:0; padding:0; }
      /* offer / relieving / service letter styles */
      .letterhead   { text-align:center; margin-bottom:16pt; }
      .letterhead img { height:60pt; }
      .signature    { margin-top:24pt; }
      .footer-block { border-top:1.5pt solid #1a3a7e; padding-top:6pt; font-size:10pt;
                      margin-top:24pt; color:#1a3a7e; }
    `;

    const wordDoc = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <style>${styles}</style>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body>
<div class="WordSection1">${processedHtml}</div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', wordDoc], { type: 'application/msword' });
    const base = filename.replace(/\.(docx|doc)$/i, '');
    saveAs(blob, `${base}.doc`);
  }

  private async inlineImages(html: string): Promise<string> {
    // Logo display size: matches CSS (.ps-logo img { width:130px; height:auto })
    // TVM logo aspect ratio ~622:401 → at W=130px, H≈84px
    const W = 130, H = 84;

    const regex = /<img([^>]*?)src="([^"]+)"([^>]*?)>/gi;
    const matches = [...html.matchAll(regex)];
    let result = html;

    for (const match of matches) {
      const [fullTag, , rawSrc] = match;
      const src = rawSrc.startsWith('http') || rawSrc.startsWith('data:')
        ? rawSrc
        : `${window.location.origin}/${rawSrc.replace(/^\//, '')}`;

      try {
        const resp = await fetch(src, { cache: 'force-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        let b64: string;
        const ct = resp.headers.get('content-type') ?? '';
        const isSvg = src.toLowerCase().endsWith('.svg') || ct.includes('svg');

        if (isSvg) {
          const svgText = await resp.text();
          const encoded = btoa(unescape(encodeURIComponent(svgText)));
          b64 = `data:image/svg+xml;base64,${encoded}`;
        } else {
          const blob = await resp.blob();
          b64 = await this.blobToBase64(blob);
        }

        // Explicit W × H prevents Word from auto-scaling the image
        const newTag = `<img src="${b64}" width="${W}" height="${H}"
          style="width:${W}px;height:${H}px;display:block;margin:0 auto 6pt;"/>`;
        result = result.replace(fullTag, newTag);
      } catch {
        result = result.replace(
          fullTag,
          `<p style="text-align:center;font-weight:900;font-size:22pt;color:#1a3a7e;margin:0 0 4pt;">TVM</p>
           <p style="text-align:center;font-size:12pt;color:#1a3a7e;margin:0 0 8pt;">let's Begin</p>`
        );
      }
    }
    return result;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror   = reject;
      reader.readAsDataURL(blob);
    });
  }

  private ensureExt(name: string, ext: string): string {
    return name.toLowerCase().endsWith('.' + ext) ? name : `${name}.${ext}`;
  }
}
