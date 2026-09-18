import { FiCpu } from "react-icons/fi";

function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="typing-avatar">
        <FiCpu size={16} />
      </div>

      <div className="typing-content">
        <div className="typing-name">
          AI Assistant
        </div>

        <div
          className="typing-bubble"
          aria-label="AI is thinking"
        >
          <span className="typing-text">
            Thinking
          </span>

          <span className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;