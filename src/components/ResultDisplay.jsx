import React, { useState, useRef, useEffect } from 'react'

const ResultDisplay = ({ result }) => {
  const [copied, setCopied] = useState(false)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCopy = async () => {
    if (!result?.structuredResult) return
    
    try {
      await navigator.clipboard.writeText(result.structuredResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Ошибка при копировании:', err)
    }
  }

  const handleDownload = async (format = 'txt') => {
    if (!result?.structuredResult) return
    
    setIsDownloading(true)
    setShowDownloadOptions(false)
    
    try {
      const response = await fetch('/api/download-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: result.structuredResult,
          filename: result.filename,
          file_type: format
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`)
      }

      // Получаем имя файла из заголовков
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `анализ_${result.filename.replace(/\.[^/.]+$/, "")}.${format}`
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      // Создаем blob и скачиваем
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Ошибка при скачивании:', error)
      
      // Фоллбэк: скачивание TXT через фронтенд
      if (format === 'txt') {
        const blob = new Blob([result.structuredResult], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `анализ_${result.filename.replace(/\.[^/.]+$/, "")}.txt`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        alert(`Ошибка: ${error.message}\n\nПопробуйте скачать как TXT файл.`)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  if (!result) {
    return (
      <div className="results-container">
        <div className="empty-state">
          <i className="fas fa-file-alt"></i>
          <p>Загрузите документ, чтобы увидеть результаты анализа</p>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      <div className="result-header">
        <div className="result-meta">
          <h3>
            <i className="fas fa-file-alt"></i>
            {result.filename}
          </h3>
          <div className="meta-info">
            <span>
              <i className="fas fa-ruler"></i>
              {result.original_length?.toLocaleString('ru-RU')} символов
            </span>
            <span>
              <i className="fas fa-clock"></i>
              {new Date().toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
        
        <div className="result-actions">
          <button 
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Скопировать результат"
            disabled={!result.structuredResult}
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
          
          <div className="download-container" ref={dropdownRef}>
            <button 
              className={`download-btn ${showDownloadOptions ? 'active' : ''}`}
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              title="Скачать результат"
              disabled={!result.structuredResult || isDownloading}
            >
              <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
              {isDownloading ? 'Создание...' : 'Скачать'}
              <i className="fas fa-chevron-down dropdown-chevron"></i>
            </button>
            
            {showDownloadOptions && (
              <div className="download-dropdown">
                <button 
                  className="download-option"
                  onClick={() => handleDownload('txt')}
                  title="Скачать как текстовый файл"
                >
                  <i className="fas fa-file-alt"></i>
                  <span>TXT файл</span>
                </button>
                
                <button 
                  className="download-option"
                  onClick={() => handleDownload('pdf')}
                  title="Скачать как PDF документ"
                >
                  <i className="fas fa-file-pdf"></i>
                  <span>PDF документ</span>
                </button>
                
                <button 
                  className="download-option"
                  onClick={() => handleDownload('docx')}
                  title="Скачать как Word документ"
                >
                  <i className="fas fa-file-word"></i>
                  <span>Word документ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {result.userInstructions && (
        <div className="instructions-display">
          <strong><i className="fas fa-comment-dots"></i> Ваши инструкции:</strong>
          <p>{result.userInstructions}</p>
        </div>
      )}

      <div className="result-content">
        <pre>{result.structuredResult}</pre>
      </div>

      <div className="result-stats">
        <div className="stat">
          <span className="label">Тип файла:</span>
          <span className="value">{result.file_type?.toUpperCase() || 'Неизвестно'}</span>
        </div>
        <div className="stat">
          <span className="label">Символов:</span>
          <span className="value">{result.original_length?.toLocaleString('ru-RU')}</span>
        </div>
        <div className="stat">
          <span className="label">Обработано:</span>
          <span className="value">{new Date().toLocaleTimeString('ru-RU')}</span>
        </div>
      </div>
    </div>
  )
}

export default ResultDisplay