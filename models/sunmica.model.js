const mongoose = require("mongoose");

const sunmicaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true },
    images: [{ type: String }], // array of image URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sunmica", sunmicaSchema);
