export const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
}

export const getDayDate = (dayName, startDate) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const startDateObj = new Date(startDate)
  const dayIndex = daysOfWeek.indexOf(dayName)
  const dayDate = new Date(startDateObj)
  dayDate.setDate(startDateObj.getDate() + dayIndex)
  return formatDate(dayDate)
}

export const calculateWeekTotal = (dailyTotals) => {
  return Object.values(dailyTotals).reduce((sum, total) => sum + total, 0)
}

export const getDayTotal = (dayName, timesheet) => {
  if (!timesheet) return 0
  let total = 0
  timesheet.forEach(item => {
    if (item.dailyHours && Array.isArray(item.dailyHours[dayName])) {
      item.dailyHours[dayName].forEach(entry => {
        total += entry.time || 0
      })
    }
  })
  return total
}

export const getCellData = (issue, dayName) => {
  if (!issue.dailyHours || !Array.isArray(issue.dailyHours[dayName])) {
    return { total: 0, entries: [] }
  }
  
  const entries = issue.dailyHours[dayName]
  const total = entries.reduce((sum, entry) => sum + (entry.time || 0), 0)
  
  return { total, entries }
}

export const calculateDailyTotals = (timesheetData, daysOfWeek) => {
  if (!timesheetData || !timesheetData.issues || timesheetData.issues.length === 0) {
    return {
      Mon: 0.00,
      Tue: 0.00,
      Wed: 0.00,
      Thu: 0.00,
      Fri: 0.00,
      Sat: 0.00,
      Sun: 0.00
    }
  }

  const totals = {
    Mon: 0.00,
    Tue: 0.00,
    Wed: 0.00,
    Thu: 0.00,
    Fri: 0.00,
    Sat: 0.00,
    Sun: 0.00
  }

  timesheetData.issues.forEach(item => {
    if (item.dailyHours) {
      daysOfWeek.forEach(day => {
        if (Array.isArray(item.dailyHours[day])) {
          item.dailyHours[day].forEach(entry => {
            totals[day] += entry.time || 0
          })
        }
      })
    }
  })

  return totals
}

export const calculateWeekData = (selectedWeek) => {
  if (!selectedWeek) return null
  
  const [startDate, endDate] = selectedWeek.split('_')
  const startDateObj = new Date(startDate)
  const weekNumber = getWeekNumber(startDateObj)
  
  return {
    weekNumber,
    startDate,
    endDate
  }
}

export const calculateNewWeekData = (currentDate, direction) => {
  let newDate
  
  if (direction === 'prev') {
    newDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else {
    newDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
  
  const startOfWeek = new Date(newDate)
  startOfWeek.setDate(newDate.getDate() - newDate.getDay())
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return {
    weekNumber: getWeekNumber(startOfWeek),
    startDate: startOfWeek.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0]
  }
}

export const transformTimesheetByType = (timesheetData) => {
  if (!timesheetData || !timesheetData.issues || timesheetData.issues.length === 0) return { projectName: '', issues: [] }
  
  const typeGroups = {}
  const allIssueKeys = []
  

  timesheetData.issues.forEach(issue => {
    allIssueKeys.push(issue.key)
  })
  

  timesheetData.issues.forEach(issue => {
    Object.keys(issue.dailyHours).forEach(day => {
      const entries = issue.dailyHours[day] || []
      
      entries.forEach(entry => {
        const type = entry.type || 'dev'
        if (!typeGroups[type]) {
          typeGroups[type] = {
            Mon: [],
            Tue: [],
            Wed: [],
            Thu: [],
            Fri: [],
            Sat: [],
            Sun: [],
            issueKeys: new Set()
          }
        }
        typeGroups[type][day].push({ ...entry, issueKey: issue.key })
        typeGroups[type].issueKeys.add(issue.key)
      })
    })
  })
  

  if (Object.keys(typeGroups).length === 0) {
    typeGroups['dev'] = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
      issueKeys: new Set(allIssueKeys)
    }
  }
  

  const transformed = Object.keys(typeGroups).map(type => {
    const group = typeGroups[type]
    const dailyHours = {
      Mon: group.Mon,
      Tue: group.Tue,
      Wed: group.Wed,
      Thu: group.Thu,
      Fri: group.Fri,
      Sat: group.Sat,
      Sun: group.Sun
    }
    
    const totalTime = Object.values(dailyHours).reduce((sum, entries) => {
      return sum + entries.reduce((daySum, entry) => daySum + (entry.time || 0), 0)
    }, 0)
    
    return {
      key: `${type}-combined`,
      type: type,
      timeInProgress: totalTime,
      dailyHours: dailyHours,
      issueKeys: Array.from(group.issueKeys),
      updated: new Date().toISOString()
    }
  })
  
  return {
    projectName: timesheetData.projectName || 'Unknown Project',
    issues: transformed
  }
}

export const getCellDataByType = (issue, dayName, type) => {
  if (!issue.dailyHours || !Array.isArray(issue.dailyHours[dayName])) {
    return { total: 0, entries: [] }
  }
  
  const entries = issue.dailyHours[dayName].filter(entry => entry.type === type)
  const total = entries.reduce((sum, entry) => sum + (entry.time || 0), 0)
  
  return { total, entries }
}
