const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `resume-${uniqueSuffix}${safeExt}`);
  },
});

// File filter (extension & declared MIME)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) && file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF documents are allowed.');
    error.status = 415;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024, // 5MB default
  },
  fileFilter,
});

// Magic bytes validation for PDF (%PDF -> 0x25 0x50 0x44 0x46)
const validatePdfMagicBytes = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;

  try {
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    const isPdfMagic =
      buffer[0] === 0x25 && // %
      buffer[1] === 0x50 && // P
      buffer[2] === 0x44 && // D
      buffer[3] === 0x46;   // F

    if (!isPdfMagic) {
      // Clean up fraudulent file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(415).json({
        success: false,
        message: 'File failed signature validation. The uploaded file is not a valid PDF document.',
      });
    }

    next();
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.status(400).json({
      success: false,
      message: 'Failed to verify file integrity.',
    });
  }
};

module.exports = {
  uploadResumeFile: upload.single('resume'),
  validatePdfMagicBytes,
};
