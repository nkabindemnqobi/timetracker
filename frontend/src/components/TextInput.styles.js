import styled from 'styled-components'
import { 
  StyledFieldset, 
  StyledLegend, 
  StyledInput, 
  StyledParagraph,
  responsivePadding,
  responsiveFontSize
} from '../libs/StyledComponents.jsx'
import { COLORS } from '../libs/colors.js'

export const StyledTextInputFieldset = styled(StyledFieldset)`
  border: none;
  padding: 0;
  margin: 0;
`

export const StyledTextInputLegend = styled(StyledLegend)`
  font-weight: 500;
  color: ${COLORS.TEXT.SECONDARY};
  margin-bottom: ${responsivePadding(4, 8)};
  font-size: ${responsiveFontSize(12, 14)};
`

export const StyledTextInputInput = styled(StyledInput)`
  width: 100%;
  padding: ${responsivePadding(8, 12)};
  border: 1px solid ${COLORS.BORDER.MEDIUM};
  border-radius: 6px;
  font-size: ${responsiveFontSize(14, 16)};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLORS.FOCUS.BLUE};
    box-shadow: 0 0 0 3px ${COLORS.FOCUS.BLUE_LIGHT};
  }

  &::placeholder {
    color: ${COLORS.TEXT.MUTED};
  }
`

export const StyledTextInputParagraph = styled(StyledParagraph)`
  margin: ${responsivePadding(4, 8)} 0 0 0;
  font-size: ${responsiveFontSize(12, 14)};
  color: ${COLORS.TEXT.TERTIARY};
`
