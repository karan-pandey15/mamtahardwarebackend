const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createSunmica,
  getAllSunmica,
  updateSunmica,
  deleteSunmica,
} = require("../controllers/sunmica.controller");

// ✅ Ensure uploads directory exists using an absolute path
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// ✅ Multer Config (Allow up to 200MB per image)
const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB per file
    fieldSize: 200 * 1024 * 1024, // ensure form-data fields can also be large
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

// ✅ Upload middleware with friendly error handling
const uploadImages = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      const message =
        err instanceof multer.MulterError ? err.message : err.message || "File upload failed";
      return res.status(400).json({ success: false, message });
    }
    return next();
  });
};

router.post("/", uploadImages, createSunmica);
router.get("/", getAllSunmica);
router.put("/:id", updateSunmica);
router.delete("/:id", deleteSunmica);

module.exports = router;
