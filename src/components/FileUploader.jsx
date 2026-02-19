import React, { useCallback } from 'react'

const FileUploader = ({ onFileSelect, selectedFile }) => {
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isValidFile(file)) {
        onFileSelect(file)
      } else {
        alert('Пожалуйста, выберите файл в формате PDF, DOC или DOCX')
      }
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (isValidFile(file)) {
        onFileSelect(file)
      } else {
        alert('Пожалуйста, выберите файл в формате PDF, DOC или DOCX')
      }
    }
  }, [onFileSelect])

  const isValidFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const allowedExtensions = ['.pdf', '.doc', '.docx']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <>
      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input 
          type="file" 
          id="fileInput" 
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
        />
        
        {!selectedFile ? (
          <>
            <i className="fas fa-cloud-upload-alt"></i>
            <h3>Перетащите файл сюда</h3>
            <p>или нажмите для выбора файла</p>
            <p className="formats">Поддерживаемые форматы: .pdf, .doc, .docx</p>
          </>
        ) : (
          <div className="file-preview">
            <i className="fas fa-file-alt"></i>
            <div className="file-details">
              <h4>{selectedFile.name}</h4>
              <p>{formatFileSize(selectedFile.size)}</p>
            </div>
            <button 
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation()
                onFileSelect(null)
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="file-info">
          <p>
            <i className="fas fa-check-circle"></i>
            Выбран файл: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
          </p>
        </div>
      )}
    </>
  )
}

export default FileUploader