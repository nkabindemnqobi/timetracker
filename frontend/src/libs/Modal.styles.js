import styled from 'styled-components'
import { 
  StyledSection, 
  StyledButton,
  StyledHeading,
  responsivePadding,
  responsiveFontSize,
  responsiveWidth
} from './StyledComponents.jsx'
import { COLORS } from './colors.js'

export const StyledModalBackdrop = styled(StyledSection)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${COLORS.MODAL.BACKDROP};
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${responsivePadding(8, 16)};
  pointer-events: auto;
  position: fixed !important;
`

export const StyledModal = styled(StyledSection)`
  background: ${COLORS.NEUTRAL.WHITE};
  border-radius: 8px;
  box-shadow: ${COLORS.MODAL.SHADOW};
  max-width: ${responsiveWidth(300, 500)};
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1000000;
  position: relative;
  margin: auto;
  pointer-events: auto;
  position: relative !important;
`

export const StyledModalHeader = styled(StyledSection)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${responsivePadding(8, 12)};
  border-bottom: 1px solid ${COLORS.BORDER.LIGHT};
`

export const StyledModalTitle = styled(StyledHeading)`
  margin: 0;
  font-size: ${responsiveFontSize(16, 20)};
  font-weight: 600;
  color: ${COLORS.TEXT.PRIMARY};
  line-height: 1.2;
`

export const StyledModalClose = styled(StyledButton)`
  background: none;
  border: none;
  font-size: ${responsiveFontSize(18, 24)};
  cursor: pointer;
  color: ${COLORS.TEXT.TERTIARY};
  padding: ${responsivePadding(4, 8)};
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: ${COLORS.BACKGROUND.GRAY_100};
    color: ${COLORS.TEXT.SECONDARY};
  }
`

export const StyledModalContent = styled(StyledSection)`
  padding: ${responsivePadding(8, 12)};
  overflow-y: auto;
  flex: 1;
`
