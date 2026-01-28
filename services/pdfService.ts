
// We will use a script injection for html2pdf.js as it's the most robust for React to PDF conversion
export const generatePDFReport = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Use dynamic script loading for html2pdf if not already present
  if (!(window as any).html2pdf) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    document.head.appendChild(script);
    await new Promise((resolve) => script.onload = resolve);
  }

  const opt = {
    margin: [0, 0],
    filename: filename,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const html2pdf = (window as any).html2pdf;
  await html2pdf().set(opt).from(element).save();
};
