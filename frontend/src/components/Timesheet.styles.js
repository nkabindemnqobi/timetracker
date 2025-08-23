import styled from 'styled-components'
import { 
  StyledSection, 
  StyledHeader, 
  StyledParagraph, 
  StyledButton, 
  StyledHr, 
  StyledContainer,
  responsivePadding,
  responsiveFontSize,
  responsiveWidth,
  responsiveMargin,
  responsiveHeight
} from '../libs/StyledComponents.jsx'
import { COLORS } from '../libs/colors.js'

export const StyledTimesheetContainer = styled(StyledContainer)`
  max-width: ${responsiveWidth(800, 1200)};
  margin: 0 auto;
  padding: ${responsivePadding(10, 20)};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

export const StyledTimesheetHeader = styled(StyledHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${responsiveMargin(16, 20)};
  flex-wrap: wrap;
  gap: ${responsivePadding(8, 12)};
`

export const StyledTimesheetPeriod = styled(StyledSection)`
  font-size: ${responsiveFontSize(14, 18)};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
`

export const StyledWeekNumber = styled(StyledParagraph)`
  color: ${COLORS.PRIMARY.GREEN};
  font-weight: 600;
  margin: 0;
`

export const StyledWeekNavigation = styled(StyledSection)`
  display: flex;
  align-items: center;
  gap: ${responsivePadding(8, 10)};
  flex-wrap: wrap;
`

export const StyledNavButton = styled(StyledButton)`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${responsivePadding(4, 5)};
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${COLORS.BACKGROUND.GRAY_100};
  }
`

export const StyledIcon = styled(StyledParagraph)`
  color: ${COLORS.PRIMARY.RED};
  font-size: ${responsiveFontSize(14, 16)};
  margin: 0;
`

export const StyledDateRange = styled(StyledParagraph)`
  color: ${COLORS.PRIMARY.RED};
  font-weight: 500;
  margin: 0 ${responsiveMargin(8, 10)};
`

export const StyledDivider = styled(StyledHr)`
  border: none;
  height: 1px;
  background-color: ${COLORS.BORDER.LIGHT};
  margin: ${responsiveMargin(16, 20)} 0;
`

export const StyledDailyTotals = styled(StyledSection)`
  margin-bottom: ${responsiveMargin(16, 20)};
`

export const StyledTotalsHeader = styled(StyledSection)`
  display: grid;
  grid-template-columns: 2fr 1fr repeat(7, 1fr) 1fr;
  gap: 1px;
  background-color: ${COLORS.BORDER.LIGHT};
  border-radius: 6px;
  overflow: hidden;
`

export const StyledDayTotal = styled(StyledSection)`
  background-color: ${COLORS.NEUTRAL.WHITE};
  padding: ${responsivePadding(6, 8)} ${responsivePadding(4, 6)};
  text-align: center;
  border-right: 1px solid ${COLORS.BORDER.LIGHT};

  &:last-child {
    border-right: none;
  }
`

export const StyledDayName = styled(StyledParagraph)`
  color: ${COLORS.PRIMARY.RED};
  font-weight: 600;
  font-size: ${responsiveFontSize(12, 14)};
  margin: 0 0 ${responsiveMargin(4, 5)} 0;
`

export const StyledDayValue = styled(StyledParagraph)`
  font-size: ${responsiveFontSize(14, 16)};
  font-weight: 500;
  color: ${COLORS.TEXT.SECONDARY};
  margin: 0;
`

export const StyledEntryGrid = styled(StyledSection)`
  border: 1px solid ${COLORS.BORDER.LIGHT};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: ${responsiveMargin(16, 20)};
`

export const StyledGridHeader = styled(StyledSection)`
  display: grid;
  grid-template-columns: 2fr 1fr repeat(7, 1fr) 1fr;
  background-color: ${COLORS.BACKGROUND.GRAY_50};
  border-bottom: 1px solid ${COLORS.BORDER.LIGHT};
`

export const StyledHeaderCell = styled(StyledSection)`
  padding: ${responsivePadding(6, 8)} ${responsivePadding(4, 6)};
  font-weight: 600;
  font-size: ${responsiveFontSize(12, 14)};
  color: ${COLORS.TEXT.SECONDARY};
  border-right: 1px solid ${COLORS.BORDER.LIGHT};
  display: flex;
  align-items: center;
  justify-content: center;

  &:last-child {
    border-right: none;
  }
`

export const StyledDayHeader = styled(StyledHeaderCell)`
  flex-direction: column;
  gap: 2px;
  font-size: ${responsiveFontSize(10, 12)};
`

