import { generateAIResponse } from "../services/aiService.js";
import fs from "fs/promises";
import pdfParse from "pdf-parse";

/**
 * =========================================================
 * POST /api/chat
 *
 * Handles:
 * - Normal chat
 * - Web search mode
 * - Research mode
 * - Connected applications
 * - File attachments
 * - PDF text extraction
 * =========================================================
 */

export const chat = async (req, res) => {
  let uploadedFilePath = null;

  try {
    /* =====================================================
       GET REQUEST DATA
    ===================================================== */

    const {
      message,
      conversation,
      webSearch,
      research,
      connectedApp,
    } = req.body;

    /* =====================================================
       VALIDATE MESSAGE
    ===================================================== */

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    /* =====================================================
       FILE DATA
    ===================================================== */

    let fileData = null;

    if (req.file) {
      uploadedFilePath = req.file.path;

      console.log(
        "================================="
      );

      console.log(
        "FILE ATTACHMENT RECEIVED"
      );

      console.log(
        "File:",
        req.file.originalname
      );

      console.log(
        "Type:",
        req.file.mimetype
      );

      console.log(
        "Size:",
        req.file.size
      );

      console.log(
        "================================="
      );

      /* ===================================================
         BASIC FILE INFORMATION
      =================================================== */

      fileData = {
        name:
          req.file.originalname,

        type:
          req.file.mimetype,

        size:
          req.file.size,

        text: "",

        pageCount: 0,

        extractedTextAvailable:
          false,
      };

      /* ===================================================
         PDF EXTRACTION
      =================================================== */

      const isPDF =
        req.file.mimetype ===
          "application/pdf" ||
        req.file.originalname
          .toLowerCase()
          .endsWith(".pdf");

      if (isPDF) {
        try {
          console.log(
            "Starting PDF text extraction..."
          );

          /* -----------------------------------------------
             READ PDF
          ------------------------------------------------ */

          const pdfBuffer =
            await fs.readFile(
              req.file.path
            );

          /* -----------------------------------------------
             PARSE PDF
          ------------------------------------------------ */

          const pdfData =
            await pdfParse(
              pdfBuffer
            );

          /* -----------------------------------------------
             EXTRACT TEXT
          ------------------------------------------------ */

          const extractedText =
            typeof pdfData.text ===
            "string"
              ? pdfData.text.trim()
              : "";

          fileData.text =
            extractedText;

          fileData.pageCount =
            pdfData.numpages || 0;

          fileData.extractedTextAvailable =
            Boolean(
              extractedText
            );

          console.log(
            "PDF extraction completed."
          );

          console.log(
            "Pages:",
            fileData.pageCount
          );

          console.log(
            "Extracted characters:",
            extractedText.length
          );

          /* -----------------------------------------------
             CHECK EXTRACTION
          ------------------------------------------------ */

          if (!extractedText) {
            console.warn(
              "PDF contains no extractable text."
            );

            return res.status(400).json({
              success: false,

              message:
                "The PDF was uploaded successfully, but no readable text could be extracted. The PDF may contain scanned images instead of selectable text.",
            });
          }
        } catch (pdfError) {
          console.error(
            "PDF extraction error:",
            pdfError
          );

          return res.status(400).json({
            success: false,

            message:
              "The PDF was uploaded, but its text could not be extracted.",
          });
        }
      }

      /* ===================================================
         NON-PDF FILES
      =================================================== */

      if (!isPDF) {
        console.log(
          "Non-PDF attachment received:",
          req.file.originalname
        );

        /*
          At this stage PDF extraction is implemented.

          Other document types can be added later:
          - DOCX
          - TXT
          - CSV
          - Images
        */
      }
    }

    /* =====================================================
       NORMALIZE FLAGS
    ===================================================== */

    const normalizedWebSearch =
      webSearch === true ||
      webSearch === "true";

    const normalizedResearch =
      research === true ||
      research === "true";

    /* =====================================================
       NORMALIZE CONVERSATION
    ===================================================== */

    let chatHistory =
      Array.isArray(conversation)
        ? conversation
        : [];

    /*
      Make sure every message has the format expected
      by aiService.js:

      {
        role: "user" | "assistant",
        content: "..."
      }
    */

    chatHistory = chatHistory
      .filter(
        (item) =>
          item &&
          typeof item.content ===
            "string" &&
          item.content.trim()
      )
      .map((item) => ({
        role:
          item.role ===
          "assistant"
            ? "assistant"
            : "user",

        content:
          item.content.trim(),
      }));

    /* =====================================================
       ADD CURRENT USER MESSAGE
    ===================================================== */

    chatHistory.push({
      role: "user",

      content:
        message.trim(),
    });

    /* =====================================================
       CONNECTED APP
    ===================================================== */

    const normalizedConnectedApp =
      connectedApp
        ? {
            id:
              connectedApp.id ||
              null,

            name:
              connectedApp.name ||
              null,

            icon:
              connectedApp.icon ||
              null,
          }
        : null;

    /* =====================================================
       LOG REQUEST
    ===================================================== */

    console.log(
      "\n================================="
    );

    console.log(
      "CHAT REQUEST"
    );

    console.log(
      "================================="
    );

    console.log(
      "Message:",
      message.trim()
    );

    console.log(
      "Conversation messages:",
      chatHistory.length
    );

    console.log(
      "Web Search:",
      normalizedWebSearch
    );

    console.log(
      "Research:",
      normalizedResearch
    );

    console.log(
      "Connected App:",
      normalizedConnectedApp
    );

    console.log(
      "File:",
      fileData
        ? fileData.name
        : "No file"
    );

    console.log(
      "================================="
    );

    /* =====================================================
       AI OPTIONS
    ===================================================== */

    const aiOptions = {
      webSearch:
        normalizedWebSearch,

      research:
        normalizedResearch,

      connectedApp:
        normalizedConnectedApp,

      file:
        fileData,
    };

    /* =====================================================
       SEND TO AI SERVICE
    ===================================================== */

    console.log(
      "Sending request to AI service..."
    );

    const aiResponse =
      await generateAIResponse(
        chatHistory,
        aiOptions
      );

    /* =====================================================
       NORMALIZE AI RESPONSE
    ===================================================== */

    const finalMessage =
      typeof aiResponse ===
        "string"
        ? aiResponse
        : aiResponse?.message ||
          "I couldn't generate a response.";

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    console.log(
      "AI response generated successfully."
    );

    return res.status(200).json({
      success: true,

      data: {
        message:
          finalMessage,
      },

      file: fileData
        ? {
            name:
              fileData.name,

            type:
              fileData.type,

            size:
              fileData.size,

            pageCount:
              fileData.pageCount,

            extractedCharacters:
              fileData.text
                ? fileData.text.length
                : 0,

            extractedTextAvailable:
              Boolean(
                fileData.text
              ),
          }
        : null,
    });
  } catch (error) {
    /* =====================================================
       ERROR HANDLING
    ===================================================== */

    console.error(
      "\n================================="
    );

    console.error(
      "CHAT CONTROLLER ERROR"
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
      "Name:",
      error?.name ||
        "Unknown error"
    );

    console.error(
      "Stack:",
      error?.stack ||
        "No stack available"
    );

    console.error(
      "================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Something went wrong while processing your request.",
    });
  } finally {
    /* =====================================================
       DELETE TEMPORARY UPLOADED FILE
    ===================================================== */

    if (uploadedFilePath) {
      try {
        await fs.unlink(
          uploadedFilePath
        );

        console.log(
          "Temporary uploaded file deleted."
        );
      } catch (deleteError) {
        console.error(
          "Failed to delete temporary file:",
          deleteError?.message
        );
      }
    }
  }
};