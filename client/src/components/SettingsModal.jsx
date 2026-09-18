import { FiX, FiSun, FiMoon, FiCheck } from "react-icons/fi";

function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  enterToSend,
  onEnterToSendChange,
  showTimestamps,
  onShowTimestampsChange,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="settings-overlay"
      onClick={onClose}
    >
      <div
        className="settings-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="settings-header">
          <div>
            <h2>Settings</h2>
            <p>Customize your chat experience</p>
          </div>

          <button
            type="button"
            className="settings-close-button"
            onClick={onClose}
            aria-label="Close settings"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Appearance */}
        <section className="settings-section">
          <h3>Appearance</h3>

          <p className="settings-description">
            Choose how the chatbot interface looks.
          </p>

          <div className="theme-options">

            <button
              type="button"
              className={`theme-option ${
                theme === "light" ? "selected" : ""
              }`}
              onClick={() => onThemeChange("light")}
            >
              <div className="theme-icon">
                <FiSun size={18} />
              </div>

              <div className="theme-option-content">
                <strong>Light</strong>
                <span>Clean and bright interface</span>
              </div>

              {theme === "light" && (
                <FiCheck
                  className="theme-check"
                  size={18}
                />
              )}
            </button>

            <button
              type="button"
              className={`theme-option ${
                theme === "dark" ? "selected" : ""
              }`}
              onClick={() => onThemeChange("dark")}
            >
              <div className="theme-icon">
                <FiMoon size={18} />
              </div>

              <div className="theme-option-content">
                <strong>Dark</strong>
                <span>Comfortable for low-light use</span>
              </div>

              {theme === "dark" && (
                <FiCheck
                  className="theme-check"
                  size={18}
                />
              )}
            </button>

          </div>
        </section>

        {/* Chat Preferences */}
        <section className="settings-section">
          <h3>Chat Preferences</h3>

          <p className="settings-description">
            Control how messages behave in the chat.
          </p>

          {/* Enter to send */}
          <div className="settings-option">
            <div className="settings-option-text">
              <strong>Enter to send</strong>

              <span>
                Press Enter to send a message.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                enterToSend ? "active" : ""
              }`}
              onClick={() =>
                onEnterToSendChange(!enterToSend)
              }
              aria-label="Toggle Enter to send"
              aria-pressed={enterToSend}
            >
              <span />
            </button>
          </div>

          {/* Show timestamps */}
          <div className="settings-option">
            <div className="settings-option-text">
              <strong>Show timestamps</strong>

              <span>
                Display the time for each message.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                showTimestamps ? "active" : ""
              }`}
              onClick={() =>
                onShowTimestampsChange(
                  !showTimestamps
                )
              }
              aria-label="Toggle timestamps"
              aria-pressed={showTimestamps}
            >
              <span />
            </button>
          </div>
        </section>

        {/* Footer */}
        <div className="settings-footer">
          <span>AI Chat Assistant</span>

          <button
            type="button"
            className="settings-done-button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;