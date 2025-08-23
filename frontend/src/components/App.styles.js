import styled from 'styled-components'
import { 
  StyledMain, 
  StyledHeader, 
  StyledSection, 
  StyledArticle, 
  StyledForm, 
  StyledButton,
  responsivePadding,
  responsiveFontSize
} from '../libs/StyledComponents.jsx'
import { COLORS } from '../libs/colors.js'

export const StyledAppMain = styled(StyledMain)`
  min-height: 100vh;
  background-color: ${COLORS.BACKGROUND.PRIMARY};
  padding: ${responsivePadding(16, 24)};
`

export const StyledAppHeader = styled(StyledHeader)`
  background-color: ${COLORS.NEUTRAL.WHITE};
  border-bottom: 1px solid ${COLORS.BORDER.LIGHT};
  padding: ${responsivePadding(12, 24)};
  margin-bottom: ${responsivePadding(16, 24)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${responsivePadding(8, 16)};
`

export const StyledHeaderSection = styled(StyledSection)`
  display: flex;
  align-items: center;
  gap: ${responsivePadding(8, 16)};
  flex-wrap: wrap;
`

export const StyledAppSection = styled(StyledSection)`
  margin-bottom: ${responsivePadding(16, 24)};
`

export const StyledAppArticle = styled(StyledArticle)`
  background-color: ${COLORS.NEUTRAL.WHITE};
  border-radius: 8px;
  padding: ${responsivePadding(16, 24)};
  box-shadow: ${COLORS.SHADOW.SMALL};
`

export const StyledAppForm = styled(StyledForm)`
  display: flex;
  flex-direction: column;
  gap: ${responsivePadding(12, 16)};
`

export const StyledLogoutButton = styled(StyledButton)`
  padding: ${responsivePadding(6, 16)};
  border: 1px solid ${COLORS.BORDER.MEDIUM};
  border-radius: 6px;
  background-color: ${COLORS.NEUTRAL.WHITE};
  color: ${COLORS.TEXT.SECONDARY};
  font-weight: 500;
  font-size: ${responsiveFontSize(12, 14)};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: ${COLORS.BACKGROUND.GRAY_100};
  }
`
