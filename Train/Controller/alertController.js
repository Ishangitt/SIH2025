const Alert = require('../Models/AlertModel');
const mongoose = require('mongoose');

// Get all alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
};

// Create new alert
exports.createAlert = async (req, res) => {
  try {
    const { title, description, severity, location } = req.body;
    const newAlert = new Alert({
      title,
      description,
      severity,
      location,
      timestamp: new Date()
    });
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(400).json({ message: 'Error creating alert', error: error.message });
  }
};

// Mark alert as resolved
exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving alert', error: error.message });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await Alert.findByIdAndDelete(id);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert', error: error.message });
  }
};