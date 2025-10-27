const path = require("path");
const Sunmica = require("../models/sunmica.model");

// Create new Sunmica entry
exports.createSunmica = async (req, res) => {
  try {
    const { name, points, description, category } = req.body;
    const files = req.files || [];

    // Normalize file paths for consistent URLs served from /uploads
    const images = files.map((file) => path.posix.join("uploads", file.filename));

    const sunmica = new Sunmica({
      name,
      points,
      description,
      category,
      images,
    });

    await sunmica.save();
    res.status(201).json({ success: true, data: sunmica });
  } catch (err) {
    console.error("❌ Error creating Sunmica:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all entries
exports.getAllSunmica = async (req, res) => {
  try {
    const sunmicaList = await Sunmica.find().sort({ createdAt: -1 });
    res.status(200).json(sunmicaList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Update Sunmica
exports.updateSunmica = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Sunmica.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Sunmica
exports.deleteSunmica = async (req, res) => {
  try {
    const id = req.params.id;
    await Sunmica.findByIdAndDelete(id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
