import React, { useEffect, useState } from 'react'

const StatusIndicator = () => {
  const [status, setStatus] = useState('checking')

  const checkServerStatus = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (data.status === 'healthy') {
        setStatus('online')
      } else {
        setStatus('degraded')
      }
    } catch (error) {
      setStatus('offline')
    }
  }

  useEffect(() => {
    checkServerStatus()
    const interval = setInterval(checkServerStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusInfo = () => {
    switch (status) {
      case 'online':
        return {
          icon: '✅',
          text: 'Сервер доступен',
          color: '#10b981'
        }
      case 'degraded':
        return {
          icon: '⚠️',
          text: 'Проблемы с сервером',
          color: '#f59e0b'
        }
      case 'offline':
        return {
          icon: '❌',
          text: 'Сервер недоступен',
          color: '#ef4444'
        }
      default:
        return {
          icon: '🔄',
          text: 'Проверка...',
          color: '#94a3b8'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div 
      className="status-indicator" 
      style={{ color: statusInfo.color }}
    >
      <span className="status-icon">{statusInfo.icon}</span>
      <span className="status-text">{statusInfo.text}</span>
    </div>
  )
}

export default StatusIndicator