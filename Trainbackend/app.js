// app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const connectDB = require("./Config/dbConnection"); // Assuming db connection is in config folder
const mainApiRoutes = require('./Routes/mainApiRoutes');
require("dotenv").config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// --- Routes ---
app.use('/api', mainApiRoutes);

// --- Basic Welcome Route ---
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Train Management API!",
  });
});

// --- Generic Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// --- Server Activation ---
const PORT = process.env.PORT || 8080;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database", error);
    }
};

startServer();