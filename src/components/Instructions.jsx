import React, { useState } from 'react'

const Instructions = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="instructions">
      <div 
        className="instructions-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>ℹ️</span>
        <h3>Как это работает?</h3>
        <button className="toggle-btn">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="instructions-content">
          <div className="workflow">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Загрузите файл</h4>
                <p>Перетащите или выберите документ в формате PDF, DOCX, TXT, MD или RTF</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Укажите пожелания (опционально)</h4>
                <p>Если нужно, добавьте инструкции: что именно извлечь, на что обратить внимание</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Получите результат</h4>
                <p>Нейросеть обработает документ и представит структурированный, легко читаемый результат</p>
              </div>
            </div>
          </div>

          <div className="usage-tips">
            <h4>💡 Советы по использованию:</h4>
            <ul>
              <li>Для лучшего результата загружайте документы с четкой структурой</li>
              <li>Используйте дополнительные инструкции для конкретных задач</li>
              <li>Результат можно скопировать или скачать в удобном формате</li>
              <li>Максимальный размер файла: PDF - 20MB, остальные - 10MB</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Instructions