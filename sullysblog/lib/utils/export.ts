// CSV Export
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return

  // Use provided headers or generate from first item keys
  const headerConfig = headers || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }))

  // Build CSV content
  const headerRow = headerConfig.map(h => `"${h.label}"`).join(',')
  const dataRows = data.map(row =>
    headerConfig.map(h => {
      const value = row[h.key]
      // Escape quotes and wrap in quotes
      const stringValue = String(value ?? '')
      return `"${stringValue.replace(/"/g, '""')}"`
    }).join(',')
  )

  const csv = [headerRow, ...dataRows].join('\n')

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// PDF Export using browser print
export function exportToPDF(
  title: string,
  tableId: string,
  dateRange: { start: string; end: string }
) {
  const table = document.getElementById(tableId)
  if (!table) return

  // Create print-friendly content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .date-range {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        .totals-row {
          font-weight: bold;
          background-color: #f0f0f0 !important;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="date-range">Report Period: ${dateRange.start} to ${dateRange.end}</div>
      ${table.outerHTML}
    </body>
    </html>
  `

  // Open print window
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}
