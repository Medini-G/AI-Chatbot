import { GoogleGenAI } from "@google/genai";
import env from "../config/env.js";

/* =========================================================
   GEMINI CONFIGURATION
========================================================= */

if (!env.geminiApiKey) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not configured."
  );
}

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

/* =========================================================
   CONSTANTS
========================================================= */

// Maximum amount of extracted file text sent to Gemini.
// This prevents extremely large PDFs from creating oversized
// requests.
const MAX_FILE_TEXT_LENGTH = 50000;

// Maximum amount of conversation history.
const MAX_HISTORY_MESSAGES = 30;

/* =========================================================
   CLEAN TEXT
========================================================= */

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
};

/* =========================================================
   TRUNCATE TEXT
========================================================= */

const truncateText = (
  text,
  maxLength = MAX_FILE_TEXT_LENGTH
) => {
  const cleaned = cleanText(text);

  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return (
    cleaned.slice(0, maxLength) +
    "\n\n[END OF EXTRACTED TEXT PREVIEW]\n" +
    "[The remaining document text was omitted because the file is very large.]"
  );
};

/* =========================================================
   DETECT FILE TYPE
========================================================= */

const getFileCategory = (file = {}) => {
  const name = cleanText(file.name).toLowerCase();
  const type = cleanText(file.type).toLowerCase();

  if (
    type.includes("pdf") ||
    name.endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (
    type.includes("word") ||
    type.includes("document") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "document";
  }

  if (
    type.includes("text") ||
    name.endsWith(".txt")
  ) {
    return "text";
  }

  if (
    type.includes("csv") ||
    name.endsWith(".csv")
  ) {
    return "csv";
  }

  if (
    type.includes("image") ||
    /\.(png|jpg|jpeg|webp|gif)$/i.test(name)
  ) {
    return "image";
  }

  return "unknown";
};

/* =========================================================
   DETECT RESUME
========================================================= */

const isResumeFile = (file = {}) => {
  const name = cleanText(file.name).toLowerCase();

  return (
    name.includes("resume") ||
    name.includes("cv") ||
    name.includes("curriculum vitae")
  );
};

/* =========================================================
   BUILD FILE CONTEXT
========================================================= */

const buildFileContext = (file = {}) => {
  const fileName =
    cleanText(file.name) ||
    "Unnamed attachment";

  const fileType =
    cleanText(file.type) ||
    "unknown";

  const fileSize =
    file.size !== undefined
      ? file.size
      : "unknown";

  const category =
    getFileCategory(file);

  /*
    Support multiple possible property names.

    Your backend may send:
    - content
    - extractedText
    - text
    - extracted_text
  */

  const extractedText =
    file.extractedText ||
    file.content ||
    file.text ||
    file.extracted_text ||
    "";

  const cleanedExtractedText =
    truncateText(extractedText);

  const hasExtractedText =
    Boolean(cleanedExtractedText);

  let context = `
[ATTACHED FILE]
File name: ${fileName}
File type: ${fileType}
File category: ${category}
File size: ${fileSize} bytes
Text extracted successfully: ${hasExtractedText ? "YES" : "NO"}
`;

  /*
    IMPORTANT:
    If extracted text exists, Gemini receives the actual
    document content.
  */

  if (hasExtractedText) {
    context += `
[ATTACHED FILE CONTENT]

The following text was extracted from the user's uploaded file.

Treat this extracted document content as the primary source
when answering questions about the attachment.

Do not claim that the file contents are unavailable.

Do not ask the user to copy and paste the document text.

Do not invent information that is not supported by the
provided document.

--- DOCUMENT START ---

${cleanedExtractedText}

--- DOCUMENT END ---
`;

    if (
      cleanedExtractedText.length >=
      MAX_FILE_TEXT_LENGTH
    ) {
      context += `
IMPORTANT:
The document was larger than the processing limit.
Only the extracted portion above is available in this request.
If the user's question requires information outside the provided
portion, clearly say that the available extracted content does
not contain that information.
`;
    }
  } else {
    context += `
[ATTACHED FILE CONTENT]

No extracted text was provided by the backend.

Do not pretend that you have read the document.

You may use the file name and metadata only.

If the user asks for specific information from the document,
explain that the actual document content was not made available
to the AI processing layer.
`;
  }

  return context;
};

/* =========================================================
   BUILD SYSTEM INSTRUCTION
========================================================= */

const buildSystemInstruction = (
  options = {},
  fileContext = ""
) => {
  let instruction = `
You are a professional AI assistant inside an AI Workspace application.

Your job is to provide accurate, useful, clear, and well-structured answers.

GENERAL RULES:

1. Answer the user's actual question directly.
2. Use conversation history when relevant.
3. Do not invent facts.
4. Do not invent citations, URLs, statistics, or sources.
5. If information is missing, clearly state what is missing.
6. Use headings, bullet points, tables, and code blocks when they improve readability.
7. When the user asks for programming help, provide practical and working code.
8. When explaining technical concepts, use simple examples where useful.
9. If an attached document is available, use its extracted content as the primary source for document-related questions.
`;

  /* =======================================================
     RESEARCH MODE
  ======================================================= */

  if (options.research) {
    instruction += `

RESEARCH MODE:

You are acting as an advanced research assistant.

Provide:
- Detailed explanations
- Clear sections
- Important concepts
- Examples
- Comparisons where useful
- Advantages and disadvantages where appropriate
- A concise conclusion

Separate facts from assumptions.

Do not invent sources or citations.
`;
  }

  /* =======================================================
     WEB SEARCH MODE
  ======================================================= */

  if (options.webSearch) {
    instruction += `

WEB SEARCH MODE:

The application has enabled web-search mode.

Use externally retrieved information when that information
is actually supplied by the application.

Do not claim that you searched the web if no external search
results were provided.

Clearly distinguish externally retrieved information from
general knowledge.
`;
  }

  /* =======================================================
     RESEARCH + WEB SEARCH
  ======================================================= */

  if (
    options.research &&
    options.webSearch
  ) {
    instruction += `

RESEARCH + WEB SEARCH MODE:

Provide a detailed research-style response.

Use retrieved information when supplied.

Organize the response with:
- Overview
- Key findings
- Detailed explanation
- Comparison or analysis when relevant
- Conclusion

Do not fabricate citations, sources, statistics, or URLs.
`;
  }

  /* =======================================================
     FILE HANDLING
  ======================================================= */

  if (fileContext) {
    instruction += `

ATTACHMENT HANDLING:

The user has uploaded a file.

IMPORTANT:

- Read and use the supplied extracted file content.
- Answer questions about the file using that content.
- Do not ask the user to paste the document text again.
- Do not say that you cannot access the document when extracted
  text has been supplied.
- Do not invent content that is not present in the extracted text.
- If the answer cannot be found in the supplied content, say so.
- If the extracted text is incomplete, clearly mention that
  the available extracted content may be incomplete.
`;
  }

  /* =======================================================
     RESUME HANDLING
  ======================================================= */

  if (
    options.file &&
    isResumeFile(options.file)
  ) {
    instruction += `

RESUME ANALYSIS MODE:

The uploaded file appears to be a resume.

When the user asks about the resume, automatically provide
useful analysis based on the actual extracted resume content.

You may include:

- Resume summary
- Candidate strengths
- Technical skills
- Education
- Projects
- Experience
- Achievements
- Missing sections
- Formatting issues
- ATS-related suggestions
- Stronger wording suggestions
- Job-role recommendations when enough information is available

Do not ask the user to paste the resume text.
`;
  }

  return instruction;
};

/* =========================================================
   CONVERT CHAT HISTORY
========================================================= */

const convertMessagesToGemini = (
  messages = []
) => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => {
      return (
        message &&
        typeof message.content === "string" &&
        message.content.trim()
      );
    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role:
        message.role === "assistant"
          ? "model"
          : "user",

      parts: [
        {
          text: cleanText(
            message.content
          ),
        },
      ],
    }));
};

