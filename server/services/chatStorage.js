const STORAGE_KEY = "realtime_ai_chat_history";

export const getChats = () => {
  try {
    const storedChats = localStorage.getItem(STORAGE_KEY);

    if (!storedChats) {
      return [];
    }

    return JSON.parse(storedChats);
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
};

export const saveChats = (chats) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(chats)
    );
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

export const clearStoredChats = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear chat history:", error);
  }
};

