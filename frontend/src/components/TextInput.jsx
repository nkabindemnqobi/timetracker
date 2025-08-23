import React from 'react'

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
  <fieldset>
    {label && (
      <legend>{label}</legend>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      {...props}
    />
    {small && (
      <p>{small}</p>
    )}
  </fieldset>
)
