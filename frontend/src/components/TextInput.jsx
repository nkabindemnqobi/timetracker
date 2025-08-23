import {
  StyledTextInputFieldset,
  StyledTextInputLegend,
  StyledTextInputInput,
  StyledTextInputParagraph
} from './TextInput.styles.js'

export const TextInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  small = null,
  ...props 
}) => (
  <StyledTextInputFieldset>
    {label && (
      <StyledTextInputLegend>{label}</StyledTextInputLegend>
    )}
    <StyledTextInputInput
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      {...props}
    />
    {small && (
      <StyledTextInputParagraph>{small}</StyledTextInputParagraph>
    )}
  </StyledTextInputFieldset>
)
