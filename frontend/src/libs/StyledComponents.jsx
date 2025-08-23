import styled from 'styled-components'

export const StyledMain = styled.main``
export const StyledHeader = styled.header``
export const StyledSection = styled.section``
export const StyledArticle = styled.article``
export const StyledForm = styled.form``
export const StyledFieldset = styled.fieldset``
export const StyledLegend = styled.legend``
export const StyledParagraph = styled.p`
  margin: 0;
`
export const StyledButton = styled.button``
export const StyledInput = styled.input``
export const StyledHr = styled.hr``
export const StyledHeading = styled.h2.attrs(props => ({
  as: props.as || 'h2'
}))`
  margin: 0;
`
export const StyledContainer = styled.section``

export const responsiveFontSize = (min, max) => `clamp(${min}px, 2vw + ${min}px, ${max}px)`
export const responsivePadding = (min, max) => `clamp(${min}px, 1vw + ${min}px, ${max}px)`
export const responsiveMargin = (min, max) => `clamp(${min}px, 1vw + ${min}px, ${max}px)`
export const responsiveWidth = (min, max) => `clamp(${min}px, 10vw + ${min}px, ${max}px)`
export const responsiveHeight = (min, max) => `clamp(${min}px, 5vw + ${min}px, ${max}px)`
