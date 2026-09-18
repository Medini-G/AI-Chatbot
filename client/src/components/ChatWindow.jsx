import { useEffect, useRef } from "react";

import {
  FiMoreVertical,
  FiMenu,
  FiSun,
  FiFileText,
  FiClock,
  FiTarget,
  FiSearch,
  FiPaperclip,
  FiGrid,
} from "react-icons/fi";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

function ChatWindow({
  messages,
  isTyping,
  onSendMessage,
  onRetry,
  onMenuClick,
  onConnectApp,
  onDisconnectApp,
  connectedApp,
  onAttachFile,
}) {
  const messagesEndRef = useRef(null);

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  /* =====================================================
     SHOW DASHBOARD
  ===================================================== */

  const showDashboard = messages.length <= 1;

  /* =====================================================
     ATTACH FILE
  ===================================================== */

  const handleAttachFile = () => {
    if (isTyping) {
      return;
    }

    if (onAttachFile) {
      onAttachFile();
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="workspace">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="workspace-header">

        <button
          type="button"
          className="mobile-menu"
          title="Open menu"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <FiMenu size={21} />
        </button>

        <div className="workspace-brand">

          <div className="brand-symbol">
            ✦
          </div>

          <div>
            <h3>
              AI Workspace
            </h3>

            <span>
              Intelligent Assistant
            </span>
          </div>

        </div>

        <div className="workspace-header-actions">

          <button
            type="button"
            className="workspace-icon-button"
            title="Workspace"
          >
            <FiGrid size={18} />
          </button>

          <button
            type="button"
            className="workspace-icon-button"
            title="More options"
          >
            <FiMoreVertical size={20} />
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <section className="workspace-content">

        {showDashboard ? (

          <div className="assistant-dashboard">

            <div className="dashboard-glow"></div>

            {/* =================================================
                INTRO
            ================================================= */}

            <div className="dashboard-intro">

              <div className="intro-symbol">
                ✦
              </div>

              <p className="intro-label">
                YOUR PERSONAL AI WORKSPACE
              </p>

              <h1>
                Hey, I'm your{" "}
                <span>
                  AI Assistant
                </span>
              </h1>

              <p className="intro-description">
                Your intelligent workspace for
                learning, creating, analyzing,
                and getting things done.
              </p>

            </div>

            {/* =================================================
                FEATURE CARDS
            ================================================= */}

            <div className="ai-card-grid">

              {/* DAILY RECAP */}

              <button
                type="button"
                className="ai-feature-card"
                onClick={() =>
                  onSendMessage(
                    "Give me a daily productivity recap."
                  )
                }
              >
                <div className="feature-icon">
                  <FiSun size={17} />
                </div>

                <div className="feature-card-title">
                  Daily Recap
                </div>

                <p>
                  Review your recent activity
                  and organize what needs
                  attention.
                </p>

                <span className="feature-link">
                  ✦ Based on your activity
                </span>
              </button>

              {/* WEEKLY UPDATE */}

              <button
                type="button"
                className="ai-feature-card"
                onClick={() =>
                  onSendMessage(
                    "Help me create a weekly update."
                  )
                }
              >
                <div className="feature-icon">
                  <FiFileText size={17} />
                </div>

                <div className="feature-card-title">
                  Weekly Update
                </div>

                <p>
                  Create a professional weekly
                  update from your recent work.
                </p>

                <span className="feature-link">
                  ✦ Based on your recent chats
                </span>
              </button>

              {/* QUICK REMINDER */}

              <button
                type="button"
                className="ai-feature-card"
                onClick={() =>
                  onSendMessage(
                    "Remind me about important tasks."
                  )
                }
              >
                <div className="feature-icon">
                  <FiClock size={17} />
                </div>

                <div className="feature-card-title">
                  Quick Reminder
                </div>

                <p>
                  Organize important tasks and
                  decide what needs your attention.
                </p>

                <span className="feature-link">
                  ✦ Based on your reminders
                </span>
              </button>

              {/* FOCUS TIME */}

              <button
                type="button"
                className="ai-feature-card"
                onClick={() =>
                  onSendMessage(
                    "Help me plan my focus time."
                  )
                }
              >
                <div className="feature-icon">
                  <FiTarget size={17} />
                </div>

                <div className="feature-card-title">
                  Focus Time
                </div>

                <p>
                  Plan your priorities and create
                  a focused work session.
                </p>

                <span className="feature-link">
                  ✦ Based on your goals
                </span>
              </button>

            </div>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="quick-actions">

              {/* ATTACH */}

              <button
                type="button"
                onClick={handleAttachFile}
                disabled={isTyping}
                title="Attach a file"
              >
                <FiPaperclip size={13} />
                Attach
              </button>

              {/* WEB SEARCH */}

              <button
                type="button"
                onClick={() =>
                  onSendMessage(
                    "Search and explain this topic for me.",
                    {
                      webSearch: true,
                    }
                  )
                }
                disabled={isTyping}
              >
                <FiSearch size={13} />
                Web Search
              </button>

              {/* RESEARCH */}

              <button
                type="button"
                onClick={() =>
                  onSendMessage(
                    "Research this topic and give me a detailed explanation.",
                    {
                      research: true,
                    }
                  )
                }
                disabled={isTyping}
              >
                ✦ Research
              </button>

              {/* CONNECT APP */}

              <button
                type="button"
                onClick={() =>
                  onConnectApp?.()
                }
                disabled={isTyping}
              >
                <FiGrid size={13} />
                Connect App
              </button>

            </div>

          </div>

        ) : (

          /* =================================================
             CONVERSATION
          ================================================= */

          <div className="conversation-view">

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={onRetry}
              />
            ))}

            {isTyping && (
              <TypingIndicator />
            )}

            <div
              ref={messagesEndRef}
            />

          </div>

        )}

      </section>

      {/* =================================================
          INPUT
      ================================================= */}

      <ChatInput
        onSendMessage={onSendMessage}
        onConnectApp={onConnectApp}
        onDisconnectApp={onDisconnectApp}
        connectedApp={connectedApp}
        onAttachFile={onAttachFile}
        disabled={isTyping}
      />

    </div>
  );
}

export default ChatWindow;