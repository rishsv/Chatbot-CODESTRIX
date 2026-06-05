import React from 'react'
import { parseChunks } from '../../utils/chunkParser'

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'
  const sources = parseChunks(message.sources)

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-badge">{isUser ? 'You' : 'AI'}</div>
      <div className="message-card">
        <div className="message-text">{message.text || ''}</div>
        {!isUser && message.thinking?.length > 0 && (
          <div className="thinking-lines">
            {message.thinking.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        )}
        {!isUser && sources.length > 0 && (
          <div className="sources-panel">
            <div className="sources-title">Sources</div>
            <ul>
              {sources.map((source) => (
                <ul>
  {sources.map((source, index) => (
    <li key={`${index}-${source || "unknown"}`}>
      {source || "Unknown source"}
    </li>
  ))}
</ul>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
