import { 
  StyledSection, 
  StyledArticle, 
  StyledHeader, 
  StyledMain, 
  StyledForm, 
  StyledFieldset, 
  StyledLegend 
} from './StyledComponents.jsx'

export const Container = ({ 
  children, 
  as = 'section',
  ...props 
}) => {
  const Tag = as
  
  return (
    <Tag {...props}>
      {children}
    </Tag>
  )
}

export const Section = ({ 
  children, 
  ...props 
}) => {
  return (
    <StyledSection {...props}>
      {children}
    </StyledSection>
  )
}

export const Article = ({ 
  children, 
  ...props 
}) => {
  return (
    <StyledArticle {...props}>
      {children}
    </StyledArticle>
  )
}

export const Header = ({ 
  children, 
  ...props 
}) => {
  return (
    <StyledHeader {...props}>
      {children}
    </StyledHeader>
  )
}

export const Main = ({ 
  children, 
  ...props 
}) => {
  return (
    <StyledMain {...props}>
      {children}
    </StyledMain>
  )
}

export const Form = ({ 
  children, 
  onSubmit,
  ...props 
}) => {
  return (
    <StyledForm onSubmit={onSubmit} {...props}>
      {children}
    </StyledForm>
  )
}

export const Fieldset = ({ 
  children, 
  ...props 
}) => {
  return (
    <StyledFieldset {...props}>
      {children}
    </StyledFieldset>
  )
}

export const Legend = ({ 
  children, 
  ...props 
}) => {
  return (
    <StyledLegend {...props}>
      {children}
    </StyledLegend>
  )
}
