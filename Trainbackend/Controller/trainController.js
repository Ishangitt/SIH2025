const Train = require("../models/SimpleTrainModel");
const SystemConfig = require("../Models/SystemConfigModel");

const updateAverageMileage = async () => {
  try {
    const allTrains = await Train.find({});
    let newAverage = 0;
    if (allTrains && allTrains.length > 0) {
      const totalMileage = allTrains.reduce(
        (sum, train) => sum + train.mileage,
        0
      );
      newAverage = totalMileage / allTrains.length;
    }
    await SystemConfig.findOneAndUpdate(
      {},
      { avgFleetMileage: newAverage },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error updating average mileage:", error.message);
  }
};

const editTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTrain = await Train.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTrain) {
      return res.status(404).json({ message: "Train not found." });
    }
    await updateAverageMileage();
    res.status(200).json({ message: "Train updated successfully", train: updatedTrain });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating train", error: error.message });
  }
};

const addTrain = async (req, res) => {
  try {
    const existingTrain = await Train.findOne({ trainId: req.body.trainId });
    if (existingTrain) {
      return res.status(409).json({ message: `Train with ID '${req.body.trainId}' already exists.` });
    }
    const newTrain = new Train(req.body);
    const savedTrain = await newTrain.save();
    await updateAverageMileage();
    res.status(201).json({ message: "Train added successfully", train: savedTrain });
  } catch (error) {
    res.status(500).json({ message: "Server error while adding train", error: error.message });
  }
};

const updateCleaningSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    if (slots === undefined) {
      return res.status(400).json({ message: "Slots value must be provided." });
    }
    const config = await SystemConfig.findOneAndUpdate(
      {},
      { availableCleaningSlots: slots },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Train cleaning slots updated.", config });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating cleaning slots.", error: error.message });
  }
};

const getCleaningSlots = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({});
    const slots = config ? config.availableCleaningSlots : 0;
    res.status(200).json({ availableCleaningSlots: slots });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching cleaning slots.", error: error.message });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const { trainUpdates } = req.body;
    if (!trainUpdates || !Array.isArray(trainUpdates) || trainUpdates.length === 0) {
      return res.status(400).json({ message: "Invalid request: 'trainUpdates' must be a non-empty array." });
    }
    const updatePromises = trainUpdates.map((update) => {
      const fieldsToUpdate = {};
      if (update.fitnessCertificates !== undefined) {
        fieldsToUpdate.fitnessCertificates = update.fitnessCertificates;
      }
      if (update.jobCardStatus !== undefined) {
        fieldsToUpdate.jobCardStatus = update.jobCardStatus;
      }
      return Train.findByIdAndUpdate(update.id, { $set: fieldsToUpdate });
    });
    await Promise.all(updatePromises);
    res.status(200).json({ message: "Maintenance status for all specified trains updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating maintenance status.", error: error.message });
  }
};

const getMaintenanceStatus = async (req, res) => {
  try {
    const trains = await Train.find().select("trainId fitnessCertificates jobCardStatus");
    res.status(200).json({ trains });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching maintenance status.", error: error.message });
  }
};

const getTrains = async (req, res) => {
  try {
    const trains = await Train.find();
    res.status(200).json({ trains });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  editTrain,
  addTrain,
  updateCleaningSlots,
  getCleaningSlots,
  updateMaintenance,
  getMaintenanceStatus,
  getTrains,
};