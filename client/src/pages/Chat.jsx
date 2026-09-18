import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

import {
  getChats,
  saveChats,
  clearStoredChats,
} from "../services/chatStorage";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL = "http://localhost:5000/api/chat";

/* =========================================================
   HELPERS
========================================================= */

const generateId = (prefix = "item") => {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const getCurrentTime = () => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   WELCOME MESSAGE
========================================================= */

const createWelcomeMessage = () => {
  return {
    id: generateId("welcome"),
    sender: "ai",
    text: "Hello! 👋 I'm your AI assistant. How can I help you today?",
    time: getCurrentTime(),
  };
};

/* =========================================================
   CREATE NEW CHAT
========================================================= */

const createChat = () => {
  return {
    id: generateId("chat"),
    title: "New Conversation",
    messages: [createWelcomeMessage()],
    updatedAt: new Date().toISOString(),
  };
};

/* =========================================================
   SAFE CHAT LOADING
========================================================= */

const loadInitialChats = () => {
  try {
    const storedChats = getChats();

    if (
      Array.isArray(storedChats) &&
      storedChats.length > 0
    ) {
      return storedChats;
    }
  } catch (error) {
    console.error(
      "Failed to load stored chats:",
      error
    );
  }

  return [createChat()];
};

/* =========================================================
   CHAT PAGE
========================================================= */

function Chat() {
  /* =======================================================
     CHAT STATE
  ======================================================= */

  const [chats, setChats] = useState(
    loadInitialChats
  );

  /* =======================================================
     ACTIVE CHAT
  ======================================================= */

  const [activeChatId, setActiveChatId] = useState(
    () => {
      try {
        const storedChats = getChats();

        if (
          Array.isArray(storedChats) &&
          storedChats.length > 0
        ) {
          return storedChats[0].id;
        }
      } catch (error) {
        console.error(
          "Failed to restore active chat:",
          error
        );
      }

      return null;
    }
  );

  /* =======================================================
     UI STATE
  ======================================================= */

  const [isTyping, setIsTyping] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =======================================================
     CONNECTED APP STATE
  ======================================================= */

  const [connectedApp, setConnectedApp] =
    useState(null);

  /* =======================================================
     ENSURE ACTIVE CHAT EXISTS
  ======================================================= */

  useEffect(() => {
    if (chats.length === 0) {
      const newChat = createChat();

      setChats([newChat]);

      setActiveChatId(newChat.id);

      return;
    }

    const activeExists = chats.some(
      (chat) =>
        chat.id === activeChatId
    );

    if (!activeExists) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  /* =======================================================
     SAVE CHATS
  ======================================================= */

  useEffect(() => {
    try {
      saveChats(chats);
    } catch (error) {
      console.error(
        "Failed to save chats:",
        error
      );
    }
  }, [chats]);

  /* =======================================================
     ACTIVE CHAT DATA
  ======================================================= */

  const activeChat =
    chats.find(
      (chat) =>
        chat.id === activeChatId
    ) || chats[0];

  const messages =
    activeChat?.messages || [];

  /* =======================================================
     UPDATE ACTIVE CHAT
  ======================================================= */

  const updateActiveChat = (
    updatedMessages,
    extraData = {}
  ) => {
    if (!activeChatId) {
      return;
    }

    setChats((previousChats) => {
      return previousChats.map((chat) => {
        if (
          chat.id !== activeChatId
        ) {
          return chat;
        }

        return {
          ...chat,

          messages:
            updatedMessages,

          updatedAt:
            new Date().toISOString(),

          ...extraData,
        };
      });
    });
  };

  /* =======================================================
     BUILD CONVERSATION HISTORY
  ======================================================= */

  const buildConversation = (
    chatMessages
  ) => {
    return chatMessages
      .filter(
        (message) =>
          !message.isError
      )
      .map((message) => ({
        role:
          message.sender === "user"
            ? "user"
            : "assistant",

        content:
          message.text || "",
      }));
  };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = async (
    text,
    options = {}
  ) => {
    if (
      !text ||
      !text.trim() ||
      isTyping ||
      !activeChat
    ) {
      return;
    }

    const userText = text.trim();

    /* -----------------------------------------------------
       NORMALIZE OPTIONS
    ----------------------------------------------------- */

    const normalizedOptions = {
      webSearch:
        Boolean(
          options.webSearch
        ),

      research:
        Boolean(
          options.research
        ),

      connectedApp:
        options.connectedApp
          ? {
              id:
                options.connectedApp.id,

              name:
                options.connectedApp.name,

              icon:
                options.connectedApp.icon ||
                null,
            }
          : connectedApp
          ? {
              id:
                connectedApp.id,

              name:
                connectedApp.name,

              icon:
                connectedApp.icon ||
                null,
            }
          : null,

      file:
        options.file
          ? {
              name:
                options.file.name,

              type:
                options.file.type,

              size:
                options.file.size,
            }
          : null,
    };

    /* -----------------------------------------------------
       USER MESSAGE
    ----------------------------------------------------- */

    const userMessage = {
      id: generateId("user"),

      sender: "user",

      text: userText,

      time: getCurrentTime(),

      options:
        normalizedOptions,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    updateActiveChat(
      updatedMessages
    );

    /* -----------------------------------------------------
       UPDATE CHAT TITLE
    ----------------------------------------------------- */

    if (
      activeChat.title ===
      "New Conversation"
    ) {
      const chatTitle =
        userText.length > 35
          ? `${userText.slice(
              0,
              35
            )}...`
          : userText;

      updateActiveChat(
        updatedMessages,
        {
          title: chatTitle,
        }
      );
    }

    /* -----------------------------------------------------
       START AI PROCESSING
    ----------------------------------------------------- */

    setIsTyping(true);

    try {
      /* ---------------------------------------------------
         CONVERSATION HISTORY
      --------------------------------------------------- */

      const conversation =
        buildConversation(
          updatedMessages
        );

      /* ---------------------------------------------------
         API PAYLOAD
      --------------------------------------------------- */

      const payload = {
        message: userText,

        conversation,

        webSearch:
          normalizedOptions.webSearch,

        research:
          normalizedOptions.research,

        connectedApp:
          normalizedOptions.connectedApp,

        file:
          normalizedOptions.file,
      };

      console.log(
        "Sending chat payload:",
        payload
      );

      /* ---------------------------------------------------
         API REQUEST
      --------------------------------------------------- */

      let response;

      if (
        normalizedOptions.file &&
        typeof options.file === "object" &&
        options.file instanceof File
      ) {
        const formData = new FormData();

        formData.append("message", userText);
        formData.append(
          "conversation",
          JSON.stringify(conversation)
        );
        formData.append(
          "webSearch",
          String(normalizedOptions.webSearch)
        );
        formData.append(
          "research",
          String(normalizedOptions.research)
        );

        if (normalizedOptions.connectedApp) {
          formData.append(
            "connectedApp",
            JSON.stringify(
              normalizedOptions.connectedApp
            )
          );
        }

        formData.append("file", options.file);

        response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      /* ---------------------------------------------------
         HANDLE NON-JSON RESPONSE
      --------------------------------------------------- */

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      /* ---------------------------------------------------
         API ERROR
      --------------------------------------------------- */

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to generate AI response."
        );
      }

      /* ---------------------------------------------------
         AI MESSAGE
      --------------------------------------------------- */

      const aiText =
        data?.data?.message ||
        data?.message ||
        "I received your message, but I couldn't generate a response.";

      const aiMessage = {
        id: generateId("ai"),

        sender: "ai",

        text: aiText,

        time: getCurrentTime(),
      };

      /* ---------------------------------------------------
         UPDATE CHAT
      --------------------------------------------------- */

      updateActiveChat([
        ...updatedMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "Chat API Error:",
        error
      );

      /* ---------------------------------------------------
         ERROR MESSAGE
      --------------------------------------------------- */

      const errorMessage = {
        id: generateId("error"),

        sender: "ai",

        text:
          "I couldn't generate a response right now. Please check your connection and try again.",

        time: getCurrentTime(),

        isError: true,

        failedMessage:
          userText,

        failedOptions:
          normalizedOptions,
      };

      updateActiveChat([
        ...updatedMessages,
        errorMessage,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* =======================================================
     RETRY FAILED MESSAGE
  ======================================================= */

  const retryMessage = async (
    message
  ) => {
    if (
      isTyping ||
      !message?.failedMessage ||
      !activeChat
    ) {
      return;
    }

    const failedText =
      message.failedMessage;

    const failedOptions =
      message.failedOptions ||
      {};

    /* -----------------------------------------------------
       REMOVE OLD ERROR MESSAGE
    ----------------------------------------------------- */

    const cleanedMessages =
      messages.filter(
        (item) =>
          item.id !== message.id
      );

    updateActiveChat(
      cleanedMessages
    );

    setIsTyping(true);

    try {
      /* ---------------------------------------------------
         CONVERSATION
      --------------------------------------------------- */

      const conversation =
        buildConversation(
          cleanedMessages
        );

      /* ---------------------------------------------------
         PAYLOAD
      --------------------------------------------------- */

      const payload = {
        message:
          failedText,

        conversation,

        webSearch:
          Boolean(
            failedOptions.webSearch
          ),

        research:
          Boolean(
            failedOptions.research
          ),

        connectedApp:
          failedOptions.connectedApp ||
          connectedApp ||
          null,

        file:
          failedOptions.file ||
          null,
      };

      /* ---------------------------------------------------
         REQUEST
      --------------------------------------------------- */

      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      /* ---------------------------------------------------
         RESPONSE
      --------------------------------------------------- */

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Invalid server response."
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to generate AI response."
        );
      }

      /* ---------------------------------------------------
         AI RESPONSE
      --------------------------------------------------- */

      const aiMessage = {
        id:
          generateId(
            "retry-ai"
          ),

        sender: "ai",

        text:
          data?.data?.message ||
          data?.message ||
          "I couldn't generate a response.",

        time: getCurrentTime(),
      };

      updateActiveChat([
        ...cleanedMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "Retry failed:",
        error
      );

      /* ---------------------------------------------------
         RETRY ERROR
      --------------------------------------------------- */

      const retryErrorMessage = {
        id:
          generateId(
            "retry-error"
          ),

        sender: "ai",

        text:
          "Retry failed. Please check your connection and try again.",

        time: getCurrentTime(),

        isError: true,

        failedMessage:
          failedText,

        failedOptions:
          failedOptions,
      };

      updateActiveChat([
        ...cleanedMessages,
        retryErrorMessage,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* =======================================================
     CONNECT APP
  ======================================================= */

  const connectApp = (app) => {
    if (!app) {
      return;
    }

    console.log(
      "Connected application:",
      app
    );

    /*
      Store the selected application.

      Example:
      {
        id: "gmail",
        name: "Gmail",
        icon: "...",
        logo: "GM"
      }
    */

    setConnectedApp({
      id: app.id,

      name: app.name,

      icon:
        app.icon || null,

      logo: app.logo || null,

      category:
        app.category || null,
    });
  };

  /* =======================================================
     DISCONNECT APP
  ======================================================= */

  const disconnectApp = () => {
    console.log(
      "Disconnected application:",
      connectedApp
    );

    setConnectedApp(null);
  };

  /* =======================================================
     CREATE NEW CHAT
  ======================================================= */

  const createNewChat = () => {
    if (isTyping) {
      return;
    }

    const newChat =
      createChat();

    setChats(
      (previousChats) => [
        newChat,
        ...previousChats,
      ]
    );

    setActiveChatId(
      newChat.id
    );

    setSidebarOpen(false);
  };

  /* =======================================================
     SELECT CHAT
  ======================================================= */

  const selectChat = (
    chatId
  ) => {
    if (isTyping) {
      return;
    }

    const chatExists =
      chats.some(
        (chat) =>
          chat.id === chatId
      );

    if (!chatExists) {
      return;
    }

    setActiveChatId(
      chatId
    );

    setSidebarOpen(false);
  };

  /* =======================================================
     DELETE CHAT
  ======================================================= */

  const deleteChat = (
    chatId
  ) => {
    if (isTyping) {
      return;
    }

    const remainingChats =
      chats.filter(
        (chat) =>
          chat.id !== chatId
      );

    /* -----------------------------------------------------
       IF LAST CHAT IS DELETED
    ----------------------------------------------------- */

    if (
      remainingChats.length ===
      0
    ) {
      const newChat =
        createChat();

      setChats([
        newChat,
      ]);

      setActiveChatId(
        newChat.id
      );

      return;
    }

    /* -----------------------------------------------------
       UPDATE CHAT LIST
    ----------------------------------------------------- */

    setChats(
      remainingChats
    );

    /* -----------------------------------------------------
       SELECT ANOTHER CHAT
    ----------------------------------------------------- */

    if (
      chatId === activeChatId
    ) {
      setActiveChatId(
        remainingChats[0].id
      );
    }
  };

  /* =======================================================
     CLEAR ALL CHATS
  ======================================================= */

  const clearChat = () => {
    if (isTyping) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to clear all conversations?"
      );

    if (!confirmed) {
      return;
    }

    try {
      clearStoredChats();
    } catch (error) {
      console.error(
        "Failed to clear stored chats:",
        error
      );
    }

    const newChat =
      createChat();

    setChats([
      newChat,
    ]);

    setActiveChatId(
      newChat.id
    );

    setSidebarOpen(false);
  };

  /* =======================================================
     MOBILE SIDEBAR
  ======================================================= */

  const openSidebar = () => {
    if (isTyping) {
      return;
    }

    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`app-layout ${
        sidebarOpen
          ? "sidebar-is-open"
          : ""
      }`}
    >
      {/* =================================================
          MOBILE SIDEBAR OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={
            closeSidebar
          }
          aria-hidden="true"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div
        className={`mobile-sidebar-wrapper ${
          sidebarOpen
            ? "mobile-sidebar-open"
            : ""
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={
            activeChatId
          }
          onNewChat={
            createNewChat
          }
          onSelectChat={
            selectChat
          }
          onDeleteChat={
            deleteChat
          }
          onClearChat={
            clearChat
          }
          onClose={
            closeSidebar
          }
        />
      </div>

      {/* =================================================
          MAIN CHAT WORKSPACE
      ================================================= */}

      <main className="chat-main">
        <ChatWindow
          messages={
            messages
          }

          isTyping={
            isTyping
          }

          onSendMessage={
            sendMessage
          }

          onRetry={
            retryMessage
          }

          onMenuClick={
            openSidebar
          }

          /* ------------------------------------------------
             CONNECT APP
          ------------------------------------------------ */

          onConnectApp={
            connectApp
          }

          /* ------------------------------------------------
             CURRENT CONNECTED APP
          ------------------------------------------------ */

          connectedApp={
            connectedApp
          }

          /* ------------------------------------------------
             DISCONNECT APP
          ------------------------------------------------ */

          onDisconnectApp={
            disconnectApp
          }
        />
      </main>
    </div>
  );
}

export default Chat;