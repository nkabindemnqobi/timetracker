import { StyledInput } from './StyledComponents.jsx'

export const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  ...props 
}) => {
  const classes = ['input'].filter(Boolean).join(' ')
  
  return (
    <StyledInput
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={classes}
      {...props}
    />
  )
}
