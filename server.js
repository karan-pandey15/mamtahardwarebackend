const express = require("express");
const mongoose = require("mongoose");
 const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
// const coinHistoryCtrl = require('../controllers/coinHistory.controller');
const coinHistoryCtrl = require('./controllers/coinHistory.controller');
const app = express();
 
app.use(
  cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static images (for uploaded Sunmica files)
// app.use("/uploads", express.static("uploads"));

// ✅ Allow big body payloads (for JSON + form-data)
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Existing Routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/points", require("./routes/point.routes"));

// ✅ New Sunmica route
app.use("/api/sunmica", require("./routes/sunmica.routes"));

// gift routes 
app.use('/api/gift', require('./routes/gift.routes') );
 

// coin history 
 app.use('/api/coin-history', require('./routes/coinHistory.routes'));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

 