import { createContext, useContext, useState } from 'react'
import { Modal } from './Modal.jsx'

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([])

  const pushModal = (modal) => {
    const id = Date.now() + Math.random()
    setModals(prev => [...prev, { ...modal, id }])
  }

  const popModal = () => {
    setModals(prev => prev.slice(0, -1))
  }

  const closeModal = (id) => {
    setModals(prev => prev.filter(modal => modal.id !== id))
  }

  return (
    <ModalContext.Provider value={{ pushModal, popModal, closeModal }}>
      {children}
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => closeModal(modal.id)}
          title={modal.title}
        >
          {modal.content}
        </Modal>
      ))}
    </ModalContext.Provider>
  )
}
