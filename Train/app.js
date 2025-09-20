const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const connectDB = require("./Config/dbConnection");
const mainApiRoutes = require('./Routes/mainApiRoutes');
require("dotenv").config();

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};

// --- Middleware ---
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// --- Routes ---
// The main API routes are mounted at the /api endpoint.
app.use('/api', mainApiRoutes);

// --- Basic Welcome Route ---
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Train Management API!",
  });
});

// --- Catch-all 404 handler ---
// This middleware must be placed after all other routes to catch unmatched requests.
app.use((req, res) => {
  res.status(404).json({
    message: `Requested URL not found:`,
    errName: "Error",
  });
});

// --- Server Activation ---
const PORT = 4080;

const startServer = async () => {
  try {
    // Assuming connectDB() establishes a connection to your MongoDB database.
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
  }
};

startServer();