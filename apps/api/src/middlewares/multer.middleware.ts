import multer from "multer";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";

const uploadTempDir = join(tmpdir(), "nexora-uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    mkdir(uploadTempDir, { recursive: true })
      .then(() => cb(null, uploadTempDir))
      .catch((error: Error) => cb(error, uploadTempDir));
  },

  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
