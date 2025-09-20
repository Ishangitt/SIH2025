const express = require("express");
const routerrouter.post("/trains/generate-ranking", generateRankings);

// User management routes
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Alert management routes
router.get("/alerts", getAllAlerts);
router.post("/alerts", createAlert);
router.put("/alerts/:id/resolve", resolveAlert);
router.delete("/alerts/:id", deleteAlert);

// Analytics routes
router.get("/analytics/passengers", async (req, res) => {
  try {
    // Sample data - replace with actual database queries
    const stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];
    const loads = stations.map(() => Math.floor(Math.random() * 1000));
    
    res.json({
      stations,
      loads,
      totalPassengers: loads.reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching passenger data' });
  }
});

router.get("/analytics/traffic", async (req, res) => {
  try {
    const days = Array.from({length: 30}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleDateString();
    });
    
    const data = days.map(() => Math.floor(Math.random() * 5000) + 1000);
    
    res.json({
      labels: days,
      data,
      totalTraffic: data.reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching traffic data' });
  }
});

router.get("/analytics/performance", async (req, res) => {
  try {
    res.json({
      uptime: 99.98,
      responseTime: 238,
      reliability: 98.5,
      activeTrains: 42,
      delays: {
        none: 85,
        minor: 12,
        major: 3
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance data' });
  }
});

module.exports = router;express.Router();

const {
  editTrain,
  addTrain,
  updateCleaningSlots,
  getCleaningSlots,
  updateMaintenance,
  getMaintenanceStatus,
  getTrains,
  getTrainsById,
} = require("../Controller/trainController");

const {
  getDashboardStats,
  getLiveSchedule
} = require("../Controller/dashboardController");

const { generateRankings } = require("../Controller/rankingController");
const { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} = require("../Controller/userController");
const {
  getAllAlerts,
  createAlert,
  resolveAlert,
  deleteAlert
} = require("../Controller/alertController");

router.post("/users/register", registerUser);
router.post("/users/login", loginUser);

router.post("/trains/add", addTrain);
router.put("/trains/edit/:id", editTrain);
router.get("/trains/all", getTrains);
router.get("/trains/:id", getTrainsById);

router.get("/config/cleaning", getCleaningSlots);
router.put("/config/cleaning", updateCleaningSlots);

router.get("/trains/maintenance", getMaintenanceStatus);
router.put("/trains/maintenance", updateMaintenance);

router.post("/trains/generate-ranking", generateRankings);

module.exports = router;