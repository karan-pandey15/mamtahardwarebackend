const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createSunmica,
  getAllSunmica,
  updateSunmica,
  deleteSunmica,
} = require("../controllers/sunmica.controller");

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// ✅ Multer Config (Allow up to 50MB per image)
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB each
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

router.post("/", upload.array("images", 5), createSunmica);
router.get("/", getAllSunmica);
router.put("/:id", updateSunmica);
router.delete("/:id", deleteSunmica);

module.exports = router;
