import axios from "axios";

const API_URL = "http://localhost:5000/api/chat";

export const sendMessage = async (
  message,
  conversation = []
) => {
  try {
    const response = await axios.post(API_URL, {
      message,
      conversation,
    });

    return response.data;
  } catch (error) {
    console.error("Chat API Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data?.message ||
          "Failed to communicate with AI."
      );
    }

    throw new Error(
      "Unable to connect to the chatbot server."
    );
  }
};