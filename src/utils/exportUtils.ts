import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export async function exportPDF(element: HTMLElement, filename: string = 'cv.pdf') {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();   // 210 mm
  const pageH = pdf.internal.pageSize.getHeight();  // 297 mm

  // Map canvas width → page width; compute total rendered height in mm
  const imgW = pageW;
  const imgH = (canvas.height * pageW) / canvas.width;

  let yMm = 0;
  let pageIndex = 0;

  while (yMm < imgH) {
    const sliceHmm = Math.min(pageH, imgH - yMm);
    // Convert mm slice bounds back to canvas pixels
    const srcY = Math.round((yMm / imgH) * canvas.height);
    const srcH = Math.round((sliceHmm / imgH) * canvas.height);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = srcH;
    const ctx = sliceCanvas.getContext('2d');
    ctx?.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, sliceHmm);

    yMm += pageH;
    pageIndex++;
  }

  pdf.save(filename);
}

export function exportHTML(html: string, filename: string = 'cv.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, filename);
}
