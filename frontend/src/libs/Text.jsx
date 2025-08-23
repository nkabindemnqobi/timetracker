import { StyledParagraph, StyledHeading } from './StyledComponents.jsx'
import styled from 'styled-components'

const StyledLink = styled.a``

export const Text = ({ 
  children, 
  variant = 'body',
  size = 'medium',
  ...props 
}) => {
  const baseClasses = 'text'
  const variantClasses = {
    body: 'text--body',
    heading: 'text--heading',
    caption: 'text--caption',
    label: 'text--label'
  }
  const sizeClasses = {
    small: 'text--small',
    medium: 'text--medium',
    large: 'text--large'
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size]
  ].filter(Boolean).join(' ')
  
  return (
    <StyledParagraph className={classes} {...props}>
      {children}
    </StyledParagraph>
  )
}

export const Heading = ({ 
  children, 
  level = 1,
  ...props 
}) => {
  const Tag = `h${level}`
  const classes = ['heading', `heading--h${level}`].filter(Boolean).join(' ')
  
  return (
    <StyledHeading as={Tag} className={classes} {...props}>
      {children}
    </StyledHeading>
  )
}

export const Paragraph = ({ 
  children, 
  ...props 
}) => {
  const classes = ['paragraph'].filter(Boolean).join(' ')
  
  return (
    <StyledParagraph className={classes} {...props}>
      {children}
    </StyledParagraph>
  )
}

export const Link = ({ 
  children, 
  href,
  target,
  rel,
  ...props 
}) => {
  const classes = ['link'].filter(Boolean).join(' ')
  
  return (
    <StyledLink 
      href={href}
      target={target}
      rel={rel}
      className={classes}
      {...props}
    >
      {children}
    </StyledLink>
  )
}
