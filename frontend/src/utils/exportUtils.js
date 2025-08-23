export const exportToCSV = (timesheetData, weekData) => {
  if (!timesheetData || !timesheetData.issues || timesheetData.issues.length === 0) {
    alert('No data to export')
    return
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  const headers = [
    'Project',
    'Type',
    'Mon',
    'Tue', 
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
    'Total Hours'
  ]

  const escapeCSVField = (field) => {
    if (field === null || field === undefined) return ''
    const stringField = String(field)
    if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`
    }
    return stringField
  }

  const csvRows = [headers.map(escapeCSVField).join(';')]

  timesheetData.issues.forEach(issue => {
    const row = [
      escapeCSVField(timesheetData.projectName || 'Unknown Project'),
      escapeCSVField(issue.type?.toUpperCase() || 'DEV'),
      ...daysOfWeek.map(day => {
        const entries = issue.dailyHours[day] || []
        const total = entries.reduce((sum, entry) => sum + (entry.time || 0), 0)
        return escapeCSVField(total.toFixed(2))
      }),
      escapeCSVField(issue.timeInProgress.toFixed(2))
    ]
    csvRows.push(row.join(';'))
  })

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const fileName = `timesheet_${weekData.startDate}_${weekData.endDate}.csv`
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  
  URL.revokeObjectURL(link.href)
}
