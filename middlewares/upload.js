const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const uploadFiles = (fields) => {
  return upload.fields(fields);
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const MAX_FILES = 5;

const DRAWING_FORMATS = {
  ".pdf": "PDF",
  ".dwg": "DWG",
  ".dxf": "DXF",
  ".jpg": "JPG",
  ".jpeg": "JPG",
  ".png": "PNG",
};

const getDrawingFormat = (fileName) =>
  DRAWING_FORMATS[path.extname(fileName || "").toLowerCase()] || null;

const drawingUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (getDrawingFormat(file.originalname)) return cb(null, true);
    const err = new Error("Only PDF, DWG, DXF, JPG and PNG files are allowed");
    err.code = "INVALID_FILE_TYPE";
    cb(err);
  },
}).fields([{ name: "drawings", maxCount: MAX_FILES }]);


const uploadDrawings = (req, res, next) => {
  drawingUpload(req, res, (err) => {
    if (!err) return next();

    let message = err.message;
    if (err.code === "LIMIT_FILE_SIZE") message = "Each file must be 5 MB or smaller";
    else if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE")
      message = `You can upload at most ${MAX_FILES} files, in the 'drawings' field`;

    if (err instanceof multer.MulterError || err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({ success: false, message });
    }
    return next(err);
  });
};

module.exports = {
  upload,
  uploadFiles,
  uploadDrawings,
  getDrawingFormat,
};