import { useState } from "react";
import {
  FiCopy,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MessageBubble({ message, onRetry }) {
  const [copied, setCopied] = useState(false);

  const isUser = message.sender === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleRetry = () => {
    if (onRetry && message.failedMessage) {
      onRetry(message);
    }
  };

  return (
    <div
      className={`message-row ${
        isUser
          ? "user-message-row"
          : "ai-message-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`message-avatar ${
          isUser
            ? "user-message-avatar"
            : "ai-message-avatar"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Message content */}
      <div className="message-content">

        {/* Name and time */}
        <div className="message-meta">
          <strong>
            {isUser ? "You" : "AI Assistant"}
          </strong>

          <span>
            {message.time}
          </span>
        </div>

        {/* Message bubble */}
        <div
          className={`message-bubble ${
            isUser
              ? "user-message-bubble"
              : "ai-message-bubble"
          } ${
            message.isError
              ? "error-message-bubble"
              : ""
          }`}
        >
          {isUser ? (
            <p>{message.text}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button for AI messages */}
        {!isUser && !message.isError && (
          <button
            type="button"
            className="copy-message-button"
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? (
              <>
                <FiCheck size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <FiCopy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        )}

        {/* Retry button for failed messages */}
        {message.isError && (
          <button
            type="button"
            className="retry-message-button"
            onClick={handleRetry}
            title="Retry"
          >
            <FiRefreshCw size={14} />
            <span>Retry</span>
          </button>
        )}

      </div>
    </div>
  );
}

export default MessageBubble;