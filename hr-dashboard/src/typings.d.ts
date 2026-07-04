declare module 'html2pdf.js' {
  const html2pdf: any;
  export default html2pdf;
}

declare module 'mammoth/mammoth.browser' {
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer } | { buffer: any }): Promise<{ value: string; messages: any[] }>;
  export function extractRawText(input: any): Promise<{ value: string; messages: any[] }>;
  const _default: any;
  export default _default;
}

