import { StyledButton } from './StyledComponents.jsx'

export const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button',
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  const baseClasses = 'button'
  const variantClasses = {
    primary: 'button--primary',
    secondary: 'button--secondary',
    danger: 'button--danger',
    ghost: 'button--ghost'
  }
  const sizeClasses = {
    small: 'button--small',
    medium: 'button--medium',
    large: 'button--large'
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size]
  ].filter(Boolean).join(' ')
  
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </StyledButton>
  )
}
