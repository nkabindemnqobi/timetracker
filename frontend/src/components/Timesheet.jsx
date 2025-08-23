import { useState, useEffect, useMemo } from 'react'
import { Text, Modal } from '../libs/index.js'
import { API_URLS } from '../constants/urls.js'
import {
  calculateWeekData,
  calculateNewWeekData,
  calculateDailyTotals,
  calculateWeekTotal,
  getDayDate,
  getCellData,
  transformTimesheetByType,
  getCellDataByType
} from '../utils/timesheetUtils.js'
import {
  StyledTimesheetContainer,
  StyledTimesheetHeader,
  StyledTimesheetPeriod,
  StyledWeekNumber,
  StyledWeekNavigation,
  StyledNavButton,
  StyledIcon,
  StyledDateRange,
  StyledDivider,
  StyledDailyTotals,
  StyledTotalsHeader,
  StyledDayTotal,
  StyledDayName,
  StyledDayValue,
  StyledEntryGrid,
  StyledGridHeader,
  StyledHeaderCell,
  StyledDayHeader,
  StyledEntryRow,
  StyledEntryCell,
  StyledSummaryCell,
  StyledIssueKey,
  StyledDayCell,
  StyledDayHours,
  StyledDetailsButton,
  StyledTotalCell,
  StyledTimesheetActions,
  StyledFetchButton,
  StyledDetailEntry,
  StyledDetailSummary,
  StyledDetailTime,
  StyledTypeCell,
  StyledTypeLabel
} from './Timesheet.styles.js'

