const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const linkRoutes = require("./routes/linkRoutes");

dotenv.config();
connectDB();

const app = express();

const cors = require("cors");

// Middleware
app.use(cors()); // allow all origins
app.use(express.json());


// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/links", linkRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to LinkHub API 🌐");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
