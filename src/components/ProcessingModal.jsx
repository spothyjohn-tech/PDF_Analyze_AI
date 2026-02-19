import React from 'react'

const ProcessingModal = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="processing-modal">
      <div className="modal-content">
        <i className="fas fa-cogs"></i>
        <h3>Анализ документа</h3>
        <p>Нейронная сеть обрабатывает ваш документ. Пожалуйста, подождите...</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    </div>
  )
}

export default ProcessingModal