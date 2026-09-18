import { useRef, useState } from "react";

function CommandInput({
  onSendMessage,
  onConnectApp,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [research, setResearch] = useState(false);
  const [connectedApp, setConnectedApp] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  /* =====================================================
     FILE SELECTION
  ===================================================== */

  const handleFileClick = () => {
    if (disabled) return;

    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    // Allow selecting the same file again later
    event.target.value = "";
  };

  /* =====================================================
     REMOVE FILE
  ===================================================== */

  const removeFile = () => {
    setSelectedFile(null);
  };

  /* =====================================================
     CONNECT APP
  ===================================================== */

  const handleConnectApp = () => {
    if (disabled) return;

    if (onConnectApp) {
      onConnectApp();
    }
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage && !selectedFile) {
      return;
    }

    if (disabled) {
      return;
    }

    const options = {
      webSearch,
      research,

      connectedApp: connectedApp
        ? {
            id: connectedApp.id,
            name: connectedApp.name,
            icon: connectedApp.icon || null,
          }
        : null,

      file: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            file: selectedFile,
          }
        : null,
    };

    try {
      await onSendMessage(
        trimmedMessage ||
          `Please analyze the attached file: ${selectedFile.name}`,
        options
      );

      /* -----------------------------------------------
         RESET INPUT
      ----------------------------------------------- */

      setMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  /* =====================================================
     KEYBOARD
  ===================================================== */

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(event);
    }
  };

  /* =====================================================
     CONNECTED APP RESULT
  ===================================================== */

  const handleConnectedApp = (app) => {
    setConnectedApp(app);
  };

  return (
    <form
      className="command-input-container"
      onSubmit={handleSubmit}
    >
      {/* =================================================
          FILE PREVIEW
      ================================================= */}

      {selectedFile && (
        <div className="selected-file">
          <div className="selected-file-info">
            <span className="selected-file-icon">
              📎
            </span>

            <div className="selected-file-details">
              <span className="selected-file-name">
                {selectedFile.name}
              </span>

              <span className="selected-file-size">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          <button
            type="button"
            className="remove-file-button"
            onClick={removeFile}
            disabled={disabled}
            aria-label="Remove attached file"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          INPUT AREA
      ================================================= */}

      <div className="command-input-row">
        <textarea
          className="command-input"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={
            selectedFile
              ? "Add a message about this file..."
              : "Ask anything..."
          }
          disabled={disabled}
          rows={1}
        />

        {/* Hidden file input */}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden-file-input"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {/* =================================================
            ATTACH FILE
        ================================================= */}

        <button
          type="button"
          className="command-button"
          onClick={handleFileClick}
          disabled={disabled}
          title="Attach file"
          aria-label="Attach file"
        >
          📎
        </button>

        {/* =================================================
            CONNECT APP
        ================================================= */}

        <button
          type="button"
          className={`command-button ${
            connectedApp
              ? "command-button-active"
              : ""
          }`}
          onClick={handleConnectApp}
          disabled={disabled}
          title="Connect app"
          aria-label="Connect app"
        >
          🔗
        </button>

        {/* =================================================
            WEB SEARCH
        ================================================= */}

        <button
          type="button"
          className={`command-button ${
            webSearch
              ? "command-button-active"
              : ""
          }`}
          onClick={() =>
            setWebSearch((value) => !value)
          }
          disabled={disabled}
          title="Web search"
          aria-label="Web search"
        >
          🌐
        </button>

        {/* =================================================
            RESEARCH
        ================================================= */}

        <button
          type="button"
          className={`command-button ${
            research
              ? "command-button-active"
              : ""
          }`}
          onClick={() =>
            setResearch((value) => !value)
          }
          disabled={disabled}
          title="Research mode"
          aria-label="Research mode"
        >
          🔬
        </button>

        {/* =================================================
            SEND
        ================================================= */}

        <button
          type="submit"
          className="send-button"
          disabled={
            disabled ||
            (!message.trim() && !selectedFile)
          }
          title="Send message"
          aria-label="Send message"
        >
          ➤
        </button>
      </div>

      {/* =================================================
          CONNECTED APP INDICATOR
      ================================================= */}

      {connectedApp && (
        <div className="connected-app-indicator">
          <span>
            {connectedApp.icon || "🔗"}
          </span>

          <span>
            {connectedApp.name}
          </span>

          <button
            type="button"
            onClick={() =>
              setConnectedApp(null)
            }
            disabled={disabled}
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
}

export default CommandInput;