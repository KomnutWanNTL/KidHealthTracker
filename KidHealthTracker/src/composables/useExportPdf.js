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
    const usableWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height * usableWidth) / canvas.width

    if (imgHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight)
    } else {
      let position = margin
      let heightLeft = imgHeight
      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight)
        heightLeft -= pageHeight - margin * 2
      }
    }

    pdf.save(`kidhealth-${yearMonth}.pdf`)
  }

  return { exportCalendar }
}
