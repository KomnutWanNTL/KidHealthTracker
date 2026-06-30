import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export function useExportPdf() {
  async function exportCalendar(element, yearMonth) {
    // Temporarily switch to light mode for clean PDF capture
    const html = document.documentElement
    const hadDark = html.classList.contains('dark')
    html.classList.remove('dark')

    const meta = document.querySelector('meta[name="theme-color"]')
    const prevTheme = meta?.content
    if (meta) meta.content = '#F8FAFC'

    try {
      // Capture full element content — explicitly pass scroll dimensions so
      // html2canvas works correctly on iOS PWA (otherwise it only captures
      // the visible viewport, cutting off bottom rows of CalendarGrid + Legend)
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        height: element.scrollHeight,
        width: element.scrollWidth,
        windowHeight: element.scrollHeight,
        windowWidth: element.scrollWidth,
      })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pageWidth - margin * 2
    const maxHeight = pageHeight - margin * 2

    const imgWidth = maxWidth
    const imgHeight = (canvas.height * maxWidth) / canvas.width
    const xOffset = margin + (maxWidth - imgWidth) / 2

    if (imgHeight <= maxHeight) {
      // ── Single page — content fits one A4 page ──
      const yOffset = margin + (maxHeight - imgHeight) / 2
      pdf.addImage(canvas, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
    } else {
      // ── Multi-page — slice canvas into A4-sized chunks ──
      const pxPerPage = (maxHeight / imgHeight) * canvas.height
      let srcY = 0
      let pageNum = 0

      while (srcY < canvas.height) {
        if (pageNum > 0) pdf.addPage()

        const slicePx = Math.min(pxPerPage, canvas.height - srcY)
        const sliceMm = (slicePx / canvas.height) * imgHeight

        // Extract a horizontal slice from the source canvas
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = slicePx
        const ctx = sliceCanvas.getContext('2d')
        ctx.drawImage(canvas, 0, srcY, canvas.width, slicePx, 0, 0, canvas.width, slicePx)

        pdf.addImage(sliceCanvas, 'PNG', xOffset, margin, imgWidth, sliceMm)

        srcY += slicePx
        pageNum++
      }
    }

    pdf.save(`kidhealth-${yearMonth}.pdf`)
    } finally {
      // Restore dark mode if it was active
      if (hadDark) html.classList.add('dark')
      if (meta && prevTheme) meta.content = prevTheme
    }
  }

  return { exportCalendar }
}
