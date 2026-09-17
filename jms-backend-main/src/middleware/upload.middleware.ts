import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env';
import { securityConfig } from '../config/security';
import { BadRequestError } from '../errors';

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_PATH);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${crypto.randomUUID()}${ext}`;
    cb(null, safeFilename);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (securityConfig.uploads.blockedExtensions.includes(ext)) {
    return cb(new BadRequestError(`File extension '${ext}' is strictly forbidden.`) as any, false);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new BadRequestError(`Invalid file format '${file.mimetype}'. Only JPEG, PNG, and WEBP images are allowed.`) as any, false);
  }

  cb(null, true);
};

export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
  fileFilter,
}).single('image');
