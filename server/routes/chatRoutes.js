import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { chat } from "../controllers/chatController.js";

const router = express.Router();

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
  process.cwd(),
  "uploads"
);

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ======================================================
// MULTER STORAGE CONFIGURATION
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

// ======================================================
// ALLOWED FILE TYPES
// ======================================================

const allowedMimeTypes = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
  storage,

  limits: {
    // Maximum file size: 10 MB
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (
      allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Unsupported file type. Please upload PDF, TXT, DOC, or DOCX."
      )
    );
  },
});

// ======================================================
// CHAT ROUTE
// ======================================================
//
// POST /api/chat
//
// Supports:
// - Normal chat
// - Web search
// - Research
// - Connected applications
// - File attachments
//
// Frontend must send the attachment using:
// FormData field name: "file"
// ======================================================

router.post(
  "/",
  upload.single("file"),
  chat
);

// ======================================================
// MULTER ERROR HANDLER
// ======================================================
//
// Handles:
// - File too large
// - Unsupported file type
// - Other upload errors
// ======================================================

router.use(
  (error, req, res, next) => {
    if (!error) {
      return next();
    }

    console.error(
      "File upload error:",
      error
    );

    // File size exceeded
    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File is too large. Maximum allowed size is 10 MB.",
      });
    }

    // Other multer/file validation errors
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "File upload failed.",
    });
  }
);

export default router;