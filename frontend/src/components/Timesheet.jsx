import { useState, useEffect, useMemo } from 'react'
import { Text, Modal, Button } from '../libs/index.js'
import { API_URLS } from '../constants/urls.js'
import { exportToCSV } from '../utils/exportUtils.js'
import { COLORS } from '../libs/colors.js'
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
  StyledExportButton,
  StyledDetailEntry,
  StyledDetailSummary,
  StyledDetailTime,
  StyledTypeCell,
  StyledTypeLabel,
  StyledEditInput,
  StyledModalEditInput,
  StyledModalActions,
  StyledModalActionButton,
  StyledWeeklySummary,
  StyledSummaryHeader,
  StyledSummaryIcon,
  StyledSummaryTitle,
  StyledSummaryContent,
  StyledNoSummary
} from './Timesheet.styles.js'

export const Timesheet = ({ timesheet, selectedWeek, onWeekChange, onFetchTimesheet, onClearTimesheet, onUpdateTimesheet, loading, credentials }) => {
  const [modalData, setModalData] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editingEntries, setEditingEntries] = useState({})
  const [originalEntries, setOriginalEntries] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [weekData, setWeekData] = useState({
    weekNumber: 34,
    startDate: '2025-08-18',
    endDate: '2025-08-24'
  })
  const [dailyTotals, setDailyTotals] = useState({
    Mon: 0.00, Tue: 0.00, Wed: 0.00, Thu: 0.00, Fri: 0.00, Sat: 0.00, Sun: 0.00
  })
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const formatSummaryText = (text) => {
    if (!text) return ''
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
  }

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

  const handleExport = () => {
    exportToCSV(transformedData, weekData)
  }

  const handleCellClick = (typeRow, dayName) => {
    const { total, entries } = getCellDataByType(typeRow, dayName, typeRow.type)
    if (total === 0) return
    
    // Store original entries for comparison
    const originalEntriesMap = {}
    entries.forEach((entry, idx) => {
      originalEntriesMap[idx] = entry.time
    })
    setOriginalEntries(originalEntriesMap)
    setEditingEntries({})
    setHasUnsavedChanges(false)
    
    setModalData({
      title: `${typeRow.type.toUpperCase()} - ${dayName} (${getDayDate(dayName, weekData.startDate)}) - ${total.toFixed(2)}h`,
      typeRow,
      dayName,
      entries: entries.map(entry => ({ 
        ...entry, 
        issueKey: entry.issueKey || 'Unknown'
      })),
      originalTotal: total
    })
  }

  const handleCellEdit = (typeRow, dayName, currentValue) => {
    setEditingCell({ typeRow, dayName })
    setEditValue(currentValue > 0 ? currentValue.toFixed(2) : '')
  }

  const handleEditSave = () => {
    if (!editingCell) return
    
    const { typeRow, dayName } = editingCell
    const newValue = parseFloat(editValue) || 0
    
    console.log(`Updating ${typeRow.type} ${dayName} to ${newValue}h`)
    
    setEditingCell(null)
    setEditValue('')
  }

  const handleEditCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const handleEntryEdit = (entryIndex, newValue) => {
    setEditingEntries(prev => {
      const updated = {
        ...prev,
        [entryIndex]: newValue
      }
      
      // Check if there are unsaved changes
      const hasChanges = Object.keys(updated).some(idx => {
        const editedValue = parseFloat(updated[idx]) || 0
        const origValue = originalEntries[idx] || 0
        return Math.abs(editedValue - origValue) > 0.01
      })
      
      setHasUnsavedChanges(hasChanges)
      
      // Update modal title with current total
      if (modalData && modalData.entries) {
        const currentTotal = modalData.entries.reduce((sum, entry, idx) => {
          const entryTime = updated[idx] !== undefined ? parseFloat(updated[idx]) || 0 : entry.time
          return sum + entryTime
        }, 0)
        
        setModalData(prev => ({
          ...prev,
          title: `${prev.typeRow.type.toUpperCase()} - ${prev.dayName} (${getDayDate(prev.dayName, weekData.startDate)}) - ${currentTotal.toFixed(2)}h`
        }))
      }
      
      return updated
    })
  }

  const handleEntrySave = () => {
    // Validate all edited entries
    const invalidEntries = Object.keys(editingEntries).filter(entryIndex => {
      const value = parseFloat(editingEntries[entryIndex])
      return isNaN(value) || value < 0
    })
    
    if (invalidEntries.length > 0) {
      alert('Please enter valid time values (numbers >= 0) for all entries.')
      return
    }
    
    // Save all edited entries
    Object.keys(editingEntries).forEach(entryIndex => {
      const newValue = parseFloat(editingEntries[entryIndex]) || 0
      console.log(`Updating entry ${entryIndex} to ${newValue}h`)
      
      if (modalData && modalData.entries && modalData.entries[entryIndex]) {
        const updatedEntries = [...modalData.entries]
        const updatedEntry = {
          ...updatedEntries[entryIndex],
          time: newValue
        }
        updatedEntries[entryIndex] = updatedEntry
        
        setModalData({
          ...modalData,
          entries: updatedEntries
        })
        
        if (onUpdateTimesheet) {
          const { typeRow, dayName } = modalData
          const entry = modalData.entries[entryIndex]
          onUpdateTimesheet(typeRow, dayName, parseInt(entryIndex), newValue, entry.issueKey, entry.summary)
        }
      }
    })
    
    // Clear editing state
    setEditingEntries({})
    setOriginalEntries({})
    setHasUnsavedChanges(false)
  }

  const handleEntryCancel = () => {
    // Discard all changes
    setEditingEntries({})
    setOriginalEntries({})
    setHasUnsavedChanges(false)
  }

  const handleEntryKeyDown = (e, entryIndex) => {
    if (e.key === 'Enter') {
      // Don't save on Enter anymore - let user use Save button
      e.preventDefault()
    } else if (e.key === 'Escape') {
      handleEntryCancel()
    }
  }

  const handleModalClose = () => {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close without saving?')
      if (!shouldClose) return
    }
    
    setModalData(null)
    setEditingEntries({})
    setOriginalEntries({})
    setHasUnsavedChanges(false)
  }

  return (
    <>
      <Modal isOpen={!!modalData} onClose={handleModalClose} title={modalData?.title}>
        {modalData?.entries?.map((entry, idx) => {
          const isEditing = editingEntries.hasOwnProperty(idx)
          const displayValue = isEditing ? editingEntries[idx] : entry.time.toFixed(2)
          const hasChanges = editingEntries.hasOwnProperty(idx) && 
            Math.abs(parseFloat(editingEntries[idx] || 0) - (originalEntries[idx] || 0)) > 0.01
          
          return (
            <StyledDetailEntry key={idx}>
              <StyledDetailSummary>
                {entry.issueKey}: {entry.summary}
                {hasChanges && <span style={{ color: COLORS.PRIMARY.BLUE, marginLeft: '8px' }}>●</span>}
              </StyledDetailSummary>
              {isEditing ? (
                <StyledModalEditInput
                  value={displayValue}
                  onChange={(e) => handleEntryEdit(idx, e.target.value)}
                  onKeyDown={(e) => handleEntryKeyDown(e, idx)}
                  autoFocus
                  placeholder="0.00"
                />
              ) : (
                <StyledDetailTime 
                  onClick={() => handleEntryEdit(idx, entry.time.toFixed(2))}
                  title="Click to edit"
                >
                  {entry.time.toFixed(2)}h
                </StyledDetailTime>
              )}
            </StyledDetailEntry>
          )
        })}
        {hasUnsavedChanges && (
          <>
            <StyledDetailEntry style={{ borderTop: `1px solid ${COLORS.BORDER.LIGHT}`, paddingTop: '8px', marginTop: '8px' }}>
              <StyledDetailSummary style={{ color: COLORS.PRIMARY.BLUE, fontWeight: '500' }}>
                {Object.keys(editingEntries).filter(idx => 
                  Math.abs(parseFloat(editingEntries[idx] || 0) - (originalEntries[idx] || 0)) > 0.01
                ).length} entries modified
              </StyledDetailSummary>
            </StyledDetailEntry>
            <StyledModalActions>
              <StyledModalActionButton onClick={handleEntryCancel}>
                Cancel
              </StyledModalActionButton>
              <StyledModalActionButton onClick={handleEntrySave} variant="primary">
                Save Changes
              </StyledModalActionButton>
            </StyledModalActions>
          </>
        )}
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
                  const isEditing = editingCell && editingCell.typeRow === typeRow && editingCell.dayName === day
                  
                  return (
                    <StyledDayCell key={day}>
                      {isEditing ? (
                        <StyledEditInput
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={handleEditSave}
                          autoFocus
                          placeholder="0.00"
                        />
                      ) : (
                        <>
                          <StyledDayHours 
                            onClick={() => handleCellEdit(typeRow, day, total)}
                            title="Click to edit"
                          >
                            {total > 0 ? `${total.toFixed(2)}h` : '-'}
                          </StyledDayHours>
                          {total > 0 && (
                            <StyledDetailsButton onClick={(e) => { e.stopPropagation(); handleCellClick(typeRow, day) }} title="Click to see details">📋 Details</StyledDetailsButton>
                          )}
                        </>
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
          <StyledExportButton 
            onClick={handleExport}
            disabled={!transformedData.issues || transformedData.issues.length === 0}
          >
            Export CSV
          </StyledExportButton>
        </StyledTimesheetActions>
        
        {/* Weekly Summary Section */}
        {(transformedData.summary || loading || (transformedData.issues && transformedData.issues.length > 0)) && (
          <StyledWeeklySummary>
            <StyledSummaryHeader>
              <StyledSummaryIcon>📊</StyledSummaryIcon>
              <StyledSummaryTitle>Weekly Summary</StyledSummaryTitle>
            </StyledSummaryHeader>
            {transformedData.summary ? (
              <StyledSummaryContent 
                dangerouslySetInnerHTML={{ 
                  __html: formatSummaryText(transformedData.summary) 
                }}
              />
            ) : (
              <StyledNoSummary>
                {loading ? 'Generating summary...' : 'No summary available for this week'}
              </StyledNoSummary>
            )}
          </StyledWeeklySummary>
        )}
      </StyledTimesheetContainer>
    </>
  )
}