export const Timesheet = ({ timesheet, selectedWeek, onWeekChange, onFetchTimesheet, onClearTimesheet, loading, credentials }) => {
  const [modalData, setModalData] = useState(null)
  const [weekData, setWeekData] = useState({
    weekNumber: 34,
    startDate: '2025-08-18',
    endDate: '2025-08-24'
  })
  const [dailyTotals, setDailyTotals] = useState({
    Mon: 0.00, Tue: 0.00, Wed: 0.00, Thu: 0.00, Fri: 0.00, Sat: 0.00, Sun: 0.00
  })
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const isFutureWeek = () => {
    const today = new Date()
    const weekStart = new Date(weekData.startDate)
    return weekStart > today
  }
  

  const effectiveTimesheet = useMemo(() => {
    const today = new Date()
    const weekStart = new Date(weekData.startDate)
    const isFuture = weekStart > today
    return isFuture ? { projectName: '', issues: [] } : timesheet
  }, [timesheet, weekData.startDate])
  
  const transformedData = transformTimesheetByType(effectiveTimesheet)
  
  const getEmptyStateMessage = () => {
    if (loading) return 'Loading timesheet data...'
    
    const today = new Date()
    const weekStart = new Date(weekData.startDate)
    const weekEnd = new Date(weekData.endDate)
    weekEnd.setHours(23, 59, 59, 999)
    
    if (weekStart > today) {
      return 'Future week - No timesheet data available yet'
    } else if (weekEnd < today) {
      return 'No work logged during this week'
    } else {
      return 'No timesheet data available for this week'
    }
  }



  useEffect(() => {
    const newWeekData = calculateWeekData(selectedWeek)
    if (newWeekData) setWeekData(newWeekData)
  }, [selectedWeek])

  useEffect(() => {
    const totals = calculateDailyTotals(effectiveTimesheet, daysOfWeek)
    setDailyTotals(totals)
  }, [effectiveTimesheet])

  const handleWeekChange = (direction) => {
    const currentDate = new Date(weekData.startDate)
    const newWeekData = calculateNewWeekData(currentDate, direction)
    

    onClearTimesheet()
    
    setWeekData(newWeekData)

    fetchWeekData(newWeekData.startDate, newWeekData.endDate)
  }

  const fetchWeekData = async (startDate, endDate) => {
    if (!credentials.domain || !credentials.email || !credentials.apiToken) return
    

    const today = new Date()
    const weekStart = new Date(startDate)
    
    if (weekStart > today) {
      console.log('Skipping API call for future week:', startDate)
      return
    }
    
    const weekString = `${startDate}_${endDate}`
    onFetchTimesheet(weekString)
  }

  const getFetchButtonText = () => {
    if (loading) return 'Loading...'
    if (isFutureWeek()) return 'Future week - No data to fetch'
    return 'Fetch from Jira'
  }

  const handleCellClick = (typeRow, dayName) => {
    const { total, entries } = getCellDataByType(typeRow, dayName, typeRow.type)
    if (total === 0) return
    
    setModalData({
      title: `${typeRow.type.toUpperCase()} - ${dayName} (${getDayDate(dayName, weekData.startDate)}) - ${total.toFixed(2)}h`,
      entries: entries.map(entry => ({ 
        ...entry, 
        issueKey: entry.issueKey || 'Unknown'
      }))
    })
  }

  return (
    <>
      <Modal isOpen={!!modalData} onClose={() => setModalData(null)} title={modalData?.title}>
        {modalData?.entries?.map((entry, idx) => (
          <StyledDetailEntry key={idx}>
            <StyledDetailSummary>{entry.issueKey}: {entry.summary}</StyledDetailSummary>
            <StyledDetailTime>{entry.time.toFixed(2)}h</StyledDetailTime>
          </StyledDetailEntry>
        ))}
      </Modal>
      <StyledTimesheetContainer>
        <StyledTimesheetHeader>
          <StyledTimesheetPeriod>
            <Text variant="body" size="medium">Timesheet Period (</Text>
            <StyledWeekNumber>Week {weekData.weekNumber}</StyledWeekNumber>
            <Text variant="body" size="medium">)</Text>
          </StyledTimesheetPeriod>
          <StyledWeekNavigation>
            <StyledNavButton><StyledIcon>📅</StyledIcon></StyledNavButton>
            <StyledNavButton onClick={() => handleWeekChange('prev')}><StyledIcon>←</StyledIcon></StyledNavButton>
            <StyledDateRange>{weekData.startDate} - {weekData.endDate}</StyledDateRange>
            <StyledNavButton onClick={() => handleWeekChange('next')}><StyledIcon>→</StyledIcon></StyledNavButton>
          </StyledWeekNavigation>
        </StyledTimesheetHeader>
        <StyledDivider />
        <StyledDailyTotals>
          <StyledTotalsHeader>
            <StyledDayTotal>
              <StyledDayName>Project</StyledDayName>
              <StyledDayValue>Daily Totals</StyledDayValue>
            </StyledDayTotal>
            <StyledDayTotal>
              <StyledDayName>Type</StyledDayName>
              <StyledDayValue>-</StyledDayValue>
            </StyledDayTotal>
          {daysOfWeek.map(day => (
              <StyledDayTotal key={day}>
                <StyledDayName>{day}</StyledDayName>
                <StyledDayValue>{dailyTotals[day].toFixed(2)}h</StyledDayValue>
              </StyledDayTotal>
            ))}
            <StyledDayTotal>
              <StyledDayName>Total</StyledDayName>
              <StyledDayValue>{calculateWeekTotal(dailyTotals).toFixed(2)}h</StyledDayValue>
            </StyledDayTotal>
          </StyledTotalsHeader>
        </StyledDailyTotals>
        <StyledEntryGrid>
          <StyledGridHeader>
            <StyledHeaderCell>Project</StyledHeaderCell>
            <StyledHeaderCell>Type</StyledHeaderCell>
          {daysOfWeek.map(day => (
              <StyledDayHeader key={day}>
                <Text>{day}</Text>
                <Text>{getDayDate(day, weekData.startDate)}</Text>
              </StyledDayHeader>
            ))}
            <StyledHeaderCell>Total</StyledHeaderCell>
          </StyledGridHeader>
          {transformedData.issues && transformedData.issues.length > 0 ? (
            transformedData.issues.map((typeRow, index) => (
              <StyledEntryRow key={typeRow.key}>
                <StyledSummaryCell><StyledIssueKey>{transformedData.projectName}</StyledIssueKey></StyledSummaryCell>
                <StyledTypeCell><StyledTypeLabel>{typeRow.type.toUpperCase()}</StyledTypeLabel></StyledTypeCell>
                {daysOfWeek.map(day => {
                  const { total, entries } = getCellDataByType(typeRow, day, typeRow.type)
                  return (
                    <StyledDayCell key={day}>
                      {total > 0 ? (
                        <>
                          <StyledDayHours>{total.toFixed(2)}h</StyledDayHours>
                          <StyledDetailsButton onClick={(e) => { e.stopPropagation(); handleCellClick(typeRow, day) }} title="Click to see details">📋 Details</StyledDetailsButton>
                        </>
                      ) : (
                        <StyledDayHours>-</StyledDayHours>
                      )}
                    </StyledDayCell>
                  )
                })}
                <StyledTotalCell>{typeRow.timeInProgress.toFixed(2)}h</StyledTotalCell>
              </StyledEntryRow>
            ))
          ) : (
            <StyledEntryRow>
              <StyledSummaryCell>
                <Text variant="body" size="medium">{getEmptyStateMessage()}</Text>
              </StyledSummaryCell>
            </StyledEntryRow>
          )}
        </StyledEntryGrid>
        <StyledTimesheetActions>
          <StyledFetchButton 
            onClick={() => fetchWeekData(weekData.startDate, weekData.endDate)} 
            disabled={loading || isFutureWeek()}
          >
            {getFetchButtonText()}
          </StyledFetchButton>
        </StyledTimesheetActions>
      </StyledTimesheetContainer>
    </>
  )
}
