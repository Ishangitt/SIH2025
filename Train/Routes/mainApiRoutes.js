const express = require("express");
const router = express.Router();

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

const { generateRankings } = require("../Controller/rankingController");
const { registerUser, loginUser } = require("../Controller/userController");

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