// models/coinHistory.model.js
const mongoose = require('mongoose');

const coinHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["earn", "spend"], required: true },
  coins: { type: Number, required: true },
  reason: { type: String },
  date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('CoinHistory', coinHistorySchema);
