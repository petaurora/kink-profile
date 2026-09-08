import html2canvas from "html2canvas";
import type { ProfileShareSummaryModel } from "./profileShareSummary";

export type ShareExportFormat = "png" | "html" | "pdf";

export type PdfSlice = {
  start: number;
  end: number;
};

export type PdfJpegPage = {
  jpegBytes: Uint8Array;
  width: number;
  height: number;
};

const letterWidth = 612;
const letterHeight = 792;
const pdfMargin = 28;
const maxCanvasDimension = 30000;
const exportScale = 2.5;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "profile";
}

export function createShareExportFilename(
  model: ProfileShareSummaryModel,
  format: ShareExportFormat,
) {
  const date = /^\d{4}-\d{2}-\d{2}/.exec(model.generatedAt)?.[0] ?? "summary";
  return `${slugify(model.displayName)}-kink-profile-summary-${date}.${format}`;
}

export function buildStandaloneShareHtml(
  model: ProfileShareSummaryModel,
  summaryMarkup: string,
  cssText: string,
) {
  const title = escapeHtml(`${model.displayName} — Kink Profile`);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
html { background: #101240; }
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 24px;
  background: #101240;
  color: #F0D3E7;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
body > .share-summary { width: min(100%, 860px); }
@media (max-width: 620px) {
  body { padding: 0; }
  body > .share-summary {
    width: 100%;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }
}
${cssText}
</style>
</head>
<body>
${summaryMarkup}
</body>
</html>
`;
}

export function planPdfSlices(
  totalHeight: number,
  pageHeight: number,
  blockBoundaries: readonly number[],
  minimumFill = 0.55,
): PdfSlice[] {
  if (totalHeight <= 0 || pageHeight <= 0) return [];

  const boundaries = [...new Set(
    blockBoundaries
      .map((value) => Math.round(value))
      .filter((value) => value > 0 && value < totalHeight),
  )].sort((left, right) => left - right);

  const slices: PdfSlice[] = [];
  let start = 0;

  while (totalHeight - start > pageHeight) {
    const target = start + pageHeight;
    const minimum = start + pageHeight * minimumFill;
    const candidates = boundaries.filter(
      (boundary) => boundary > minimum && boundary <= target,
    );
    const end = candidates.at(-1) ?? target;

    slices.push({ start, end });
    start = end;
  }

  if (start < totalHeight) {
    slices.push({ start, end: totalHeight });
  }

  return slices;
}

function ascii(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts: readonly Uint8Array[]) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

export function buildPdfFromJpegPages(
  pages: readonly PdfJpegPage[],
): Uint8Array {
  if (pages.length === 0) {
    throw new Error("Cannot build a PDF without at least one page.");
  }

  const objectCount = 2 + pages.length * 3;
  const offsets = new Array<number>(objectCount + 1).fill(0);
  const parts: Uint8Array[] = [];
  let byteLength = 0;

  const push = (bytes: Uint8Array) => {
    parts.push(bytes);
    byteLength += bytes.length;
  };

  const pushAscii = (value: string) => push(ascii(value));

  const beginObject = (objectNumber: number) => {
    offsets[objectNumber] = byteLength;
    pushAscii(`${objectNumber} 0 obj\n`);
  };

  const endObject = () => pushAscii("endobj\n");

  pushAscii("%PDF-1.4\n");

  beginObject(1);
  pushAscii("<< /Type /Catalog /Pages 2 0 R >>\n");
  endObject();

  const pageObjectNumbers = pages.map((_, index) => 3 + index * 3);

  beginObject(2);
  pushAscii(
    `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectNumbers
      .map((number) => `${number} 0 R`)
      .join(" ")}] >>\n`,
  );
  endObject();

  const contentWidth = letterWidth - pdfMargin * 2;
  const contentHeight = letterHeight - pdfMargin * 2;

  pages.forEach((page, index) => {
    const pageObject = 3 + index * 3;
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;
    const imageName = `Im${index + 1}`;
    const scale = Math.min(
      contentWidth / page.width,
      contentHeight / page.height,
    );
    const drawWidth = page.width * scale;
    const drawHeight = page.height * scale;
    const x = (letterWidth - drawWidth) / 2;
    const y = letterHeight - pdfMargin - drawHeight;

    beginObject(pageObject);
    pushAscii(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${letterWidth} ${letterHeight}] /Resources << /XObject << /${imageName} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>\n`,
    );
    endObject();

    beginObject(imageObject);
    pushAscii(
      `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpegBytes.length} >>\nstream\n`,
    );
    push(page.jpegBytes);
    pushAscii("\nendstream\n");
    endObject();

    const content = ascii(
      `q\n${drawWidth.toFixed(3)} 0 0 ${drawHeight.toFixed(3)} ${x.toFixed(3)} ${y.toFixed(3)} cm\n/${imageName} Do\nQ\n`,
    );

    beginObject(contentObject);
    pushAscii(`<< /Length ${content.length} >>\nstream\n`);
    push(content);
    pushAscii("endstream\n");
    endObject();
  });

  const xrefOffset = byteLength;

  pushAscii(`xref\n0 ${objectCount + 1}\n`);
  pushAscii("0000000000 65535 f \n");

  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    pushAscii(
      `${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`,
    );
  }

  pushAscii(
    `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  );

  return concatBytes(parts);
}

export function collectDocumentCss(doc: Document = document) {
  const css: string[] = [];

  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      css.push(
        Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n"),
      );
    } catch {
      // Cross-origin styles are irrelevant to the local app export.
    }
  }

  return css.join("\n");
}

export async function renderShareElementToCanvas(
  element: HTMLElement,
  requestedScale = exportScale,
) {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  if (width <= 0 || height <= 0) {
    throw new Error("The share summary has no renderable size.");
  }

  const safeScale = Math.min(
    requestedScale,
    maxCanvasDimension / width,
    maxCanvasDimension / height,
  );

  if (safeScale < 0.5) {
    throw new Error("The share summary is too large to render safely.");
  }

  return html2canvas(element, {
    backgroundColor: "#211B4D",
    scale: safeScale,
    logging: false,
    useCORS: false,
    allowTaint: false,
    imageTimeout: 0,
    removeContainer: true,
    width,
    height,
    windowWidth: Math.max(560, width),
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The rendered summary could not be encoded."));
      },
      type,
      quality,
    );
  });
}

function dataUrlBytes(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function collectBlockBoundaries(
  element: HTMLElement,
  renderedHeight: number,
) {
  const rootRect = element.getBoundingClientRect();
  if (rootRect.height <= 0) return [];

  const scale = renderedHeight / rootRect.height;

  return Array.from(
    element.querySelectorAll<HTMLElement>("[data-share-block]"),
  )
    .map((block) => {
      const rect = block.getBoundingClientRect();
      return Math.round((rect.bottom - rootRect.top) * scale);
    })
    .filter((boundary) => boundary > 0 && boundary < renderedHeight);
}

async function pdfPagesFromCanvas(
  canvas: HTMLCanvasElement,
  element: HTMLElement,
) {
  const contentWidth = letterWidth - pdfMargin * 2;
  const contentHeight = letterHeight - pdfMargin * 2;
  const pixelsPerPoint = canvas.width / contentWidth;
  const pageHeightPixels = Math.floor(contentHeight * pixelsPerPoint);
  const boundaries = collectBlockBoundaries(element, canvas.height);
  const slices = planPdfSlices(
    canvas.height,
    pageHeightPixels,
    boundaries,
  );

  return slices.map((slice): PdfJpegPage => {
    const sliceHeight = Math.max(1, slice.end - slice.start);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const context = pageCanvas.getContext("2d");
    if (!context) {
      throw new Error("This browser could not create a PDF page canvas.");
    }

    context.drawImage(
      canvas,
      0,
      slice.start,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    return {
      jpegBytes: dataUrlBytes(pageCanvas.toDataURL("image/jpeg", 0.94)),
      width: pageCanvas.width,
      height: pageCanvas.height,
    };
  });
}

export function exportShareSummaryHtml(
  model: ProfileShareSummaryModel,
  element: HTMLElement,
) {
  const html = buildStandaloneShareHtml(
    model,
    element.outerHTML,
    collectDocumentCss(),
  );

  downloadBlob(
    new Blob([html], { type: "text/html;charset=utf-8" }),
    createShareExportFilename(model, "html"),
  );
}

export async function exportShareSummaryPng(
  model: ProfileShareSummaryModel,
  element: HTMLElement,
) {
  const canvas = await renderShareElementToCanvas(element);
  const blob = await canvasToBlob(canvas, "image/png");

  downloadBlob(blob, createShareExportFilename(model, "png"));
}

export async function exportShareSummaryPdf(
  model: ProfileShareSummaryModel,
  element: HTMLElement,
) {
  const canvas = await renderShareElementToCanvas(element);
  const pages = await pdfPagesFromCanvas(canvas, element);
  const pdf = buildPdfFromJpegPages(pages);

  const pdfBuffer = pdf.buffer.slice(
    pdf.byteOffset,
    pdf.byteOffset + pdf.byteLength,
  ) as ArrayBuffer;

  downloadBlob(
    new Blob([pdfBuffer], { type: "application/pdf" }),
    createShareExportFilename(model, "pdf"),
  );
}
