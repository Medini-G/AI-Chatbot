import {
  FiMessageSquare,
  FiSettings,
  FiHelpCircle,
  FiTrash2,
  FiPlus,
  FiX,
  FiGrid,
} from "react-icons/fi";

function Sidebar({
  chats = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  onClearChat,
  onDeleteChat,
}) {
  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">

        <div className="sidebar-logo">
          ✦
        </div>

        <div className="sidebar-brand-text">
          <strong>AI Workspace</strong>
          <span>Assistant</span>
        </div>

      </div>

      {/* Navigation */}
      <div className="sidebar-navigation">

        <button
          type="button"
          className="sidebar-nav-item active"
        >
          <FiGrid size={18} />
          <span>Workspace</span>
        </button>

        <button
          type="button"
          className="sidebar-nav-item"
          onClick={onNewChat}
        >
          <FiPlus size={18} />
          <span>New Conversation</span>
        </button>

      </div>

      {/* Recent Conversations */}
      <div className="sidebar-history">

        <div className="sidebar-title">
          Recent Conversations
        </div>

        {chats.length === 0 ? (
          <div className="empty-history">
            No conversations yet
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`history-chat ${
                chat.id === activeChatId
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                onSelectChat(chat.id)
              }
            >

              <FiMessageSquare size={16} />

              <div className="history-chat-info">

                <span>
                  {chat.title}
                </span>

                <small>
                  {new Date(
                    chat.updatedAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>

              </div>

              <button
                type="button"
                className="history-delete"
                title="Delete conversation"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteChat(chat.id);
                }}
              >
                <FiX size={14} />
              </button>

            </div>
          ))
        )}

      </div>

      {/* Bottom */}
      <div className="sidebar-footer">

        <button
          type="button"
          className="sidebar-footer-item"
        >
          <FiSettings size={17} />
          Settings
        </button>

        <button
          type="button"
          className="sidebar-footer-item"
        >
          <FiHelpCircle size={17} />
          Help & Support
        </button>

        <button
          type="button"
          className="sidebar-footer-item danger"
          onClick={onClearChat}
        >
          <FiTrash2 size={17} />
          Clear Workspace
        </button>

      </div>

      {/* User */}
      <div className="workspace-user">

        <div className="workspace-user-avatar">
          U
        </div>

        <div className="workspace-user-info">
          <strong>User</strong>
          <span>Free Workspace</span>
        </div>

        <div className="user-status"></div>

      </div>

    </aside>
  );
}

export default Sidebar;