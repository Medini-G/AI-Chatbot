import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,

  clientUrl:
    process.env.CLIENT_URL || "http://localhost:5173",

  geminiApiKey: process.env.GEMINI_API_KEY,

  geminiModel:
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
};

if (!env.geminiApiKey) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not configured. AI requests will fail until it is added to .env."
  );
}

export default env;