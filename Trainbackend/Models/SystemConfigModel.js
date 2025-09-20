const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema(
  {
    avgFleetMileage: {
      type: Number,
      required: true,
      default: 0,
    },
    availableCleaningSlots: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.SystemConfig || mongoose.model("SystemConfig", systemConfigSchema);