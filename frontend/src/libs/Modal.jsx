import { Text } from './Text.jsx'
import { Button } from './Button.jsx'
import {
  StyledModalBackdrop,
  StyledModal,
  StyledModalHeader,
  StyledModalTitle,
  StyledModalClose,
  StyledModalContent
} from './Modal.styles.js'

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  ...props 
}) => {
  if (!isOpen) return null
  
  return (
    <>
      <StyledModalBackdrop onClick={onClose} />
      <StyledModal {...props} onClick={(e) => e.stopPropagation()}>
        {title && (
          <StyledModalHeader>
            <StyledModalTitle>
              <Text variant="heading" size="medium">
                {title}
              </Text>
            </StyledModalTitle>
            <StyledModalClose onClick={onClose}>
              ✕
            </StyledModalClose>
          </StyledModalHeader>
        )}
        <StyledModalContent>
          {children}
        </StyledModalContent>
      </StyledModal>
    </>
  )
}
