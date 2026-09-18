import { useEffect, useRef, useState } from "react";

import {
  FiPaperclip,
  FiSend,
  FiMic,
  FiGrid,
  FiX,
  FiSearch,
  FiGlobe,
  FiFile,
  FiCheck,
} from "react-icons/fi";

import ConnectAppModal from "./ConnectAppModal";

function ChatInput({
  onSendMessage,
  onConnectApp,
  onDisconnectApp,
  connectedApp,
  disabled = false,
}) {
  /* =====================================================
     STATE
  ===================================================== */

  const [message, setMessage] = useState("");

  const [isListening, setIsListening] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [webSearchEnabled, setWebSearchEnabled] =
    useState(false);

  const [researchEnabled, setResearchEnabled] =
    useState(false);

  const [showConnectModal, setShowConnectModal] =
    useState(false);

  /* =====================================================
     REFS
  ===================================================== */

  const fileInputRef = useRef(null);

  const recognitionRef = useRef(null);

  const voiceBaseMessageRef = useRef("");

  /* =====================================================
     CLEANUP VOICE RECOGNITION
  ===================================================== */

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Recognition may already be stopped.
        }

        recognitionRef.current = null;
      }
    };
  }, []);

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const handleSubmit = (event) => {
    event?.preventDefault();

    if (disabled) {
      return;
    }

    let messageText = message.trim();

    /*
      Allow normal text messages.

      Also allow file messages if a file is selected.
    */
    if (!messageText && selectedFile) {
      messageText = `Please review the attached file: ${selectedFile.name}`;
    }

    if (!messageText && !selectedFile) {
      return;
    }

    onSendMessage(messageText, {
      webSearch: webSearchEnabled,
      research: researchEnabled,
      file: selectedFile,
      connectedApp: connectedApp,
    });

    setMessage("");
    setSelectedFile(null);
  };

  /* =====================================================
     ENTER KEY
  ===================================================== */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit(event);
    }
  };

  /* =====================================================
     FILE ATTACHMENT
  ===================================================== */

  const handleAttachClick = () => {
    if (disabled) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "File size must be less than 10 MB."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    event.target.value = "";
  };

  const removeSelectedFile = () => {
    if (disabled) {
      return;
    }

    setSelectedFile(null);
  };

  /* =====================================================
     FILE SIZE
  ===================================================== */

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  /* =====================================================
     WEB SEARCH
  ===================================================== */

  const toggleWebSearch = () => {
    if (disabled) {
      return;
    }

    setWebSearchEnabled((previous) => !previous);
  };

  /* =====================================================
     RESEARCH MODE
  ===================================================== */

  const toggleResearch = () => {
    if (disabled) {
      return;
    }

    setResearchEnabled((previous) => !previous);
  };

  /* =====================================================
     CONNECT APP
  ===================================================== */

  const openConnectModal = () => {
    if (disabled) {
      return;
    }

    setShowConnectModal(true);
  };

  const closeConnectModal = () => {
    setShowConnectModal(false);
  };

  const handleConnectApp = (app) => {
    if (disabled || !app) {
      return;
    }

    setShowConnectModal(false);

    if (onConnectApp) {
      onConnectApp(app);
    }
  };

  const disconnectApp = () => {
    if (disabled) {
      return;
    }

    if (onDisconnectApp) {
      onDisconnectApp();
    }
  };

  /* =====================================================
     VOICE INPUT
  ===================================================== */

  const startVoiceInput = () => {
    if (disabled) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;
    }

    /* STOP */

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        // Already stopped.
      }

      setIsListening(false);

      return;
    }

    /* CREATE */

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;

    /*
      Store the text that existed before voice input.
      This prevents interim speech results from
      repeatedly duplicating inside the textarea.
    */

    voiceBaseMessageRef.current = message.trim();

    /* START */

    recognition.onstart = () => {
      setIsListening(true);
    };

    /* RESULT */

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      const baseMessage =
        voiceBaseMessageRef.current;

      const separator =
        baseMessage.length > 0 ? " " : "";

      setMessage(
        `${baseMessage}${separator}${transcript}`
      );
    };

    /* ERROR */

    recognition.onerror = (event) => {
      console.error(
        "Voice recognition error:",
        event.error
      );

      setIsListening(false);

      recognitionRef.current = null;

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access."
        );
      }
    };

    /* END */

    recognition.onend = () => {
      setIsListening(false);

      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start voice recognition:",
        error
      );

      setIsListening(false);

      recognitionRef.current = null;
    }
  };

  /* =====================================================
     PLACEHOLDER
  ===================================================== */

  const getPlaceholder = () => {
    if (disabled) {
      return "AI is thinking...";
    }

    if (isListening) {
      return "Listening...";
    }

    if (selectedFile) {
      return "Ask something about this file...";
    }

    if (connectedApp) {
      return `Ask about ${connectedApp.name}...`;
    }

    if (researchEnabled) {
      return "Ask a research question...";
    }

    if (webSearchEnabled) {
      return "Search the web...";
    }

    return "Ask anything...";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <div className="command-area">

        {/* =================================================
            ATTACHMENT PREVIEW
        ================================================= */}

        {selectedFile && (
          <div className="selected-file">

            <div className="selected-file-info">

              <div className="selected-file-icon">
                <FiFile size={15} />
              </div>

              <div className="selected-file-details">

                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {formatFileSize(
                    selectedFile.size
                  )}
                </span>

                <span className="selected-file-type">
                  {selectedFile.type || "Unknown file type"}
                </span>

              </div>

            </div>

            <button
              type="button"
              onClick={removeSelectedFile}
              disabled={disabled}
              title="Remove attachment"
              aria-label="Remove attachment"
            >
              <FiX size={15} />
            </button>

          </div>
        )}

        {/* =================================================
            CONNECTED APP
        ================================================= */}

        {connectedApp && (
          <div className="connected-app-status">

            <div className="connected-app-info">

              <div className="connected-app-icon">
                {connectedApp.icon || connectedApp.logo || (
                  <FiGrid size={14} />
                )}
              </div>

              <div className="connected-app-text">

                <strong>
                  {connectedApp.name}
                </strong>

                <span>
                  Connected
                </span>

              </div>

              <div className="connected-app-check">
                <FiCheck size={11} />
              </div>

            </div>

            <button
              type="button"
              onClick={disconnectApp}
              disabled={disabled}
              title="Disconnect app"
              aria-label="Disconnect app"
            >
              <FiX size={14} />
            </button>

          </div>
        )}

        {/* =================================================
            TOOL BAR
        ================================================= */}

        <div className="command-tools">

          {/* ATTACH */}

          <button
            type="button"
            disabled={disabled}
            onClick={handleAttachClick}
            className={
              selectedFile
                ? "command-tool-active"
                : ""
            }
            title="Attach file"
          >
            <FiPaperclip size={13} />

            <span>
              Attach
            </span>
          </button>

          {/* WEB SEARCH */}

          <button
            type="button"
            disabled={disabled}
            onClick={toggleWebSearch}
            className={
              webSearchEnabled
                ? "command-tool-active"
                : ""
            }
            title={
              webSearchEnabled
                ? "Disable web search"
                : "Enable web search"
            }
          >
            {webSearchEnabled ? (
              <FiGlobe size={13} />
            ) : (
              <FiSearch size={13} />
            )}

            <span>
              {webSearchEnabled
                ? "Web search"
                : "Web search"}
            </span>
          </button>

          {/* RESEARCH */}

          <button
            type="button"
            disabled={disabled}
            onClick={toggleResearch}
            className={
              researchEnabled
                ? "command-tool-active research-active"
                : ""
            }
            title={
              researchEnabled
                ? "Disable research mode"
                : "Enable research mode"
            }
          >
            <span className="research-symbol">
              ✦
            </span>

            <span>
              Research
            </span>
          </button>

          {/* CONNECT APP */}

          <button
            type="button"
            disabled={disabled}
            onClick={openConnectModal}
            className={
              connectedApp
                ? "command-tool-active"
                : ""
            }
            title="Connect an application"
          >
            <FiGrid size={13} />

            <span>
              {connectedApp
                ? connectedApp.name
                : "Connect app"}
            </span>
          </button>

        </div>

        {/* =================================================
            ACTIVE MODE BADGES
        ================================================= */}

        {(webSearchEnabled ||
          researchEnabled) && (
          <div className="active-mode-status">

            <div className="active-mode-items">

              {/* WEB */}

              {webSearchEnabled && (
                <div className="mode-badge web-mode">

                  <FiGlobe size={12} />

                  <span>
                    Web search enabled
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setWebSearchEnabled(false)
                    }
                    disabled={disabled}
                    title="Disable web search"
                    aria-label="Disable web search"
                  >
                    <FiX size={12} />
                  </button>

                </div>
              )}

              {/* RESEARCH */}

              {researchEnabled && (
                <div className="mode-badge research-mode">

                  <span className="research-symbol">
                    ✦
                  </span>

                  <span>
                    Research mode enabled
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setResearchEnabled(false)
                    }
                    disabled={disabled}
                    title="Disable research mode"
                    aria-label="Disable research mode"
                  >
                    <FiX size={12} />
                  </button>

                </div>
              )}

            </div>

          </div>
        )}

        {/* =================================================
            MAIN COMMAND INPUT
        ================================================= */}

        <form
          className={`command-input ${
            disabled
              ? "command-input-disabled"
              : ""
          } ${
            isListening
              ? "command-input-listening"
              : ""
          }`}
          onSubmit={handleSubmit}
        >

          {/* TEXTAREA */}

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={1}
            disabled={disabled}
            aria-label="Message input"
          />

          {/* MICROPHONE */}

          <button
            type="button"
            className={`command-mic ${
              isListening
                ? "voice-listening"
                : ""
            }`}
            disabled={disabled}
            onClick={startVoiceInput}
            title={
              isListening
                ? "Stop voice input"
                : "Voice input"
            }
            aria-label={
              isListening
                ? "Stop voice input"
                : "Voice input"
            }
          >
            <FiMic size={16} />
          </button>

          {/* SEND */}

          <button
            type="submit"
            className="command-send"
            disabled={
              (!message.trim() &&
                !selectedFile) ||
              disabled
            }
            title="Send message"
            aria-label="Send message"
          >
            <FiSend size={15} />
          </button>

        </form>

        {/* =================================================
            VOICE STATUS
        ================================================= */}

        {isListening && (
          <div className="voice-status">

            <span className="voice-status-dot" />

            <span>
              Listening...
            </span>

          </div>
        )}

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <p className="command-disclaimer">

          {connectedApp
            ? `${connectedApp.name} is connected to your workspace.`
            : researchEnabled
            ? "Research mode provides a more detailed and structured analysis."
            : webSearchEnabled
            ? "Web search is enabled. Results may contain external information."
            : "AI can make mistakes. Verify important information."}

        </p>

        {/* =================================================
            HIDDEN FILE INPUT
        ================================================= */}

        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

      </div>

      {/* ===================================================
          CONNECT APP MODAL
      =================================================== */}

      {showConnectModal && (
        <ConnectAppModal
          onClose={closeConnectModal}
          onConnect={handleConnectApp}
        />
      )}

    </>
  );
}

export default ChatInput;