import { useMemo, useState } from "react";

import {
  FiX,
  FiSearch,
  FiCheck,
  FiExternalLink,
  FiGrid,
} from "react-icons/fi";

const applications = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Access and manage your files and documents.",
    category: "Storage",
    icon: "📁",
    logo: "GD",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Search and work with your emails.",
    category: "Communication",
    icon: "✉️",
    logo: "GM",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Manage events, meetings and schedules.",
    category: "Productivity",
    icon: "📅",
    logo: "GC",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Work with team messages and collaboration.",
    category: "Communication",
    icon: "💬",
    logo: "SL",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Search pages, notes and workspace content.",
    category: "Productivity",
    icon: "📝",
    logo: "NO",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Access repositories, issues and projects.",
    category: "Development",
    icon: "🐙",
    logo: "GH",
  },
];

function ConnectAppModal({ onClose, onConnect }) {
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const filteredApps = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return applications;
    }

    return applications.filter((app) => {
      return (
        app.name.toLowerCase().includes(searchText) ||
        app.description.toLowerCase().includes(searchText) ||
        app.category.toLowerCase().includes(searchText)
      );
    });
  }, [search]);

  const handleConnect = () => {
    if (!selectedApp) {
      return;
    }

    setConnecting(true);

    setTimeout(() => {
      onConnect({
        id: selectedApp.id,
        name: selectedApp.name,
        icon: selectedApp.icon,
        logo: selectedApp.logo,
        category: selectedApp.category,
      });
      setConnecting(false);
    }, 700);
  };

  return (
    <div className="connect-modal-overlay" onClick={onClose}>
      <div
        className="connect-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Connect application"
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}
        <div className="connect-modal-header">
          <div className="connect-title-row">
            <div className="connect-title-icon">
              <FiGrid size={18} />
            </div>
            <div>
              <h2>Connect an app</h2>
              <p>
                Add tools to your AI workspace and keep your workflow
                connected in one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="connect-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="connect-search">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search applications"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>


        {/* APPLICATION LIST */}
        <div className="connect-app-list">
          {filteredApps.length === 0 ? (
            <div className="connect-no-results">
              <FiSearch size={24} />
              <p>No applications found.</p>
              <span>Try another search term or category.</span>
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <button
                  type="button"
                  key={app.id}
                  className={`connect-app-item ${
                    isSelected ? "connect-app-selected" : ""
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="connect-app-logo">
                    {app.icon || app.logo}
                  </div>
                  <div className="connect-app-details">
                    <div className="connect-app-name">{app.name}</div>
                    <div className="connect-app-description">
                      {app.description}
                    </div>
                    <div className="connect-app-category">
                      {app.category}
                    </div>
                  </div>
                  <div className="connect-app-check">
                    {isSelected && <FiCheck size={15} />}
                  </div>
                </button>
              );
            })
          )}
        </div>


        {/* FOOTER */}
        <div className="connect-modal-footer">
          <div className="connect-footer-security">
            <span className="security-icon">🔒</span>
            <span>Secure connection handled locally.</span>
          </div>

          <div className="connect-modal-actions">
            <button
              type="button"
              className="connect-cancel-button"
              onClick={onClose}
              disabled={connecting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="connect-confirm-button"
              onClick={handleConnect}
              disabled={!selectedApp || connecting}
            >
              {connecting ? "Connecting..." : "Connect App"}
              {!connecting && <FiExternalLink size={14} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ConnectAppModal;