/* =========================================================
   GENERATE AI RESPONSE
========================================================= */

export const generateAIResponse = async (
  messages,
  options = {}
) => {
  /* =======================================================
     API KEY VALIDATION
  ======================================================= */

  if (!env.geminiApiKey) {
    throw new Error(
      "Gemini API key is not configured."
    );
  }

  try {
    console.log("\n=================================");
    console.log("Sending request to Gemini API");
    console.log("=================================");

    console.log(
      "Model:",
      env.geminiModel
    );

    console.log(
      "API key loaded:",
      Boolean(env.geminiApiKey)
    );

    console.log(
      "Web Search:",
      Boolean(options.webSearch)
    );

    console.log(
      "Research:",
      Boolean(options.research)
    );

    console.log(
      "File attached:",
      Boolean(options.file)
    );

    /* =====================================================
       CONVERT CONVERSATION
    ===================================================== */

    const contents =
      convertMessagesToGemini(
        messages
      );

    if (contents.length === 0) {
      throw new Error(
        "No valid messages were provided."
      );
    }

    console.log(
      "Messages sent:",
      contents.length
    );

    /* =====================================================
       FILE CONTEXT
    ===================================================== */

    let fileContext = "";

    if (options.file) {
      fileContext =
        buildFileContext(
          options.file
        );

      console.log(
        "File name:",
        options.file.name
      );

      console.log(
        "File category:",
        getFileCategory(
          options.file
        )
      );

      console.log(
        "Extracted text available:",
        Boolean(
          options.file.extractedText ||
          options.file.content ||
          options.file.text ||
          options.file.extracted_text
        )
      );
    }

    /* =====================================================
       SYSTEM INSTRUCTION
    ===================================================== */

    const systemInstruction =
      buildSystemInstruction(
        options,
        fileContext
      );

    /* =====================================================
       PREPARE FINAL GEMINI CONTENTS
    ===================================================== */

    const finalContents = [
      {
        role: "user",
        parts: [
          {
            text:
              `[SYSTEM INSTRUCTION]\n` +
              systemInstruction +
              (
                fileContext
                  ? `\n\n${fileContext}`
                  : ""
              ),
          },
        ],
      },
      ...contents,
    ];

    /* =====================================================
       SEND REQUEST
    ===================================================== */

    console.log(
      "Sending content to Gemini..."
    );

    const response =
      await ai.models.generateContent({
        model:
          env.geminiModel,
        contents:
          finalContents,
      });

    /* =====================================================
       EXTRACT RESPONSE
    ===================================================== */

    const text =
      response?.text;

    if (
      !text ||
      !text.trim()
    ) {
      console.error(
        "Gemini returned an empty response."
      );

      console.error(
        "Gemini response:",
        response
      );

      throw new Error(
        "Gemini returned an empty response."
      );
    }

    console.log(
      "Gemini response received successfully."
    );

    console.log(
      "=================================\n"
    );

    return text.trim();

  } catch (error) {
    /* =====================================================
       ERROR HANDLING
    ===================================================== */

    console.error(
      "\n================================="
    );

    console.error(
      "GEMINI API ERROR"
    );

    console.error(
      "================================="
    );

    console.error(
      "Message:",
      error?.message ||
        "Unknown error"
    );

    console.error(
      "Status:",
      error?.status ||
        error?.response?.status ||
        "Unknown"
    );

    console.error(
      "Name:",
      error?.name ||
        "Unknown"
    );

    console.error(
      "Details:",
      error?.response?.data ||
        error?.details ||
        error?.cause ||
        "No additional details"
    );

    console.error(
      "Full Error:",
      error
    );

    console.error(
      "=================================\n"
    );

    /*
      Keep the original error so that the controller
      can handle it correctly.
    */

    throw error;
  }
};