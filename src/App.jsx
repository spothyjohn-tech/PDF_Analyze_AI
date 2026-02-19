import React, { useState } from 'react'
import FileUploader from './components/FileUploader'
import ResultDisplay from './components/ResultDisplay'
import ProcessingModal from './components/ProcessingModal'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [instructions, setInstructions] = useState('')

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // Загружаем и обрабатываем файл на бэкенде
      const uploadResponse = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Ошибка при загрузке файла')
      }

      const uploadData = await uploadResponse.json()

      if (uploadData.error) {
        throw new Error(uploadData.error)
      }

      // Если есть дополнительные инструкции, отправляем их в промпте
      let prompt = 'Проанализируй следующий текст и структурируй его:\n\n'
      if (instructions.trim()) {
        prompt = `Дополнительные инструкции: ${instructions}\n\n${prompt}`
      }
      prompt += uploadData.reply

      // Получаем структурированный результат от нейросети
      const processResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      })

      if (!processResponse.ok) {
        throw new Error('Ошибка при обработке нейросетью')
      }

      const processData = await processResponse.json()

      if (processData.error) {
        throw new Error(processData.error)
      }

      setResult({
        ...uploadData,
        structuredResult: processData.reply,
        userInstructions: instructions
      })

    } catch (err) {
      setError(err.message || 'Произошла неизвестная ошибка')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container">
      <header>
        <div className="logo">
          <i className="fas fa-brain"></i>
          <h1>AI Document Analyzer</h1>
        </div>
        <p className="tagline">
          Загрузите документ и получите структурированный анализ с помощью нейронной сети
        </p>
      </header>

      <main>
        <div className="upload-section">
          <FileUploader 
            onFileSelect={handleFileSelect} 
            selectedFile={selectedFile}
          />
          
          {selectedFile && (
            <div className="instructions-section">
              <label htmlFor="instructions">
                <i className="fas fa-edit"></i>
                Дополнительные инструкции (необязательно):
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Например: выдели только ключевые моменты, сосредоточься на датах, извлеки контактную информацию..."
                rows="3"
              />
              <small className="hint">
                Эти инструкции помогут нейросети лучше понять, на что обратить внимание
              </small>
            </div>
          )}

          <button 
            className={`analyze-btn ${selectedFile ? 'active' : ''}`}
            onClick={handleAnalyze}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Анализ...</span>
              </>
            ) : (
              <>
                <i className="fas fa-chart-bar"></i>
                <span>Анализировать документ</span>
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="results-section">
          <h2><i className="fas fa-chart-bar"></i> Результаты анализа</h2>
          <ResultDisplay result={result} />
        </div>
      </main>

      <footer>
        <p>AI Document Analyzer | Демонстрация работы с нейронными сетями</p>
      </footer>

      <ProcessingModal isVisible={isProcessing} />
    </div>
  )
}

export default App