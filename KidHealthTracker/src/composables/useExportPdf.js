import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export function useExportPdf() {
  async function exportCalendar(element, yearMonth) {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pageWidth - margin * 2
    const maxHeight = pageHeight - margin * 2

    let imgWidth = maxWidth
    let imgHeight = (canvas.height * maxWidth) / canvas.width

    if (imgHeight > maxHeight) {
      const ratio = maxHeight / imgHeight
      imgHeight = maxHeight
      imgWidth = maxWidth * ratio
    }

    const xOffset = margin + (maxWidth - imgWidth) / 2
    pdf.addImage(imgData, 'PNG', xOffset, margin, imgWidth, imgHeight)

    pdf.save(`kidhealth-${yearMonth}.pdf`)
  }

  return { exportCalendar }
}