export const StyledEntryRow = styled(StyledSection)`
  display: grid;
  grid-template-columns: 2fr 1fr repeat(7, 1fr) 1fr;
  background-color: ${COLORS.BACKGROUND.TERTIARY};
  border-bottom: 1px solid ${COLORS.BORDER.LIGHT};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${COLORS.BACKGROUND.HOVER};
  }
`

export const StyledEntryCell = styled(StyledSection)`
  padding: ${responsivePadding(4, 6)} ${responsivePadding(4, 6)};
  border-right: 1px solid ${COLORS.BORDER.LIGHT};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${responsiveHeight(40, 50)};
  position: relative;

  &:last-child {
    border-right: none;
  }
`

export const StyledSummaryCell = styled(StyledEntryCell)`
  font-weight: 600;
  color: ${COLORS.TEXT.SECONDARY};
  background-color: ${COLORS.BACKGROUND.GRAY_100};
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
`

export const StyledIssueKey = styled(StyledParagraph)`
  font-weight: 700;
  color: ${COLORS.PRIMARY.BLUE};
  font-size: ${responsiveFontSize(12, 14)};
  margin: 0;
`

export const StyledDayCell = styled(StyledEntryCell)`
  flex-direction: column;
  gap: 2px;
  padding: ${responsivePadding(2, 4)};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${COLORS.BORDER.LIGHT};
  }
`

export const StyledDayHours = styled(StyledParagraph)`
  font-size: ${responsiveFontSize(14, 16)};
  font-weight: 600;
  color: ${COLORS.TEXT.SECONDARY};
  margin: 0;
`

export const StyledDetailsButton = styled(StyledButton)`
  background: ${COLORS.PRIMARY.BLUE};
  border: none;
  cursor: pointer;
  padding: ${responsivePadding(3, 4)} ${responsivePadding(6, 8)};
  border-radius: 4px;
  font-size: ${responsiveFontSize(10, 11)};
  transition: background-color 0.2s;
  color: ${COLORS.TEXT.INVERSE};
  font-weight: 500;

  &:hover {
    background-color: ${COLORS.PRIMARY.BLUE_DARK};
    color: ${COLORS.TEXT.INVERSE};
  }
`

export const StyledTotalCell = styled(StyledEntryCell)`
  font-weight: 600;
  color: ${COLORS.TEXT.SECONDARY};
  background-color: ${COLORS.BACKGROUND.GRAY_100};
  font-size: ${responsiveFontSize(14, 16)};
`

export const StyledTimesheetActions = styled(StyledSection)`
  display: flex;
  gap: ${responsivePadding(8, 12)};
  justify-content: flex-end;
  margin-top: ${responsiveMargin(16, 20)};
  flex-wrap: wrap;
`

export const StyledFetchButton = styled(StyledButton)`
  padding: ${responsivePadding(8, 10)} ${responsivePadding(16, 20)};
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${COLORS.PRIMARY.BLUE};
  color: ${COLORS.TEXT.INVERSE};
  font-size: ${responsiveFontSize(12, 14)};

  &:hover:not(:disabled) {
    background-color: ${COLORS.PRIMARY.BLUE_DARK};
  }

  &:disabled {
    background-color: ${COLORS.TEXT.MUTED};
    cursor: not-allowed;
  }
`

export const StyledDetailEntry = styled(StyledSection)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  padding: 4px 0;
  border-bottom: 1px solid ${COLORS.BACKGROUND.GRAY_100};

  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`

export const StyledDetailSummary = styled(StyledParagraph)`
  font-size: ${responsiveFontSize(11, 12)};
  color: ${COLORS.TEXT.SECONDARY};
  line-height: 1.3;
  font-weight: 500;
  flex: 1;
  margin: 0 8px 0 0;
`

export const StyledDetailTime = styled(StyledParagraph)`
  font-size: ${responsiveFontSize(10, 11)};
  color: ${COLORS.TEXT.TERTIARY};
  font-weight: 500;
  white-space: nowrap;
  margin: 0;
`

export const StyledTypeCell = styled(StyledEntryCell)`
  font-weight: 600;
  color: ${COLORS.TEXT.SECONDARY};
  background-color: ${COLORS.BACKGROUND.GRAY_100};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`

export const StyledTypeLabel = styled(StyledParagraph)`
  font-weight: 700;
  color: ${COLORS.PRIMARY.BLUE};
  font-size: ${responsiveFontSize(10, 12)};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`
