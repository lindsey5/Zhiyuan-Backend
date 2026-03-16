import { NextFunction, Request, Response } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 11
  }
});

export const handleMulterError = (err : any, req : Request, res : Response, next : NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new Error('File size exceeds the 5MB limit'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new Error('Too many files. Maximum is 10 images'));
    }
    return next(new Error(`File upload error: ${err.message}`));
  }

  next(err);
};

export const productUploads = upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "variant_images", maxCount: 10 },
])